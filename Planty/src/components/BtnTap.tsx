// components/BtmTap.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import HomeStack from '../navigation/HomeStack';
import ChatStack from '../navigation/ChatStack';
import SellStack from '../navigation/SellStack';
import MyStack from '../navigation/MyStack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

// ✅ 숨겨야 할 Sell 스택의 화면들만 판단
function hideTabBarOnSell(route: any) {
  const rn = getFocusedRouteNameFromRoute(route) ?? 'SellList';
  return ['SellDetail', 'SellCreate', 'AIChat'].includes(rn); // ← AIChat 추가
}

function hideTabBarOnMy(route: any) {
  const rn = getFocusedRouteNameFromRoute(route) ?? 'MyHome';
  return rn === 'ProfileEdit';
}

// ✅ base 스타일을 한 곳에서만 사용(객체 재생성 방지)
const TAB_BAR_BASE_STYLE = {
  height: 64,
  paddingTop: 18,
  paddingHorizontal: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  backgroundColor: colors.bg,
  elevation: 0,
  shadowOpacity: 0,
} as const;

export default function BtmTap() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let iconSource;
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
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: TAB_BAR_BASE_STYLE,
          tabBarItemStyle: styles.tab_bar_item_style,
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Chat" component={ChatStack} />

        {/* ✅ Sell 탭은 여기서만 show/hide 제어 (배경 스타일은 항상 BASE 유지) */}
        <Tab.Screen
          name="Sell"
          component={SellStack}
          options={({ route }) => ({
            tabBarStyle: [
              TAB_BAR_BASE_STYLE,
              hideTabBarOnSell(route) ? { display: 'none' } : null,
            ],
          })}
        />

         {/* ✅ My 탭을 스택으로 */}
        <Tab.Screen
          name="My"
          component={MyStack}
          options={({ route }) => ({
            tabBarStyle: hideTabBarOnMy(route) ? { display: 'none' } : styles.tab_bar_style,
          })}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 50, height: 50 },
  tab_bar_style: {
    height: 64,
    paddingTop: 18,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    elevation: 0,
    shadowOpacity: 0,
  },
  tab_bar_item_style: {
    marginHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
