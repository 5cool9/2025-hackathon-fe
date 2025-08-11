// components/BtmTap.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import ChatScreen from '@/components/screens/ChatScreen';
import HomeScreen from '@/components/screens/HomeScreen';
import MyPageScreen from '@/components/screens/MypageScreen';
import SellScreen from '@/components/screens/SellScreen';

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
                ? require('@/assets/icon/tapbtnHomeOn.png')
                : require('@/assets/icon/tapbtnHomeOff.png');
            } else if (route.name === 'Chat') {
              iconSource = focused
                ? require('@/assets/icon/tapbtnChatOn.png')
                : require('@/assets/icon/tapbtnChatOff.png');
            } else if (route.name === 'Sell') {
              iconSource = focused
                ? require('@/assets/icon/tapbtnSaleOn.png')
                : require('@/assets/icon/tapbtnSaleOff.png');
            } else if (route.name === 'MyPage') {
              iconSource = focused
                ? require('@/assets/icon/tapbtnMyOn.png')
                : require('@/assets/icon/tapbtnMyOff.png');
            }
            return <Image source={iconSource} style={styles.icon} />;
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
    width: 24,
    height: 24,
  },
  tab_bar_style: {
    height: 60,            // 탭바 높이
    paddingTop: 10,        // 위쪽 여백
    paddingRight: 24,      // 오른쪽 여백
    paddingBottom: 10,     // 아래쪽 여백 줄임 (기존 35 -> 10)
    paddingLeft: 24,       // 왼쪽 여백
    borderTopWidth: 1,
    borderTopColor: '#D6D6D6',
    backgroundColor: '#FFF',
  },
  tab_bar_item_style: {
    marginHorizontal: 16,  // 아이콘 간 가로 간격
    justifyContent: 'center',  // 아이콘 중앙 정렬
  },
});
