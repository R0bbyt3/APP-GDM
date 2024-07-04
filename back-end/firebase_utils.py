import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime 
from utils import convert_to_float

# Inicializar o Firebase
cred = credentials.Certificate("firebase_credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

DEBUG = True  # Define se o modo de debug está ativo ou não

def debug_log(message):
    if DEBUG:
        print(f"DEBUG: {message}")

def check_and_add_school_year(ano_escolar):
    """
    Verifica se o ano escolar já existe no Firestore.
    Se não existir, adiciona um novo ano escolar.

    Args:
        ano_escolar (str): Ano escolar a ser verificado.

    Returns:
        str: ID do documento do ano escolar.
    """
    debug_log(f"Verificando ano escolar {ano_escolar}")
    ano_escolar_ref = db.collection('Ano_Escola').where('ano_escola', '==', ano_escolar).limit(1).get()
    if ano_escolar_ref:
        debug_log(f"Ano escolar {ano_escolar} já existe. ID: {ano_escolar_ref[0].id}")
        return ano_escolar_ref[0].id
    else:
        debug_log(f"Ano escolar {ano_escolar} não encontrado. Adicionando novo ano escolar.")
        ano_escolar_data = {'ano_escola': ano_escolar, 'ano_atual': datetime.now().year}
        ano_escolar_doc = db.collection('Ano_Escola').add(ano_escolar_data)
        debug_log(f"Ano escolar {ano_escolar} adicionado com ID: {ano_escolar_doc[1].id}")
        return ano_escolar_doc[1].id
    
def check_and_add_user(login, senha, ano_escolar_id):
    """
    Verifica se o usuário já existe no Firestore. 
    Se não existir, adiciona um novo usuário.

    Args:
        login (str): Login do usuário.
        senha (str): Senha do usuário.
        ano_escolar_id (str): ID do ano escolar associado ao usuário.

    Returns:
        bool: True se o usuário foi adicionado, False se já existia.
    """
    debug_log(f"Verificando usuário {login}")
    user_ref = db.collection('Usuario').document(login)
    user_doc = user_ref.get()
    if not user_doc.exists:
        debug_log(f"Usuário {login} não encontrado. Adicionando novo usuário.")
        user_data = {'id': login, 'senha': senha, 'ano_escola_id': ano_escolar_id}
        user_ref.set(user_data)
        return True
    debug_log(f"Usuário {login} já existe.")
    return False

def save_to_firestore(login, materia_nome, boletim, titulo, peso, maximo, nota_valor, media_atual, ano_escolar_id, periodo):
    """
    Salva várias informações no Firestore, incluindo matéria, trimestre, componentes, nota e média.

    Args:
        login (str): Login do usuário.
        materia_nome (str): Nome da matéria.
        boletim (str): Descrição do boletim.
        titulo (str): Título do componente.
        peso (float): Peso do componente.
        maximo (float): Nota máxima do componente.
        nota_valor (float): Valor da nota.
        media_atual (float): Média atual da matéria.
        ano_escolar_id (str): ID do ano escolar associado.
        periodo (str): Período associado à nota.
    """
    debug_log(f"Salvando informações no Firestore para usuário {login}")

    # Adicionar/Verificar Matéria
    debug_log(f"Verificando matéria {materia_nome}")
    materia_ref = db.collection('Materia').document(materia_nome)
    if not materia_ref.get().exists:
        debug_log(f"Matéria {materia_nome} não encontrada. Adicionando nova matéria.")
        materia_ref.set({'nome': materia_nome, 'ano_escola_id': ano_escolar_id})

    # Adicionar/Verificar Trimestre
    debug_log(f"Verificando boletim {boletim}")
    trimestre_ref = db.collection('Trimestre').document(boletim)
    if not trimestre_ref.get().exists:
        debug_log(f"Boletim {boletim} não encontrado. Adicionando novo boletim.")
        trimestre_ref.set({'descricao': boletim})

    # Adicionar/Verificar Componente
    componente_data = {
        'materia_id': materia_ref.id,
        'trimestre_id': trimestre_ref.id,
        'titulo': titulo,
        'peso': peso,
        'maximo': maximo
    }
    componente_ref = db.collection('Componente_Materia').document(f'{materia_nome}_{titulo}')
    if not componente_ref.get().exists:
        debug_log(f"Componente {titulo} da matéria {materia_nome} não encontrado. Adicionando novo componente.")
        componente_ref.set(componente_data)

    # Adicionar Nota
    nota_data = {
        'usuario_id': login,
        'componente_materia_id': componente_ref.id,
        'nota': nota_valor,
        'periodo': periodo  # Adicionando o período à nota
    }
    nota_ref = db.collection('Nota').document(f'{login}_{componente_ref.id}_{periodo}')
    debug_log(f"Adicionando nota para o usuário {login} no componente {titulo} da matéria {materia_nome}")
    nota_ref.set(nota_data)

    # Adicionar Média Atual
    media_ref = db.collection('Media_Atual').document(f'{materia_nome}_{boletim}')
    media_data = {
        'materia_id': materia_ref.id,
        'trimestre_id': trimestre_ref.id,
        'media': convert_to_float(media_atual)
    }
    debug_log(f"Adicionando média atual para a matéria {materia_nome} no boletim {boletim}")
    media_ref.set(media_data)

def get_ano_escola_id(login):
    """
    Obtém o ID do ano escolar associado ao login do usuário.

    Args:
        login (str): Login do usuário.

    Returns:
        str: ID do ano escolar ou None se não encontrado.
    """
    debug_log(f"Obtendo ano_escola_id para o usuário {login}")
    try:
        user_ref = db.collection('Usuario').document(login)
        user_doc = user_ref.get()
        if user_doc.exists:
            ano_escola_id = user_doc.to_dict()['ano_escola_id']
            debug_log(f"ano_escola_id para o usuário {login}: {ano_escola_id}")
            return ano_escola_id
        else:
            debug_log(f"Usuário {login} não encontrado.")
            return None
    except Exception as e:
        debug_log(f"Erro ao obter ano_escola_id para o usuário {login}: {e}")
        return None

def get_periodos_materias(ano_escola_id):
    """
    Obtém os períodos (trimestres) e matérias associados ao ano escolar.

    Args:
        ano_escola_id (str): ID do ano escolar.

    Returns:
        tuple: Dicionário de trimestres e dicionário de matérias.
    """
    debug_log(f"Obtendo períodos e matérias para ano_escola_id {ano_escola_id}")
    try:
        trimestres_ref = db.collection('Trimestre').stream()
        trimestres = {doc.id: doc.to_dict()['descricao'] for doc in trimestres_ref}
        debug_log(f"Trimestres obtidos: {trimestres}")

        materias_ref = db.collection('Materia').where('ano_escola_id', '==', ano_escola_id).stream()
        materias = {doc.id: doc.to_dict()['nome'] for doc in materias_ref}
        debug_log(f"Matérias obtidas: {materias}")

        return trimestres, materias
    except Exception as e:
        debug_log(f"Erro ao obter períodos e matérias: {e}")
        return None, None

def get_componentes_materia(materia_id):
    """
    Obtém os componentes de uma matéria específica.

    Args:
        materia_id (str): ID da matéria.

    Returns:
        dict: Dicionário de componentes da matéria.
    """
    debug_log(f"Obtendo componentes da matéria {materia_id}")
    try:
        componentes_ref = db.collection('Componente_Materia').where('materia_id', '==', materia_id).stream()
        componentes = {doc.id: doc.to_dict() for doc in componentes_ref}
        debug_log(f"Componentes obtidos: {componentes}")
        return componentes
    except Exception as e:
        debug_log(f"Erro ao obter componentes da matéria {materia_id}: {e}")
        return None

def get_notas_aluno(usuario_id):
    """
    Obtém as notas de um aluno específico.

    Args:
        usuario_id (str): ID do usuário.

    Returns:
        dict: Dicionário de notas do aluno, agrupadas por período.
    """
    debug_log(f"Obtendo notas para o usuário {usuario_id}")
    try:
        notas_ref = db.collection('Nota').where('usuario_id', '==', usuario_id).stream()
        notas = {}
        for doc in notas_ref:
            nota_data = doc.to_dict()
            periodo = nota_data.get('periodo')
            if periodo not in notas:
                notas[periodo] = []
            notas[periodo].append(nota_data)
        debug_log(f"Notas obtidas: {notas}")
        return notas
    except Exception as e:
        debug_log(f"Erro ao obter notas do aluno {usuario_id}: {e}")
        return None

