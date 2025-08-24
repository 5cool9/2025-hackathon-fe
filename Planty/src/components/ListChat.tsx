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
  time: string;
  unreadCount?: number; // 없거나 0이면 배지 안보임
  avatarUri?: string;
  avatarSource?: ImageSourcePropType;
  onPress?: () => void;
  style?: ViewStyle;
};

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
            ? { color: colors.gray70, fontWeight: '600' } // 안읽은 메시지
            : { color: colors.subText, fontWeight: '500' } // 읽은 메시지
        ]}
        numberOfLines={1}
    >
        {message}
    </Text>
    </View>

      {/* 시간 + 배지 */}
      <View style={styles.rightBox}>
        <Text style={styles.time}>{time}</Text>
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
