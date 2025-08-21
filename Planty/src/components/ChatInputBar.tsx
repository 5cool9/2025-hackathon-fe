// src/components/ChatInputBar.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import IconSend from '../../assets/icon/icon_send.svg';
import IconPlus from '../../assets/icon/icon_plus.svg';

type ChatInputBarProps = {
  onSendText?: (text: string) => void;
  onSendImage?: (uri: string) => void;
};

export default function ChatInputBar({ onSendText, onSendImage }: ChatInputBarProps) {
  const [text, setText] = useState('');

  // 갤러리에서 이미지 선택 → 바로 전송
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('사진 접근 권한이 필요합니다.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!res.canceled) onSendImage?.(res.assets[0].uri);
    } catch (e) {
      console.warn('이미지 선택 오류:', e);
    }
  };

  const sendText = () => {
    const v = text.trim();
    if (!v) return;
    onSendText?.(v);
    setText('');
  };

  return (
    <View style={styles.row}>
      {/* + 버튼 (간격은 아이콘 쪽에서) */}
      <TouchableOpacity style={styles.leftIcon} onPress={pickImage}>
        <IconPlus width={24} height={24} />
      </TouchableOpacity>

      {/* 인풋 박스 (피그마 스타일) */}
      <View style={styles.inputPill}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="메시지 보내기"
          placeholderTextColor="#888888"
          multiline
          returnKeyType="send"
          onSubmitEditing={sendText}
          textAlignVertical={Platform.OS === 'android' ? 'center' : 'auto'}
        />
      </View>

      {/* 전송 버튼 */}
      <TouchableOpacity style={styles.rightIcon} onPress={sendText}>
        <IconSend width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  // 아이콘 ↔ 인풋 간격은 여기서 조절
  leftIcon: {
    padding: 6,
    marginLeft: -8,
    marginRight: 4 // ← +와 인풋 사이 간격
  },
  rightIcon: {
    padding: 6,
    marginRight: -8,  // ← 인풋과 전송 아이콘 사이 간격
    marginLeft: 4
  },

  // 피그마: bg #F5F5F5 / radius 20 / padding 16x8
  inputPill: {
    flex: 1,                 // 남는 공간을 인풋이 가져감 (폭이 줄어들지 않게 margin X)
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    maxWidth: 294,
  },

  // 피그마: font 16 / weight 500 / lineHeight 24
  input: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Pretendard',
    fontWeight: '500',
    color: '#222222',
    padding: 0,       // 기본 padding 제거 (컨테이너에서 처리)
    maxHeight: 120,
  },
});
