import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../components/Input';
import BtnLong from '../components/BtnLong';

export default function SignUpScreen({ navigation }: any) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSignUp = () => {
    if (id && password && nickname) {
      Alert.alert('회원가입 성공', '회원가입이 완료되었습니다.');
      navigation.navigate('Login');
    }
  };

  
  const isFormValid = id && password && nickname;

  // 아이디 입력
const handleIdChange = (text: string) => {
  const englishOnly = text.replace(/[^a-zA-Z]/g, ''); // 영어 알파벳만 남김
  setId(englishOnly);
};

// 비밀번호 입력
const handlePasswordChange = (text: string) => {
  const englishOnly = text.replace(/[^a-zA-Z]/g, '');
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
  },
});
