// components/BtmTap.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

// 각 화면 import (screens 폴더 기준)
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import SellScreen from '../screens/SellScreen';
import MyPageScreen from '../screens/MypageScreen';

const Tab = createBottomTabNavigator();

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
            } else if (route.name === 'MyPage') {
              iconSource = focused
                ? require('../../assets/icon/tapbtnMyOn.png')
                : require('../../assets/icon/tapbtnMyOff.png');
            }

            return <Image source={iconSource} style={styles.icon} resizeMode="contain" />; // ✅ contain으로

          },
          tabBarShowLabel: false,
          tabBarStyle: styles.tab_bar_style,
          tabBarItemStyle: styles.tab_bar_item_style,
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Sell" component={SellScreen} />
        <Tab.Screen name="MyPage" component={MyPageScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 50,
    height: 50,
  },
  tab_bar_style: {
    height: 64,
    paddingTop:18,
    paddingHorizontal: spacing.lg,     // 좌우 여백
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
    elevation: 0,                  // Android 그림자 제거
    shadowOpacity: 0,              // iOS 그림자 제거
  },
  tab_bar_item_style: {
    marginHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
});
