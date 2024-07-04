import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import LoginScreen from './LoginScreen';
import Dashboard from './Dashboard';

const DEBUG = process.env.DEBUG === 'true'; // Variável para habilitar/desabilitar debug

export default function App() {
  const [screen, setScreen] = useState('login'); // Estado para controlar a tela atual
  const [login, setLogin] = useState(''); // Estado para armazenar o login
  const [senha, setSenha] = useState(''); // Estado para armazenar a senha
  const [userData, setUserData] = useState(null); // Estado para armazenar os dados do usuário
  const [csrfToken, setCsrfToken] = useState(''); // Estado para armazenar o token CSRF

  const serverIp = '192.168.1.9'; // IP do servidor
  const serverPort = '5000'; // Porta do servidor

  useEffect(() => {
    // Obtém o token CSRF quando o componente é montado
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(`http://${serverIp}:${serverPort}/csrf-token`, { withCredentials: true });
        setCsrfToken(response.data.csrf_token);
      } catch (error) {
        DEBUG && console.error('Erro ao obter CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  /**
   * Função para lidar com o login
   */
  const handleLogin = async () => {
    try {
      DEBUG && console.log('Tentando fazer login com:', { login, senha });
      const response = await axios.post(`http://${serverIp}:${serverPort}/login`, { login, senha }, {
        headers: {
          'X-CSRFToken': csrfToken
        },
        withCredentials: true
      });
      if (response.data.success) {
        DEBUG && console.log('Login bem-sucedido:', response.data);
        const userDataResponse = await axios.post(`http://${serverIp}:${serverPort}/get_user_data`, { login }, {
          headers: {
            'X-CSRFToken': csrfToken
          },
          withCredentials: true
        });
        if (userDataResponse.data.status === "success") {
          DEBUG && console.log('Dados do usuário obtidos com sucesso:', userDataResponse.data);
          setUserData(userDataResponse.data);
          setScreen('dashboard');
        } else {
          DEBUG && console.error('Erro ao obter dados do usuário:', userDataResponse.data.message);
          Alert.alert('Erro', `Erro ao obter dados do usuário: ${userDataResponse.data.message}`);
        }
      } else {
        DEBUG && console.error('Erro ao fazer login:', response.data.message);
        Alert.alert('Erro', `Erro ao fazer login: ${response.data.message}`);
      }
    } catch (error) {
      DEBUG && console.error('Erro ao fazer login:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Verifique sua conexão e tente novamente.');
    }
  };

  /**
   * Função para lidar com a criação de conta
   */
  const handleCreateAccount = async () => {
    try {
      DEBUG && console.log('Tentando criar conta com:', { login, senha });
      const response = await axios.post(`http://${serverIp}:${serverPort}/create_account`, { login, senha }, {
        headers: {
          'X-CSRFToken': csrfToken
        },
        withCredentials: true
      });
      Alert.alert('Info', response.data.message);
      if (response.data.success) {
        setScreen('login');
      }
    } catch (error) {
      DEBUG && console.error('Erro ao criar conta:', error);
      Alert.alert('Erro', 'Erro ao criar conta. Verifique sua conexão e tente novamente.');
    }
  };

  /**
   * Função para lidar com a atualização de informações
   */
  const handleUpdateInfo = async () => {
    try {
      DEBUG && console.log('Tentando atualizar informações com:', { login, senha });
      const response = await axios.post(`http://${serverIp}:${serverPort}/update_info`, { login, senha }, {
        headers: {
          'X-CSRFToken': csrfToken
        },
        withCredentials: true
      });
      Alert.alert('Info', response.data.message);
      if (response.data.success) {
        const userDataResponse = await axios.post(`http://${serverIp}:${serverPort}/get_user_data`, { login }, {
          headers: {
            'X-CSRFToken': csrfToken
          },
          withCredentials: true
        });
        if (userDataResponse.data.success) {
          DEBUG && console.log('Dados do usuário atualizados com sucesso:', userDataResponse.data);
          setUserData(userDataResponse.data);
        }
      }
    } catch (error) {
      DEBUG && console.error('Erro ao atualizar informações:', error);
      Alert.alert('Erro', 'Erro ao atualizar informações. Verifique sua conexão e tente novamente.');
    }
  };

  // Renderiza a tela de login ou criação de conta
  if (screen === 'login' || screen === 'createAccount') {
    return (
      <LoginScreen
        login={login}
        setLogin={setLogin}
        senha={senha}
        setSenha={setSenha}
        handleLogin={handleLogin}
        handleCreateAccount={handleCreateAccount}
        setScreen={setScreen}
        screen={screen}
      />
    );
  }

  // Renderiza a tela do dashboard
  if (screen === 'dashboard') {
    return (
      <Dashboard
        login={login}
        userData={userData}
        setScreen={setScreen}
        handleUpdateInfo={handleUpdateInfo}
      />
    );
  }

  // Renderiza nada se a tela não for reconhecida
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    width: 300,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
