from flask import Flask, request, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import firebase_admin
from firebase_admin import credentials, firestore
import logging

app = Flask(__name__)
CORS(app)

# Inicializar o Firebase
cred = credentials.Certificate("firebase_credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Configuração do logger
logging.basicConfig(level=logging.INFO)

# Variável para controle de debug
DEBUG_MODE = True

# Função para encontrar link pelo texto
def find_link_by_text(driver, text):
    return driver.find_element(By.XPATH, f"//a[contains(text(), '{text}')]")

# Função para inicializar o WebDriver
def init_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Função para realizar login no site
def perform_login(driver, login, senha):
    driver.get('https://www.escola1.info/cruzeiro/')
    WebDriverWait(driver, 30).until(EC.presence_of_element_located((By.ID, 'txtLogin'))).send_keys(login)
    driver.find_element(By.ID, 'txtSenha').send_keys(senha)
    driver.find_element(By.ID, 'LinkButton3').click()
    WebDriverWait(driver, 30).until(EC.url_contains("site/Principal"))

# Função para verificar e adicionar ano escolar no Firestore
def check_and_add_school_year(ano_escolar, ano_atual):
    ano_escolar_ref = db.collection('Ano_Escola').where('ano_escola', '==', ano_escolar).where('ano_atual', '==', ano_atual).limit(1).get()
    if ano_escolar_ref:
        return ano_escolar_ref[0].id
    else:
        ano_escolar_data = {'ano_escola': ano_escolar, 'ano_atual': ano_atual}
        ano_escolar_doc = db.collection('Ano_Escola').add(ano_escolar_data)
        return ano_escolar_doc[1].id

# Função para verificar e adicionar usuário no Firestore
def check_and_add_user(login, senha, ano_escolar_id):
    user_ref = db.collection('Usuario').document(login)
    user_doc = user_ref.get()
    if not user_doc.exists:
        user_data = {'id': login, 'senha': senha, 'ano_escola_id': ano_escolar_id}
        user_ref.set(user_data)
        return True
    return False

# Função para converter strings com vírgula para float
def convert_to_float(value):
    try:
        return float(value.replace(',', '.'))
    except ValueError:
        return None

# Função para navegar até a página do boletim e extrair notas
def extract_grades(driver, login, ano_escolar_id):
    boletim_base_url = 'https://www.escola1.info/site/Servicos/Essencial/Boletim/BoletimNovo.asp'
    driver.get(boletim_base_url)
    WebDriverWait(driver, 30).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'a.SubNotas')))
    
    boletins = ['NPT', 'NST', 'NTT']
    data = []
    for boletim in boletins:
        try:
            link = find_link_by_text(driver, boletim)
            onclick_value = link.get_attribute("onclick")
            link_code = onclick_value.split("param=")[1].split('&')[0]
            boletim_url = f'https://www.escola1.info/site/Servicos/Essencial/Boletim/BoletimParcial.asp?param={link_code}'
            driver.get(boletim_url)
            WebDriverWait(driver, 30).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'table[name="Conteudo"]')))
            
            boletim_data = extract_subject_data(driver, login, ano_escolar_id, boletim)
            data.append(boletim_data)
            driver.get(boletim_base_url)
        except Exception as e:
            if DEBUG_MODE:
                logging.warning(f"Falha ao extrair notas do boletim {boletim}: {e}")
            driver.get(boletim_base_url)
    return data

# Função para extrair dados das matérias e notas
def extract_subject_data(driver, login, ano_escolar_id, boletim):
    materias = driver.find_elements(By.CSS_SELECTOR, 'table.Tab1Grade[id="NOTA"]')
    boletim_data = []
    for materia in materias:
        materia_titulo = materia.find_element(By.CSS_SELECTOR, 'td[class="Tab1Titulo"]').text
        materia_nome = " ".join(materia_titulo.split(" - ")[1:-1])
        
        calculo = materia.find_element(By.CSS_SELECTOR, 'td[class="Tab1subTitulo"]').text
        
        componentes = materia.find_elements(By.CSS_SELECTOR, 'td[class="Tab3TituloCol"]')
        notas = materia.find_elements(By.CSS_SELECTOR, 'td[class="Tab1Texto"]')

        media_atual = notas[-1].text.strip()  # Captura a média atual
        componentes = componentes[:-1]  # Remove a última coluna (média)
        notas = notas[:-1]  # Remove a última nota (média)

        materia_data = {
            "materia_nome": materia_nome,
            "calculo": calculo,
            "componentes": []
        }

        for comp, nota in zip(componentes, notas):
            componente_info = comp.get_attribute("title").split('\n')
            titulo = componente_info[0]
            peso = convert_to_float(componente_info[1].split(':')[1])
            maximo = convert_to_float(componente_info[2].split(':')[1])
            componente_id = comp.text.strip()
            nota_valor = convert_to_float(nota.text.strip()) if nota.text.strip() else -1

            componente_data = {
                'titulo': titulo,
                'peso': peso,
                'maximo': maximo,
                'nota': nota_valor
            }

            save_to_firestore(login, materia_nome, boletim, titulo, peso, maximo, nota_valor, media_atual, ano_escolar_id)
            materia_data["componentes"].append(componente_data)
        
        boletim_data.append(materia_data)

    return boletim_data

