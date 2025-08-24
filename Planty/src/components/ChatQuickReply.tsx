// ChatQuickReply.tsx
import React, { memo, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, txt, radius } from '../theme/tokens';

type Props = {
  options: string[];
  align?: 'left' | 'right';
  indentLeft?: number;
  maxInline?: number; // 한 줄에 보일 최대 개수 (기본 3)
  onPressOption?: (label: string) => void;
  style?: ViewStyle;
};

function ChatQuickReply({
  options,
  align = 'left',
  indentLeft = 44,
  maxInline = 3,
  onPressOption,
  style,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const visible = useMemo(() => {
    if (expanded) return options;
    if (options.length <= maxInline) return options;
    const rest = options.length - maxInline;
    return [...options.slice(0, maxInline), `+${rest}`];
  }, [options, expanded, maxInline]);

  const handlePress = (label: string) => {
    if (label.startsWith('+')) {
      setExpanded(true);
      return;
    }
    onPressOption?.(label);
  };

  return (
    <View style={[styles.wrap, align === 'right' ? styles.right : styles.left, style]}>
      <View
        style={[
          styles.inner,
          align === 'left'
            ? { marginLeft: indentLeft, alignSelf: 'flex-start' }
            : { alignSelf: 'flex-end' },
          expanded && styles.wrapLines, // 펼치면 줄바꿈 가능
        ]}
      >
        {visible.map((label, i) => (
          <Pressable key={`${label}-${i}`} style={styles.chip} onPress={() => handlePress(label)}>
            <Text style={styles.chipText}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default memo(ChatQuickReply);

const MAX_BUBBLE_W = 237;

const styles = StyleSheet.create({
  wrap: { width: 358, marginTop: -10 },
  left: { alignItems: 'flex-start' },
  right:{ alignItems: 'flex-end' },

  inner: {
    maxWidth: MAX_BUBBLE_W,
    flexDirection: 'row',
    flexWrap: 'nowrap', // 기본 한 줄
    gap: 8,
  },
  wrapLines:{ flexWrap: 'wrap' },

  chip: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: colors.gray10,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    ...txt.B3, // 기존 사이즈 유지
    color: colors.gray40,
  },
});
