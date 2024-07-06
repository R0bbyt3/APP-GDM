import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import axios from 'axios';
import LoginScreen from './LoginScreen';
import Dashboard from './Dashboard';

const DEBUG = process.env.DEBUG === 'true';

const { height, width } = Dimensions.get('window');

export default function App() {
  const [screen, setScreen] = useState('login');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [userData, setUserData] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');

  const serverIp = '192.168.1.9';
  const serverPort = '5000';

  const [fontsLoaded] = useFonts({
    'IBMPlexMono_400Regular': require('./node_modules/@expo-google-fonts/ibm-plex-mono/IBMPlexMono_400Regular.ttf'),
    'IBMPlexMono_500Medium': require('./node_modules/@expo-google-fonts/ibm-plex-mono/IBMPlexMono_500Medium.ttf'),
    'IBMPlexMono_600SemiBold': require('./node_modules/@expo-google-fonts/ibm-plex-mono/IBMPlexMono_600SemiBold.ttf'),
  });

  useEffect(() => {
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

  useEffect(() => {
    async function hideSplashScreen() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplashScreen();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

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

  const handleLogout = async () => {
    try {
      DEBUG && console.log('Tentando fazer logout');
      const response = await axios.post(`http://${serverIp}:${serverPort}/logout`, {}, {
        headers: {
          'X-CSRFToken': csrfToken
        },
        withCredentials: true
      });
      if (response.data.success) {
        setScreen('login');
        setUserData(null);
        DEBUG && console.log('Logout bem-sucedido');
      } else {
        DEBUG && console.error('Erro ao fazer logout:', response.data.message);
        Alert.alert('Erro', `Erro ao fazer logout: ${response.data.message}`);
      }
    } catch (error) {
      DEBUG && console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Erro ao fazer logout. Verifique sua conexão e tente novamente.');
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
        handleLogout={handleLogout}
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
    padding: width * 0.05,
  },
  input: {
    height: height * 0.05,
    width: width * 0.8,
    margin: height * 0.015,
    borderWidth: 1,
    padding: width * 0.025,
  },
});
