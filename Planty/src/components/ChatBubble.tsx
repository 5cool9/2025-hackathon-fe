// src/components/ChatBubble.tsx
import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import { colors, txt, radius } from '../theme/tokens';

type Side = 'left' | 'right';
type Props = {
  side: Side;                         // 'left' = 상대, 'right' = 나
  text?: string;                      // 텍스트 버블
  imageSource?: ImageSourcePropType;  // 이미지 버블
  time?: string;
  showAvatar?: boolean;               // 상대 메시지에서만 사용
  avatarSource?: ImageSourcePropType; // PNG/JPG
  /** ✨ 추가: SVG 같은 커스텀 아바타 컴포넌트를 그대로 렌더 */
  avatarElement?: React.ReactNode;
  style?: ViewStyle;
  imgWidth?: number;                  // 필요 시 개별 이미지 크기
  imgHeight?: number;
};

function ChatBubble({
  side,
  text,
  imageSource,
  time,
  showAvatar,
  avatarSource,
  avatarElement,
  style,
  imgWidth = 100,
  imgHeight = 133,
}: Props) {
  const isRight = side === 'right';
  const bubbleBg = isRight ? colors.green90 : colors.gray10;
  const textColor = isRight ? colors.gray0 : colors.gray40;

  if (isRight) {
    // me: [time] [bubble]
    return (
      <View style={[styles.rowRight, style]}>
        {!!time && <Text style={[txt.B4, styles.time]}>{time}</Text>}

        <View
          style={[
            styles.bubbleBase,
            styles.bubbleMeCorners,
            { backgroundColor: bubbleBg },
            text ? { maxWidth: 237 } : null,
          ]}
        >
          {text ? (
            <Text style={[txt.B2, { color: textColor }]}>{text}</Text>
          ) : imageSource ? (
            <Image
              source={imageSource}
              style={[styles.img, { width: imgWidth, height: imgHeight }]}
              resizeMode="cover"
            />
          ) : null}
        </View>
      </View>
    );
  }

  // other: [avatar] [bubble] [time]
  return (
    <View style={[styles.rowLeft, style]}>
      {showAvatar ? (
        avatarElement ? (
          <View style={styles.avatar}>{avatarElement}</View>
        ) : avatarSource ? (
          <Image source={avatarSource} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )
      ) : null}

      <View style={styles.leftInner}>
        <View
          style={[
            styles.bubbleBase,
            styles.bubbleOtherCorners,
            { backgroundColor: bubbleBg },
            text ? { maxWidth: 237 } : null,
          ]}
        >
          {text ? (
            <Text style={[txt.B2, { color: textColor }]}>{text}</Text>
          ) : imageSource ? (
            <Image
              source={imageSource}
              style={[styles.img, { width: imgWidth, height: imgHeight }]}
              resizeMode="cover"
            />
          ) : null}
        </View>

        {!!time && <Text style={[txt.B4, styles.time]}>{time}</Text>}
      </View>
    </View>
  );
}

export default memo(ChatBubble);

const AVATAR = 36;

const styles = StyleSheet.create({
  rowLeft: {
    width: 358,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  rowRight: {
    width: 358,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 8,
  },
  leftInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',          // SVG가 둥근 마스크 안에 들어가도록
    backgroundColor: '#D6D6D6',
    borderWidth: 1,
    borderColor: colors.gray10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: '#EAEAEA',
  },
  bubbleBase: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },
  bubbleOtherCorners: {
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  bubbleMeCorners: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  img: {
    borderRadius: radius.md,
    backgroundColor: '#D9D9D9',
  },
  time: {
    color: colors.subText,
  },
});
