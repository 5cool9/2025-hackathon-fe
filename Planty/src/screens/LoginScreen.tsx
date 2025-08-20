import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import Logo from '../../assets/img/img_logo.svg';
import Input from '../components/Input';
import BtnLong from '../components/BtnLong';

export default function LoginScreen({ navigation }: any) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = () => {
  if (id && password) {
    // 팝업 없이 바로 AppStack으로 이동
    navigation.reset({
      index: 0,
      routes: [{ name: 'AppStack' }],
    });
  } else {
    Alert.alert('로그인 실패', '아이디와 비밀번호를 입력해주세요.');
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo width={215} height={60} />
      </View>

      <View style={styles.form}>
        <Input 
          value={id} 
          onChangeText={setId}
          placeholder="아이디" 
          inputType="text" 
          style={{ height: 48 }} 
        />
        <Input 
          value={password} 
          onChangeText={setPassword}
          placeholder="비밀번호 입력" 
          inputType="password" 
          iconName="eye" 
          style={{ height: 48 }} 
        />

        <BtnLong
          label="로그인"
          onPress={handleLogin}
          style={styles.button} 
        />

        <TouchableOpacity
          style={styles.signupContainer}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.signupText}>회원가입</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  logoContainer: {
    marginTop: 126, 
    alignItems: 'center', 
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 64, // 로고 아래 여백
  },
  button: {
    width: '100%', 
    height: 54,
    marginTop: 20,
  },
  signupContainer: {
    marginTop: 10, 
    alignSelf: 'center',
  },
  signupText: {
    color: '#222', // 원하는 색상
    fontSize: 16,
    fontWeight: 600,
  },
});
