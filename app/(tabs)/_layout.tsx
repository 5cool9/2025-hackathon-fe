import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

import ChatScreen from '@/components/screens/ChatScreen';
import HomeScreen from '@/components/screens/HomeScreen';
import MyPageScreen from '@/components/screens/MypageScreen';
import SellScreen from '@/components/screens/SellScreen';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
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
        tabBarStyle: {
          height: 100,
          paddingTop: 18,
          paddingRight: 5,
          paddingBottom: 35,
          paddingLeft: 5,
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: '#D6D6D6',
          backgroundColor: '#FFF',
          width: '100%',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Sell" component={SellScreen} />
      <Tab.Screen name="MyPage" component={MyPageScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 46,
  },
});
