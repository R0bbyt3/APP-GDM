import React, { useState } from 'react';
import { StyleSheet, View, Button, TextInput, Text, Alert, ScrollView } from 'react-native';
import axios from 'axios';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [anoEscolar, setAnoEscolar] = useState('');
  const [anoAtual, setAnoAtual] = useState('');
  const [data, setData] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.1.9:5000/login', { login, senha });
      if (response.data.success) {
        setData(response.data.data);
        setScreen('dashboard');
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
      const response = await axios.post('http://192.168.1.9:5000/create_account', { login, senha, ano_escolar: anoEscolar, ano_atual: anoAtual });
      Alert.alert('Info', response.data.message);
      if (response.data.success) {
        setScreen('login');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar conta.');
      console.error('Error creating account: ', error);
    }
  };

  const handleUpdateInfo = async () => {
    try {
      const response = await axios.post('http://192.168.1.9:5000/update_info', { login, senha, ano_escolar: anoEscolar, ano_atual: anoAtual });
      Alert.alert('Info', response.data.message);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar informações.');
      console.error('Error updating info: ', error);
    }
  };

  const renderData = () => {
    if (!data) return null;

    return data.map((item, index) => (
      <View key={index} style={styles.dataItem}>
        <Text style={styles.dataTitle}>Componente: {item.componente_materia_id}</Text>
        <Text>Nota: {item.nota}</Text>
        <Text>Usuário: {item.usuario_id}</Text>
      </View>
    ));
  };

  if (screen === 'login') {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Usuário"
          value={login}
          onChangeText={setLogin}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        <Button title="Login" onPress={handleLogin} />
        <Button title="Criar Conta" onPress={() => setScreen('createAccount')} />
      </View>
    );
  }

  if (screen === 'createAccount') {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Usuário"
          value={login}
          onChangeText={setLogin}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Ano Escolar"
          value={anoEscolar}
          onChangeText={setAnoEscolar}
        />
        <TextInput
          style={styles.input}
          placeholder="Ano Atual"
          value={anoAtual}
          onChangeText={setAnoAtual}
        />
        <Button title="Criar Conta" onPress={handleCreateAccount} />
        <Button title="Voltar ao Login" onPress={() => setScreen('login')} />
      </View>
    );
  }

  if (screen === 'dashboard') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bem-vindo, {login}</Text>
        <Button title="Atualizar Informações" onPress={handleUpdateInfo} />
        <ScrollView style={styles.scrollView}>
          {renderData()}
        </ScrollView>
        <Button title="Sair" onPress={() => setScreen('login')} />
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    marginVertical: 20,
    width: '100%',
  },
  dataItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  dataTitle: {
    fontWeight: 'bold',
  },
});
