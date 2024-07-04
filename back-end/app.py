from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from firebase_utils import (
    check_and_add_school_year,
    check_and_add_user,
    get_ano_escola_id,
    get_periodos_materias,
    get_componentes_materia,
    get_notas_aluno,
    db
)
from selenium_utils import init_driver, perform_login, extract_grades

app = Flask(__name__)
CORS(app)

# Configuração do logger
logging.basicConfig(level=logging.INFO)

# Variável para controle de debug
DEBUG_MODE = True

def debug_log(message):
    """Função para logs de depuração detalhados"""
    if DEBUG_MODE:
        logging.info(message)

# Ajuste na rota de criação de conta (app.py ou no arquivo de rotas correspondente)
@app.route('/create_account', methods=['POST'])
def create_account():
    data = request.json
    login = data.get('login')
    senha = data.get('senha')

    debug_log(f"Dados recebidos para criar conta: login={login}")

    driver = init_driver()

    try:
        debug_log("Iniciando processo de criação de conta...")
        ano_escolar = perform_login(driver, login, senha)
        debug_log(f"Credenciais válidas, procedendo com a criação de conta com ano escolar: {ano_escolar}")

        ano_escolar_id = check_and_add_school_year(ano_escolar)
        debug_log(f"Ano escolar ID obtido: {ano_escolar_id}")

        if check_and_add_user(login, senha, ano_escolar_id):
            data = extract_grades(driver, login, ano_escolar_id)
            message = "Conta criada com sucesso, notas extraídas e salvas."
            success = True
            debug_log("Conta criada e dados extraídos com sucesso.")
        else:
            message = "Conta já existe."
            success = False
            data = None
            debug_log("Conta já existe no sistema.")
    except Exception as e:
        message = f"Erro: {e}"
        success = False
        data = None
        logging.error(f"Erro durante a criação de conta: {e}")
    finally:
        driver.quit()

    return jsonify({"success": success, "message": message, "data": data})


# Rota para login
@app.route('/login', methods=['POST'])
def login_route():
    data = request.json
    login = data.get('login')
    senha = data.get('senha')

    debug_log(f"Tentativa de login com: login={login}")

    try:
        user_ref = db.collection('Usuario').document(login)
        user_doc = user_ref.get()
        if user_doc.exists and user_doc.to_dict()['senha'] == senha:
            message = "Login bem-sucedido."
            success = True
            ano_escola_id = user_doc.to_dict()['ano_escola_id']
            debug_log(f"Login bem-sucedido para usuário: {login}, ano_escola_id: {ano_escola_id}")
        else:
            message = "Usuário ou senha inválidos."
            success = False
            ano_escola_id = None
            debug_log("Usuário ou senha inválidos.")
    except Exception as e:
        message = f"Erro: {e}"
        success = False
        ano_escola_id = None
        logging.error(f"Erro durante o login: {e}")

    return jsonify({"success": success, "message": message, "ano_escola_id": ano_escola_id})

# Rota para atualizar informações
@app.route('/update_info', methods=['POST'])
def update_info():
    data = request.json
    login = data.get('login')
    senha = data.get('senha')
    ano_escolar = data.get('ano_escolar')
    ano_atual = data.get('ano_atual')

    debug_log(f"Iniciando atualização de informações para: login={login}, ano_escolar={ano_escolar}, ano_atual={ano_atual}")

    driver = init_driver()

    try:
        debug_log("Iniciando processo de atualização de informações...")
        perform_login(driver, login, senha)
        debug_log("Login bem-sucedido, redirecionado para a página principal...")

        ano_escolar_id = check_and_add_school_year(ano_escolar, ano_atual)
        debug_log(f"Ano escolar ID obtido: {ano_escolar_id}")

        data = extract_grades(driver, login, ano_escolar_id)
        message = "Informações atualizadas com sucesso."
        success = True
        debug_log("Informações atualizadas com sucesso.")
    except Exception as e:
        message = f"Erro: {e}"
        success = False
        data = None
        logging.error(f"Erro durante a atualização de informações: {e}")
    finally:
        driver.quit()

    return jsonify({"success": success, "message": message, "data": data})

# Rota para obter dados completos do usuário
@app.route('/get_user_data', methods=['POST'])
def get_user_data():
    data = request.json
    login = data.get('login')

    debug_log(f"Obtendo dados completos para o usuário: {login}")

    try:
        user_ref = db.collection('Usuario').document(login)
        user_doc = user_ref.get()
        if user_doc.exists:
            ano_escola_id = user_doc.to_dict()['ano_escola_id']
            trimestres, materias = get_periodos_materias(ano_escola_id)
            notas = get_notas_aluno(login)
            debug_log(f"Dados obtidos para o usuário {login}: trimestres={trimestres}, materias={materias}, notas={notas}")
            return jsonify({"success": True, "trimestres": trimestres, "materias": materias, "notas": notas})
        else:
            debug_log("Usuário não encontrado.")
            return jsonify({"success": False, "message": "Usuário não encontrado."})
    except Exception as e:
        logging.error(f"Erro ao obter dados do usuário: {e}")
        return jsonify({"success": False, "message": f"Erro: {e}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=DEBUG_MODE)
