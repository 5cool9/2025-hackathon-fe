import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text>채팅 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center' }
});
