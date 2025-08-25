// src/components/ListChat.tsx
import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { colors, spacing, radius, txt } from '../theme/tokens';

type Props = {
  nickname: string;
  message: string;
  time: string;                // "오후 7:34" 또는 "2025-08-19T22:03:58" 등
  unreadCount?: number;
  avatarUri?: string;
  avatarSource?: ImageSourcePropType;
  onPress?: () => void;
  style?: ViewStyle;
};

// ✅ 어떤 포맷이 들어와도 HH:mm(24h)로 통일
function to24h(input?: string) {
  if (!input) return '';

  // 1) ISO 날짜 문자열인 경우
  const ts = Date.parse(input);
  if (!Number.isNaN(ts)) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // 2) "오전/오후 HH:MM" 또는 "AM/PM HH:MM" 같은 경우
  const hasPM = /오후|PM/i.test(input);
  const hasAM = /오전|AM/i.test(input);
  const pure = input.replace(/[^\d:]/g, ''); // 숫자와 콜론만 남김
  const m = pure.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    let h = parseInt(m[1], 10);
    const mm = m[2];

    if (hasPM && h < 12) h += 12;
    if (hasAM && h === 12) h = 0;

    const hh = String(h).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // 3) 이미 "HH:MM" 같은 24h 포맷이면 그대로
  if (/^\d{2}:\d{2}$/.test(input)) return input;

  // 예외: 그대로 반환
  return input;
}

function ListChat({
  nickname,
  message,
  time,
  unreadCount = 0,
  avatarUri,
  avatarSource,
  onPress,
  style,
}: Props) {
  const hasUnread = unreadCount > 0;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, style]}
      android_ripple={{ color: colors.gray15 }}
    >
      {/* 아바타 */}
      <Image
        source={avatarSource ?? (avatarUri ? { uri: avatarUri } : undefined)}
        style={styles.avatar}
      />

      {/* 닉네임 + 메시지 */}
      <View style={styles.textBox}>
        <Text style={[txt.B1, { color: colors.gray40 }]} numberOfLines={1}>
          {nickname}
        </Text>
        <Text
          style={[
            txt.B3,
            unreadCount > 0
              ? { color: colors.gray70, fontWeight: '600' }
              : { color: colors.subText, fontWeight: '500' },
          ]}
          numberOfLines={1}
        >
          {message}
        </Text>
      </View>

      {/* 시간 + 배지 */}
      <View style={styles.rightBox}>
        <Text style={styles.time}>{to24h(time)}</Text>
        {hasUnread && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default memo(ListChat);

const AVATAR_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 358,
    paddingVertical: 16,
    gap: spacing.sm,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#D9D9D9',
    borderWidth: 1,
    borderColor: '#D6D6D6',
  },
  textBox: {
    flex: 1,
    height: AVATAR_SIZE,
    justifyContent: 'space-between',
  },
  rightBox: {
    width: 40,
    height: AVATAR_SIZE,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    ...txt.B5,
    color: colors.subText,
    textAlign: 'center',
  },
  badge: {
    minWidth: 21,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#F64D4D',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    ...txt.B5,
    color: colors.gray0,
    textAlign: 'center',
  },
});
