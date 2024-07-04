import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import LoginScreen from './LoginScreen';
import Dashboard from './Dashboard';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [userData, setUserData] = useState(null);

  const serverIp = '192.168.1.9';
  const serverPort = '5000';

  const handleLogin = async () => {
    try {
      const response = await axios.post(`http://${serverIp}:${serverPort}/login`, { login, senha });
      if (response.data.success) {
        const userDataResponse = await axios.post(`http://${serverIp}:${serverPort}/get_user_data`, { login });
        if (userDataResponse.data.success) {
          setUserData(userDataResponse.data);
          setScreen('dashboard');
        } else {
          Alert.alert('Erro', userDataResponse.data.message);
        }
      } else {
        Alert.alert('Erro', response.data.message);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer login.');
      console.error('Error logging in: ', error);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const response = await axios.post(`http://${serverIp}:${serverPort}/create_account`, { login, senha });
      Alert.alert('Info', response.data.message);
      if (response.data.success) {
        setScreen('login');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar conta.');
      console.error('Error creating account: ', console.error('Error creating account: ', error));
    }
  };

  const handleUpdateInfo = async () => {
    try {
      const response = await axios.post(`http://${serverIp}:${serverPort}/update_info`, { login, senha });
      Alert.alert('Info', response.data.message);
      if (response.data.success) {
        const userDataResponse = await axios.post(`http://${serverIp}:${serverPort}/get_user_data`, { login });
        if (userDataResponse.data.success) {
          setUserData(userDataResponse.data);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar informações.');
      console.error('Error updating info: ', error);
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