# Função para salvar dados no Firestore
def save_to_firestore(login, materia_nome, boletim, titulo, peso, maximo, nota_valor, media_atual, ano_escolar_id):
    materia_ref = db.collection('Materia').document(materia_nome)
    if not materia_ref.get().exists:
        materia_ref.set({'nome': materia_nome, 'ano_escola_id': ano_escolar_id})

    trimestre_ref = db.collection('Trimestre').document(boletim)
    if not trimestre_ref.get().exists:
        trimestre_ref.set({'descricao': boletim})

    componente_data = {
        'materia_id': materia_ref.id,
        'trimestre_id': trimestre_ref.id,
        'titulo': titulo,
        'peso': peso,
        'maximo': maximo
    }
    componente_ref = db.collection('Componente_Materia').document(f'{materia_nome}_{titulo}')
    if not componente_ref.get().exists:
        componente_ref.set(componente_data)

    nota_data = {
        'usuario_id': login,
        'componente_materia_id': componente_ref.id,
        'nota': nota_valor
    }
    nota_ref = db.collection('Nota').document(f'{login}_{componente_ref.id}')
    nota_ref.set(nota_data)

    media_ref = db.collection('Media_Atual').document(f'{materia_nome}_{boletim}')
    media_data = {
        'materia_id': materia_ref.id,
        'trimestre_id': trimestre_ref.id,
        'media': convert_to_float(media_atual)
    }
    media_ref.set(media_data)

# Rota para criar conta
@app.route('/create_account', methods=['POST'])
def create_account():
    data = request.json
    login = data.get('login')
    senha = data.get('senha')
    ano_escolar = data.get('ano_escolar')
    ano_atual = data.get('ano_atual')

    driver = init_driver()

    try:
        if DEBUG_MODE:
            logging.info("Iniciando processo de criação de conta...")
        perform_login(driver, login, senha)
        if DEBUG_MODE:
            logging.info("Credenciais válidas, procedendo com a criação de conta...")

        ano_escolar_id = check_and_add_school_year(ano_escolar, ano_atual)
        if check_and_add_user(login, senha, ano_escolar_id):
            data = extract_grades(driver, login, ano_escolar_id)
            message = "Conta criada com sucesso, notas extraídas e salvas."
            success = True
        else:
            message = "Conta já existe."
            success = False
            data = None
    except Exception as e:
        message = f"Erro: {e}"
        success = False
        data = None
        if DEBUG_MODE:
            logging.error(f"Erro: {e}")
    finally:
        driver.quit()

    return jsonify({"success": success, "message": message, "data": data})

# Rota para login
@app.route('/login', methods=['POST'])
def login_route():
    data = request.json
    login = data.get('login')
    senha = data.get('senha')

    try:
        user_ref = db.collection('Usuario').document(login)
        user_doc = user_ref.get()
        if user_doc.exists and user_doc.to_dict()['senha'] == senha:
            message = "Login bem-sucedido."
            success = True
            # Pegar dados do Firestore para enviar ao front-end
            data = []
            notas_ref = db.collection('Nota').where('usuario_id', '==', login).stream()
            for nota in notas_ref:
                data.append(nota.to_dict())
        else:
            message = "Usuário ou senha inválidos."
            success = False
            data = None
    except Exception as e:
        message = f"Erro: {e}"
        success = False
        data = None
        if DEBUG_MODE:
            logging.error(f"Erro: {e}")

    return jsonify({"success": success, "message": message, "data": data})

# Rota para atualizar informações
@app.route('/update_info', methods=['POST'])
def update_info():
    data = request.json
    login = data.get('login')
    senha = data.get('senha')
    ano_escolar = data.get('ano_escolar')
    ano_atual = data.get('ano_atual')

    driver = init_driver()

    try:
        if DEBUG_MODE:
            logging.info("Iniciando processo de atualização de informações...")
        perform_login(driver, login, senha)
        if DEBUG_MODE:
            logging.info("Login bem-sucedido, redirecionado para a página principal...")

        ano_escolar_id = check_and_add_school_year(ano_escolar, ano_atual)
        data = extract_grades(driver, login, ano_escolar_id)
        message = "Informações atualizadas com sucesso."
        success = True
    except Exception as e:
        message = f"Erro: {e}"
        success = False
        data = None
        if DEBUG_MODE:
            logging.error(f"Erro: {e}")
    finally:
        driver.quit()

    return jsonify({"success": success, "message": message, "data": data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=DEBUG_MODE)
