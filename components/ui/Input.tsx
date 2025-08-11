import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Image, Modal, Platform, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  inputType?: 'text' | 'password' | 'date';
  iconName?: 'eye' | 'calendar' | null;
}

export default function Input({
  value,
  onChangeText,
  placeholder,
  inputType = 'text',
  iconName = null,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      onChangeText(selectedDate.toISOString().split('T')[0]);
    }
  };

  if (inputType === 'date') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <TextInput
            style={[styles.input, { paddingVertical: 8 }]}
            value={value}
            editable={false}
            placeholder={placeholder || '날짜를 선택하세요'}
            pointerEvents="none" // 터치 불가 처리
          />
          {iconName === 'calendar' && (
            <Image
              source={require('@/assets/icon/calendarGray.png')}
              style={styles.icon}
            />
          )}
        </TouchableOpacity>

        {Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
              <View style={styles.modalBackground}>
                {/* 모달 컨텐츠 터치 막기 위해 한 번 더 TouchableWithoutFeedback */}
                <TouchableWithoutFeedback>
                  <View style={styles.modalContainer}>
                    <DateTimePicker
                      value={value ? new Date(value) : new Date()}
                      mode="date"
                      display="spinner"
                      onChange={onChangeDate}
                      style={{ backgroundColor: 'white' }}
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              display="spinner"
              onChange={onChangeDate}
            />
          )
        )}
      </View>
    );
  }

  // password, text input
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={inputType === 'password' && !showPassword}
      />
      {iconName === 'eye' && (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Image
            source={
              showPassword
                ? require('@/assets/icon/eyeopen.png')
                : require('@/assets/icon/eyeclose.png')
            }
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 4,
    paddingHorizontal: 16,
    height: 48,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 8,
    width: 358,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  dateInput: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  icon_button: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#888',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(34, 34, 34, 0.40)',
  },
  modalContainer: {
    backgroundColor: 'white',
    height: 355, // 모달 길이 조절할 때
    paddingBottom: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',     
  },
});
