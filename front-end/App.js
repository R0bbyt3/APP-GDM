import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import LoginScreen from './LoginScreen';
import Dashboard from './Dashboard';

const DEBUG = process.env.DEBUG === 'true';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [userData, setUserData] = useState(null);

  const serverIp = '192.168.1.9';
  const serverPort = '5000';

  const handleLogin = async () => {
    try {
      DEBUG && console.log('Tentando fazer login com:', { login, senha });
      const response = await axios.post(`http://${serverIp}:${serverPort}/login`, { login, senha });
      if (response.data.success) {
        DEBUG && console.log('Login bem-sucedido:', response.data);
        const userDataResponse = await axios.post(`http://${serverIp}:${serverPort}/get_user_data`, { login });
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

  const handleCreateAccount = async () => {
    try {
      DEBUG && console.log('Tentando criar conta com:', { login, senha });
      const response = await axios.post(`http://${serverIp}:${serverPort}/create_account`, { login, senha });
      Alert.alert('Info', response.data.message);
      if (response.data.success) {
        setScreen('login');
      }
    } catch (error) {
      DEBUG && console.error('Erro ao criar conta:', error);
      Alert.alert('Erro', 'Erro ao criar conta. Verifique sua conexão e tente novamente.');
    }
  };

  const handleUpdateInfo = async () => {
    try {
      DEBUG && console.log('Tentando atualizar informações com:', { login, senha });
      const response = await axios.post(`http://${serverIp}:${serverPort}/update_info`, { login, senha });
      Alert.alert('Info', response.data.message);
      if (response.data.success) {
        const userDataResponse = await axios.post(`http://${serverIp}:${serverPort}/get_user_data`, { login });
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
