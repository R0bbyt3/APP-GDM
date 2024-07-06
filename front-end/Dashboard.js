import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import Notas from './Notas';
import Info from './Info';

const { height, width } = Dimensions.get('window');

export default function Dashboard({ userData, handleLogout }) {
  const [selectedScreen, setSelectedScreen] = useState('home');
  const [fontsLoaded] = useFonts({
    'IBMPlexMono_400Regular': require('./node_modules/@expo-google-fonts/ibm-plex-mono/IBMPlexMono_400Regular.ttf'),
    'IBMPlexMono_500Medium': require('./node_modules/@expo-google-fonts/ibm-plex-mono/IBMPlexMono_500Medium.ttf'),
    'IBMPlexMono_600SemiBold': require('./node_modules/@expo-google-fonts/ibm-plex-mono/IBMPlexMono_600SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const renderContent = () => {
    switch (selectedScreen) {
      case 'notas':
        return <Notas periodos={userData.trimestres} materias={userData.materias} notas={userData.notas} medias={userData.medias} componentes={userData.componentes} />;
      case 'info':
        return <Info />;
      default:
        return (
          <View style={styles.homeContainer}>
            <Text style={styles.homeText}>Selecione uma opção abaixo</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topOverlay}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.welcomeText}>Bem-Vindo(a),</Text>
            <Text style={styles.userName}>{userData.nome}</Text>
          </View>
          <View style={styles.topBarIcons}>
            <TouchableOpacity>
              <Image source={require('./assets/config.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Image source={require('./assets/sair.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      <View style={styles.bottomOverlay}>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => setSelectedScreen('info')}>
            <Image source={require('./assets/info.png')} style={styles.bottomIcon} />
            <Text style={styles.bottomBarText}>/INFO+/</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => setSelectedScreen('notas')}>
            <Image source={require('./assets/notas.png')} style={styles.bottomIcon} />
            <Text style={styles.bottomBarText}>/NOTAS/</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBarItem} onPress={() => setSelectedScreen('algo')}>
            <Image source={require('./assets/notas.png')} style={styles.bottomIcon} />
            <Text style={styles.bottomBarText}>/ALGO/</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#162025',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: height * 0.15, // 15% da altura da tela
    backgroundColor: '#0F1920',
    justifyContent: 'flex-end',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05, // 5% da largura da tela
    paddingBottom: height * 0.015, // 1.5% da altura da tela
  },
  welcomeText: {
    color: '#CDE4DE',
    fontSize: height * 0.0225, // 2.25% da altura da tela
    fontFamily: 'IBMPlexMono_400Regular',
  },
  userName: {
    color: '#A8B4C2',
    fontSize: height * 0.025, // 2.5% da altura da tela
    fontWeight: 'bold',
    fontFamily: 'IBMPlexMono_600SemiBold',
  },
  topBarIcons: {
    flexDirection: 'row',
  },
  icon: {
    width: width * 0.1, // 10% da largura da tela
    height: width * 0.1, // 10% da largura da tela
    marginLeft: width * 0.04, // 4% da largura da tela
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.05, // 15% da altura da tela
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.12, // 12% da altura da tela
    backgroundColor: '#0F1920',
    justifyContent: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: width * 0.05, // 5% da largura da tela
  },
  bottomBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '30%', // 30% da largura da tela
  },
  bottomIcon: {
    width: width * 0.1, // 10% da largura da tela
    height: width * 0.1, // 10% da largura da tela
    marginBottom: height * 0.01, // 1% da altura da tela
  },
  bottomBarText: {
    color: '#CDE4DE',
    fontSize: height * 0.02, // 2% da altura da tela
    textAlign: 'center',
    fontFamily: 'IBMPlexMono_600SemiBold',
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeText: {
    color: '#CDE4DE',
    fontSize: height * 0.025, // 2.5% da altura da tela
    fontFamily: 'IBMPlexMono_400Regular',
  },
});
