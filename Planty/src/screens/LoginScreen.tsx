// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import Logo from '../../assets/img/img_logo.svg';
import Input from '../components/Input';
import BtnLong from '../components/BtnLong';
import axios from 'axios';
import { setAccessToken } from '../utils/token';

const BASE_URL = 'http://43.200.244.250';

export default function LoginScreen({ navigation }: any) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!id || !password) {
      Alert.alert('로그인 실패', '아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/login`,
        { userId: id, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // 1) 액세스 토큰 확보
      const token = response.headers['authorization']?.split(' ')[1];
      if (!token) {
        Alert.alert('로그인 실패', '토큰이 없습니다.');
        return;
      }

      // 2) 토큰 저장 및 axios 기본 헤더 설정
      setAccessToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 3) 성공 이동
      navigation.reset({ index: 0, routes: [{ name: 'AppStack' }] });
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (!status || !data) {
        Alert.alert('로그인 실패', '알 수 없는 오류가 발생했습니다.');
        return;
      }

      if (status === 401 && data.code === 'INVALID_CREDENTIALS') {
        Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.');
      } else if (status === 400 && data.code === 'INVALID_JSON') {
        Alert.alert('로그인 실패', '요청 형식이 올바르지 않습니다.');
      } else if (status === 405 && data.code === 'METHOD_NOT_ALLOWED') {
        Alert.alert('로그인 실패', '지원하지 않는 요청입니다.');
      } else {
        Alert.alert('로그인 실패', data.message || '알 수 없는 오류');
      }
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

        <BtnLong label="로그인" onPress={handleLogin} style={styles.button} />

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
  container: { flex: 1, backgroundColor: '#fff' },
  logoContainer: { marginTop: 186, alignItems: 'center' },
  form: { flex: 1, paddingHorizontal: 20, marginTop: 64 },
  button: { width: '100%', height: 54, marginTop: 20 },
  signupContainer: { marginTop: 10, alignSelf: 'center' },
  signupText: { color: '#222', fontSize: 16, fontWeight: '600' as any },
});
