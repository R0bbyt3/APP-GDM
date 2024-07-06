import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';

const { height, width } = Dimensions.get('window');

const periodosMap = {
  'NPT': 'Primeiro Período',
  'NST': 'Segundo Período',
  'NTT': 'Terceiro Período'
};

const visaoGeralColors = ['#9AA8B3', '#87949D', '#9AA8B3'];

export default function Notas({ periodos, materias, notas, componentes }) {
  const [expandedPeriodos, setExpandedPeriodos] = useState([]);
  const [expandedMaterias, setExpandedMaterias] = useState({});
  const [animations, setAnimations] = useState({});
  const [materiaAnimations, setMateriaAnimations] = useState({});

  const togglePeriodo = (periodoId) => {
    const isExpanded = expandedPeriodos.includes(periodoId);
  
    if (isExpanded) {
      setExpandedPeriodos(expandedPeriodos.filter(id => id !== periodoId));
      setExpandedMaterias({});
  
      // Resetar as animações das matérias
      const newMateriaAnimations = {};
      Object.keys(materias).forEach(materiaId => {
        newMateriaAnimations[materiaId] = new Animated.Value(0);
      });
      setMateriaAnimations(newMateriaAnimations);
    } else {
      setExpandedPeriodos([...expandedPeriodos, periodoId]);
    }
  
    const animation = animations[periodoId];
    if (animation) {
      Animated.timing(animation, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      const newAnimation = new Animated.Value(isExpanded ? 1 : 0);
      setAnimations({
        ...animations,
        [periodoId]: newAnimation,
      });
      Animated.timing(newAnimation, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };
  

  const toggleMateria = (materiaId) => {
    const isExpanded = expandedMaterias[materiaId] || false;

    setExpandedMaterias({
      ...expandedMaterias,
      [materiaId]: !isExpanded
    });

    const animation = materiaAnimations[materiaId];
    if (animation) {
      Animated.timing(animation, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      const newAnimation = new Animated.Value(isExpanded ? 1 : 0);
      setMateriaAnimations({
        ...materiaAnimations,
        [materiaId]: newAnimation,
      });
      Animated.timing(newAnimation, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderVisaoGeral = (materiaId, periodoId) => {
    const notasMateria = notas[periodoId]?.filter(nota => nota.componente_materia_id.includes(materiaId)) || [];
    const somaNotas = notasMateria.reduce((total, nota) => total + (nota.nota !== -1 ? nota.nota : 0), 0);
    const totalLancado = notasMateria.reduce((total, nota) => total + (nota.nota !== -1 ? componentes[nota.componente_materia_id].maximo : 0), 0);
    const mediaRelativa = totalLancado ? ((somaNotas / totalLancado) * 100).toFixed(1) : 'N/A';

    return (
      <View style={styles.componenteItem}>
        <Text style={styles.componenteText}>Visão Geral</Text>
        {['Soma das Notas', 'Total Lançado', 'Média Relativa'].map((label, index) => (
          <View key={index} style={[styles.notaWrapper, { backgroundColor: visaoGeralColors[index % visaoGeralColors.length] }]}>
            <View style={styles.notaContainer}>
              <Text style={styles.notaLabel}>{label}</Text>
              <Text style={styles.notaValue}>
                {label === 'Soma das Notas' ? `${somaNotas.toFixed(1)} Pontos` :
                 label === 'Total Lançado' ? `${totalLancado.toFixed(1)} Pontos` :
                 `${mediaRelativa} de 100`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderComponentes = (materiaId, periodoId) => {
    if (!expandedMaterias[materiaId]) return null;

    const componentesMateria = notas[periodoId]?.filter(nota => nota.componente_materia_id.includes(materiaId)) || [];

    return (
      <View style={styles.componentesContainer}>
        {renderVisaoGeral(materiaId, periodoId)}
        {componentesMateria.map((componente, index) => {
          const componenteInfo = componentes[componente.componente_materia_id] || {};
          const maximo = componenteInfo.maximo || 0;
          const notaBruta = componente.nota !== -1 ? componente.nota.toFixed(1) : 'N/A';
          const notaConvertida = maximo && componente.nota !== -1 ? ((componente.nota / maximo) * 100).toFixed(1) : 'N/A';

          return (
            <View key={index} style={styles.componenteItem}>
              <Text style={styles.componenteText}>{componenteInfo.titulo || 'Título não disponível'}</Text>
              <View style={styles.notaWrapperBruta}>
                <View style={styles.notaContainer}>
                  <Text style={styles.notaLabel}>Bruta</Text>
                  <Text style={styles.notaValue}>{notaBruta} de {maximo}</Text>
                </View>
              </View>
              <View style={styles.notaWrapperConvertida}>
                <View style={styles.notaContainer}>
                  <Text style={styles.notaLabel}>Convertida</Text>
                  <Text style={styles.notaValue}>{notaConvertida} de 100</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderMaterias = (periodoId) => {
    if (!expandedPeriodos.includes(periodoId)) return null;

    return (
      <View style={styles.materiasContainer}>
        {Object.keys(materias).map((materiaId, index) => {
          const rotate = materiaAnimations[materiaId]?.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          }) || '0deg';

          return (
            <View key={materiaId} style={[
                styles.materiaItem,
                expandedMaterias[materiaId] ? styles.materiaItemExpanded : (index % 2 === 0 ? styles.materiaItemEven : styles.materiaItemOdd),
                { marginBottom: -1 }
              ]}>
              <View style={styles.materiaHeader}>
                <Text style={[styles.materiaText, index % 2 === 0 ? styles.materiaTextEven : styles.materiaTextOdd]}>{materias[materiaId]}</Text>
                <View style={styles.materiaIcons}>
                  <TouchableOpacity onPress={() => toggleMateria(materiaId)}>
                    <Animated.Image source={index % 2 === 0 ? require('./assets/seta_even.png') : require('./assets/seta_odd.png')} style={[styles.icon, { transform: [{ rotate }] }]} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Image source={index % 2 === 0 ? require('./assets/ac_even.png') : require('./assets/ac_odd.png')} style={[styles.icon, styles.iconRight]} />
                  </TouchableOpacity>
                </View>
              </View>
              {renderComponentes(materiaId, periodoId)}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
        {Object.keys(periodos).map((periodoId) => {
          const rotate = animations[periodoId]?.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '90deg'],
          }) || '0deg';

          return (
            <View key={periodoId} style={styles.periodoItem}>
              <TouchableOpacity onPress={() => togglePeriodo(periodoId)} style={styles.periodoHeader}>
                <Animated.Image source={require('./assets/barras.png')} style={[styles.barrasIcon, { transform: [{ rotate }] }]} />
                <Text style={styles.periodoText}>{periodosMap[periodoId] || periodos[periodoId]}</Text>
              </TouchableOpacity>
              {renderMaterias(periodoId)}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    marginTop: '40%',
    marginBottom: '5%',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: '5%',
    paddingBottom: height * 0.3,
  },
  periodoItem: {
    width: '90%',
    marginVertical: '2%',
    borderRadius: 10,
    backgroundColor: '#A8B4C2',
  },
  periodoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '5%',
    paddingHorizontal: '5%',
  },
  barrasIcon: {
    width: width * 0.08,
    height: width * 0.08,
    marginRight: '5%',
  },
  periodoText: {
    fontSize: height * 0.0275,
    color: '#0F1920',
    fontFamily: 'IBMPlexMono_600SemiBold',
  },
  materiasContainer: {
    paddingHorizontal: '0%',
  },
  materiaItem: {
    width: '100%',
    paddingVertical: '8%',
    paddingHorizontal: '5%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    marginBottom: -1,
  },
  materiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  materiaItemEven: {
    backgroundColor: '#1C3847',
  },
  materiaItemOdd: {
    backgroundColor: '#A8B4C2',
  },
  materiaItemExpanded: {
    backgroundColor: '#0C0C0C',
  },
  materiaText: {
    fontSize: height * 0.025,
    fontFamily: 'IBMPlexMono_500Medium',
  },
  materiaTextEven: {
    color: '#A8B4C2',
  },
  materiaTextOdd: {
    color: '#1C3847',
  },
  materiaIcons: {
    flexDirection: 'row',
  },
  icon: {
    width: width * 0.08,
    height: width * 0.08,
  },
  iconRight: {
    marginLeft: width * 0.1,
  },
  componentesContainer: {
    width: '100%',
    paddingVertical: '2%',
    paddingHorizontal: '5%',
  },
  componenteItem: {
    backgroundColor: '#A8B4C2',
    paddingVertical: '4%',
    paddingHorizontal: '5%',
    marginVertical: '1%',
    borderRadius: 10,
  },
  componenteText: {
    fontSize: height * 0.025,
    fontFamily: 'IBMPlexMono_600SemiBold',
    color: '#0F1920',
    textAlign: 'center',
    padding: '2%',
  },
  notaWrapper: {
    borderRadius: 10,
    padding: '2%',
    marginBottom: '2%',
  },
  notaWrapperBruta: {
    backgroundColor: '#9AA8B3',
    borderRadius: 10,
    padding: '2%',
    marginBottom: '2%',
  },
  notaWrapperConvertida: {
    backgroundColor: '#87949D',
    borderRadius: 10,
    padding: '2%',
    marginBottom: '2%',
  },
  notaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  notaLabel: {
    fontSize: height * 0.022,
    fontFamily: 'IBMPlexMono_500Medium',
    color: '#0F1920',
    textAlign: 'left',
  },
  notaValue: {
    fontSize: height * 0.022,
    fontFamily: 'IBMPlexMono_500Medium',
    color: '#0F1920',
    textAlign: 'right',
  },
});
