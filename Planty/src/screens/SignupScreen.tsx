import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../components/Input';
import BtnLong from '../components/BtnLong';

export default function SignUpScreen({ navigation }: any) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');


  const handleSignUp = async () => {
  if (!isFormValid) {
    Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
    return;
  }

  try {
    const response = await fetch('http://43.200.244.250/api/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: id,
        password: password,
        nickname: nickname,
      }),
    });

    const data = await response.json();

    if (response.status === 201 || response.status === 200) {
      // 회원가입 성공
      Alert.alert('회원가입 성공', '회원가입이 완료되었습니다.');
      navigation.navigate('Login');
    } else {
      // 서버에서 에러 메시지 내려줌
      Alert.alert('회원가입 실패', data.message || '알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('네트워크 오류', '서버와 연결할 수 없습니다.');
  }
};


  
  const isFormValid = id && password && nickname;

  // 아이디 입력
const handleIdChange = (text: string) => {
  const englishOnly = text.replace(/[^a-zA-Z0-9]/g, '');
  setId(englishOnly);
};

// 비밀번호 입력
const handlePasswordChange = (text: string) => {
  const englishOnly = text.replace(/[^a-zA-Z0-9]/g, '');
  setPassword(englishOnly);
};


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>회원가입</Text>

        <Text style={styles.label}>닉네임</Text>
        <Input 
          value={nickname} 
          onChangeText={setNickname}
          placeholder="닉네임 입력"
          inputType="text"
          style={styles.input}
        />

        <Text style={styles.label}>아이디</Text>
        <Input 
          value={id} 
          onChangeText={handleIdChange}
          placeholder="아이디 입력"
          inputType="text"
          style={styles.input}
        />

        <Text style={styles.label}>비밀번호</Text>
        <Input 
          value={password} 
          onChangeText={handlePasswordChange}
          placeholder="비밀번호 입력"
          inputType="text"
          style={styles.input}
        />
      </View>

      <BtnLong
        label="확인"
        onPress={handleSignUp}
        style={[
          styles.button,
          { backgroundColor: isFormValid ? '#7EB85B' : '#D6D6D6' },
        ]}
        disabled={!isFormValid} 
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop:40,
    marginBottom: 40,
    textAlign: 'left',
  },
  label: {
    fontSize: 16,
    color: '#444',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 48,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: 4,
    marginBottom:40,
  },
});
