import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MypageScreen() {
  return (
    <View style={styles.container}>
      <Text>마이페이지 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center' }
});
