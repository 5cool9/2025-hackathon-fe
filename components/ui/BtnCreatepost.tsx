 import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  onPress?: () => void;
};

export default function CircleIconButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Image source={require('@/assets/icon/iconPlus.png')} style={styles.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 40,
    backgroundColor: '#7EB85B', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 5, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 32,  
    height: 32,
    resizeMode: 'contain',
  },
});
