import React from 'react';
import { View, Text, Modal, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';

const { height, width } = Dimensions.get('window');

const splitCalculo = (calculo) => {
  if (!calculo) return null; // Adiciona verificação para evitar erro

  const tokens = calculo.split(/([+\*/])/).filter(Boolean);
  const result = [];

  tokens.forEach((item, index) => {
    if (item.includes('(') || item.includes(')')) {
      result.push(
        <Text key={`${index}-paren`} style={styles.calculoText}>
          {item.trim()}
        </Text>
      );
    } else {
      result.push(
        <Text key={index} style={styles.calculoText}>
          {item.trim()}
        </Text>
      );
    }
  });

  return result;
};

const PopUp = ({ visible, onClose, materia }) => {
  if (!materia) return null;

  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButtonContainer} onPress={onClose}>
            <Image source={require('./assets/x.png')} style={styles.closeButton} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Cálculo</Text>
          <Text style={styles.materiaNome}>{materia.nome}</Text>
          <View style={styles.calculoContainer}>
            {splitCalculo(materia.calculo)}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.8,
    padding: width * 0.05,
    backgroundColor: '#A8B4C2',
    borderRadius: width * 0.05,
    alignItems: 'center',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: height * 0.02,
    right: height * 0.02,
  },
  closeButton: {
    width: width * 0.08,
    height: width * 0.08,
  },
  modalTitle: {
    fontSize: height * 0.03,
    marginBottom: height * 0.02,
    fontFamily: 'IBMPlexMono_500Medium',
  },
  materiaNome: {
    fontSize: height * 0.025,
    marginBottom: height * 0.02,
    fontFamily: 'IBMPlexMono_500Medium',
  },
  calculoContainer: {
    alignItems: 'center',
  },
  calculoText: {
    fontSize: height * 0.025,
    fontFamily: 'IBMPlexMono_500Medium',
  },
});

export default PopUp;
