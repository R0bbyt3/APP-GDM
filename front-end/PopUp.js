import React from 'react';
import { View, Text, Modal, StyleSheet, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

const PopUp = ({ visible, onClose, materia }) => {
  if (!materia) return null;

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Cálculo: {materia.calculo}</Text>
          <View style={styles.componentList}>
            {materia.componentes.map((componente, index) => (
              <View key={index} style={styles.componenteItem}>
                <Text style={styles.componenteText}>{componente.pequeno_nome}: {componente.nota}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.closeButton} onPress={onClose}>Fechar</Text>
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
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: height * 0.03,
    marginBottom: 10,
  },
  componentList: {
    width: '100%',
  },
  componenteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  componenteText: {
    fontSize: height * 0.02,
  },
  closeButton: {
    marginTop: 20,
    fontSize: height * 0.02,
    color: 'blue',
  },
});

export default PopUp;
