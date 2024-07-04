import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, ScrollView } from 'react-native';

const DEBUG = process.env.DEBUG === 'true';

export default function Dashboard({ login, userData, setScreen, handleUpdateInfo }) {
  const [periodos, setPeriodos] = useState(userData.trimestres || {});
  const [materias, setMaterias] = useState(userData.materias || {});
  const [notas, setNotas] = useState(userData.notas || {});
  const [medias, setMedias] = useState(userData.medias || {});

  useEffect(() => {
    if (userData) {
      DEBUG && console.log('UserData received:', userData);
      setPeriodos(userData.trimestres);
      setMaterias(userData.materias);
      setNotas(userData.notas);
      setMedias(userData.medias);
    }
  }, [userData]);

  const getPeriodoNome = (id) => {
    switch (id) {
      case 'NPT': return 'Primeiro período';
      case 'NST': return 'Segundo período';
      case 'NTT': return 'Terceiro período';
      default: return id;
    }
  };

  const renderComponentesMateria = (materiaId, periodoId) => {
    const componentesMateria = notas[periodoId]?.filter(nota => nota.componente_materia_id.includes(materiaId)) || [];
    if (componentesMateria.length === 0) return null;

    DEBUG && console.log(`Componentes for ${materiaId} in ${periodoId}:`, componentesMateria);
    return componentesMateria.map((compData, index) => {
      const titulo = compData.componente_materia_id.split('_').slice(2).join('_');
      return (
        <View key={index} style={styles.componenteContainer}>
          <Text style={styles.componenteText}>Título: {titulo}</Text>
          <Text style={styles.componenteText}>
            Nota: {compData.nota === -1 ? 'Não saiu ainda' : compData.nota}
          </Text>
        </View>
      );
    });
  };

  const renderMediaMateria = (materiaId, periodoId) => {
    const media = medias[periodoId]?.[materiaId]?.media || 'Não disponível';
    DEBUG && console.log(`Render media for ${materiaId} in ${periodoId}: ${media}`);
    return (
      <View style={styles.mediaContainer}>
        <Text style={styles.mediaText}>Média: {media}</Text>
      </View>
    );
  };

  const renderData = () => {
    if (!Object.keys(periodos).length || !Object.keys(materias).length) return null;

    return (
      <View>
        {Object.entries(periodos).map(([periodoId, descricao]) => (
          <View key={periodoId} style={styles.periodoContainer}>
            <Text style={styles.periodoTitle}>{getPeriodoNome(periodoId)}</Text>
            {Object.entries(materias).map(([materiaId, nome]) => (
              <View key={materiaId} style={styles.materiaContainer}>
                <Text style={styles.materiaText}>{nome}</Text>
                {renderComponentesMateria(materiaId, periodoId)}
                {renderMediaMateria(materiaId, periodoId)}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scrollView: {
    marginVertical: 20,
    width: '100%',
  },
  periodoContainer: {
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  periodoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  materiaContainer: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  materiaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  componenteContainer: {
    marginBottom: 5,
    marginLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#ddd',
    paddingLeft: 10,
  },
  componenteText: {
    fontSize: 14,
    color: '#333',
  },
  mediaContainer: {
    marginTop: 10,
    paddingLeft: 10,
  },
  mediaText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
