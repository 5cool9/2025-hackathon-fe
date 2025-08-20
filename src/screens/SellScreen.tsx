import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SellScreen() {
  return (
    <View style={styles.container}>
      <Text>판매 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center' }
});
