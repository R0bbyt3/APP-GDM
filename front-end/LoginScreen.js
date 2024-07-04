import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, Text } from 'react-native';

// Variável de debug
const DEBUG = process.env.DEBUG === 'true';

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
  const [errors, setErrors] = useState({});

  /**
   * Função de validação dos campos de login e senha
   * @returns {boolean} true se os campos forem válidos, false caso contrário
   */
  const validate = () => {
    let valid = true;
    let errors = {};

    // Validação do usuário (login)
    const trimmedLogin = login.trim();
    if (trimmedLogin.length !== 8 || isNaN(trimmedLogin)) {
      valid = false;
      errors.login = 'O usuário deve ser numérico e conter 8 caracteres';
      DEBUG && console.log('Erro de validação no login:', errors.login); // Debug log
    }

    // Validação da senha
    if (senha.length < 4 || senha.length > 25) {
      valid = false;
      errors.senha = 'A senha deve ter entre 4 e 25 caracteres';
      DEBUG && console.log('Erro de validação na senha:', errors.senha); // Debug log
    }

    setErrors(errors);
    return valid;
  };

  /**
   * Função de submissão que valida os campos antes de executar a ação
   * @param {function} action - Função a ser executada se a validação for bem-sucedida
   */
  const handleSubmit = (action) => {
    if (validate()) {
      DEBUG && console.log('Validação bem-sucedida, executando ação'); // Debug log
      action();
    } else {
      DEBUG && console.log('Validação falhou, exibindo alerta'); // Debug log
      Alert.alert('Erro', 'Verifique os campos e tente novamente');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, errors.login && styles.errorInput]}
        placeholder="Usuário"
        value={login}
        onChangeText={setLogin}
      />
      {errors.login && <Text style={styles.errorText}>{errors.login}</Text>}
      <TextInput
        style={[styles.input, errors.senha && styles.errorInput]}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}
      {screen === 'login' && (
        <Button title="Login" onPress={() => handleSubmit(handleLogin)} />
      )}
      {screen === 'createAccount' && (
        <>
          <Button title="Criar Conta" onPress={() => handleSubmit(handleCreateAccount)} />
          <Button title="Voltar ao Login" onPress={() => setScreen('login')} />
        </>
      )}
      {screen === 'login' && (
        <Button title="Criar Conta" onPress={() => setScreen('createAccount')} />
      )}
    </View>
  );
}

// Estilos para os componentes
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
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
