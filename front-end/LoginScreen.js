import React from 'react';
import { StyleSheet, View, TextInput, Button } from 'react-native';

export default function LoginScreen({
  login,
  setLogin,
  senha,
  setSenha,
  handleLogin,
  handleCreateAccount,
  setScreen,
  screen
}) { 
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
      {screen === 'login' && (
        <Button title="Login" onPress={handleLogin} />
      )}
      {screen === 'createAccount' && (
        <>
          <Button title="Criar Conta" onPress={handleCreateAccount} />
          <Button title="Voltar ao Login" onPress={() => setScreen('login')} />
        </>
      )}
      {screen === 'login' && (
        <Button title="Criar Conta" onPress={() => setScreen('createAccount')} />
      )}
    </View>
  );
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
