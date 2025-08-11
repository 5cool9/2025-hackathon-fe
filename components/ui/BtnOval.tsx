import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface BtnOvalProps {
  label: string; 
  onPress?: () => void;
}

export default function BtnOval({ label, onPress }: BtnOvalProps) {
  const [selected, setSelected] = useState(false);

  const handlePress = () => {
    setSelected(!selected);
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, selected ? styles.enabled : styles.disabled]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={selected ? styles.textEnabled : styles.textDisabled}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 9,
    paddingHorizontal: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30, 
    borderWidth: 1,
    borderColor: '#D6D6D6',
    marginTop: 10,
  },
  enabled: {
    backgroundColor: '#7EB85B', 
    borderWidth: 1,
    borderColor: '#7EB85B',
  },
  disabled: {
    backgroundColor: '#F5F5F5', 
    borderWidth: 1,
    borderColor: '#D6D6D6',
  },
  textEnabled: {
    color: '#fff', 
    fontWeight: '500',
    fontSize: 16,
  },
  textDisabled: {
    color: '#000', 
    fontWeight: '500',
    fontSize: 16,
  },
});
