// components/BtnTap.tsx
import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { colors, spacing } from '../theme/tokens';
import HomeStack from '../navigation/HomeStack';
import ChatStack from '../navigation/ChatStack';
import SellStack from '../navigation/SellStack';
import MyStack from '../navigation/MyStack';

const Tab = createBottomTabNavigator();

function hideTabBarOnSell(route: any) {
  const rn = getFocusedRouteNameFromRoute(route) ?? 'SellList';
  return ['SellDetail', 'SellCreate', 'AIChat'].includes(rn);
}
function hideTabBarOnMy(route: any) {
  const rn = getFocusedRouteNameFromRoute(route) ?? 'MyHome';
  return rn === 'ProfileEdit';
}
function hideTabBarOnChat(route: any) {
  const rn = getFocusedRouteNameFromRoute(route) ?? 'ChatList';
  return rn === 'ChatRoom'; // 채팅방에서만 숨김
}

export default function BtnTap() {
  const insets = useSafeAreaInsets();

  const ICON_SIZE = 50;
  const V_PAD = 14;

  // 아이콘(50) + 위/아래 패딩 + 안전영역
  const baseBarStyle = useMemo(
    () => ({
      height: 30 + V_PAD + V_PAD + insets.bottom,
      paddingTop: V_PAD,
      paddingBottom: V_PAD + insets.bottom,
      paddingHorizontal: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.bg,
      elevation: 0,
      shadowOpacity: 0,
    }),
    [insets.bottom]
  );

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: baseBarStyle,
          tabBarItemStyle: styles.tab_bar_item_style,
          tabBarSafeAreaInsets: { bottom: 0, top: 0 },
          tabBarIcon: ({ focused }) => {
            let iconSource: any;
            if (route.name === 'Home') {
              iconSource = focused
                ? require('../../assets/icon/tapbtnHomeOn.png')
                : require('../../assets/icon/tapbtnHomeOff.png');
            } else if (route.name === 'Chat') {
              iconSource = focused
                ? require('../../assets/icon/tapbtnChatOn.png')
                : require('../../assets/icon/tapbtnChatOff.png');
            } else if (route.name === 'Sell') {
              iconSource = focused
                ? require('../../assets/icon/tapbtnSaleOn.png')
                : require('../../assets/icon/tapbtnSaleOff.png');
            } else {
              iconSource = focused
                ? require('../../assets/icon/tapbtnMyOn.png')
                : require('../../assets/icon/tapbtnMyOff.png');
            }
            return <Image source={iconSource} style={styles.icon} resizeMode="contain" />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />

        {/* ✅ ChatRoom에 들어갔을 때만 탭 숨김 */}
        <Tab.Screen
          name="Chat"
          component={ChatStack}
          options={({ route }) => ({
            tabBarStyle: [baseBarStyle, hideTabBarOnChat(route) ? { display: 'none' } : null],
          })}
        />

        <Tab.Screen
          name="Sell"
          component={SellStack}
          options={({ route }) => ({
            tabBarStyle: [baseBarStyle, hideTabBarOnSell(route) ? { display: 'none' } : null],
          })}
        />
        <Tab.Screen
          name="My"
          component={MyStack}
          options={({ route }) => ({
            tabBarStyle: [baseBarStyle, hideTabBarOnMy(route) ? { display: 'none' } : null],
          })}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 50, height: 50 }, // 아이콘 크기는 그대로
  tab_bar_item_style: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
});
