// src/components/Input.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, spacing as SP, txt } from '../theme/tokens';

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

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(40)).current;

  const openDatePicker = () => {
    setShowDatePicker(true);
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const closeDatePicker = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 40,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => finished && setShowDatePicker(false));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const onChangeDate = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) onChangeText(selectedDate.toISOString().split('T')[0]);
  };

  if (inputType === 'date') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.dateInput} onPress={openDatePicker} activeOpacity={0.8}>
          <TextInput
            style={styles.input}
            value={value}
            editable={false}
            placeholder={placeholder || '날짜를 선택하세요'}
            pointerEvents="none"
          />
          {iconName === 'calendar' && (
            <Image source={require('../../assets/icon/calendarGray.png')} style={styles.icon} />
          )}
        </TouchableOpacity>

        {Platform.OS === 'ios' ? (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="none"
            presentationStyle="overFullScreen"
            onRequestClose={closeDatePicker}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDatePicker}>
              <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
            </Pressable>
            <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
              <View style={styles.grabber} />
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display="spinner"
                onChange={onChangeDate}
                style={{ backgroundColor: colors.bg }}
              />
            </Animated.View>
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
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Image
            source={
              showPassword
                ? require('../../assets/icon/eyeopen.png')
                : require('../../assets/icon/eyeclose.png')
            }
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const SHEET_RADIUS = 16;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    height: 48,
    alignItems: 'center',
    backgroundColor: colors.bg,
    marginVertical: SP.sm,
    width: 358,
  },
  input: {
    flex: 1,
    fontFamily: txt.B2.fontFamily as string,
    fontWeight: txt.B2.fontWeight as any,
    fontSize: txt.B2.fontSize,
    color: colors.text,
    paddingVertical: 0,
    ...(Platform.OS === 'ios'
      ? { lineHeight: undefined as unknown as number, paddingTop: 1 }
      : { lineHeight: txt.B2.lineHeight }),
  },
  dateInput: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: colors.subText,
    marginLeft: SP.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34,34,34,0.40)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 18,
    paddingBottom: 24,
    backgroundColor: colors.bg,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    alignItems: 'center',
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray20,
    marginBottom: 12,
  },
});
