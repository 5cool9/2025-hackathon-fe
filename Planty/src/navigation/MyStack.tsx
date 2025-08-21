import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MypageScreen from '../screens/MypageScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';

export type MyStackParamList = {
  MyHome: undefined;
  ProfileEdit: { nickname: string; userId: string; avatar?: string } | undefined;
};

const Stack = createNativeStackNavigator<MyStackParamList>();

export default function MyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyHome" component={MypageScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
    </Stack.Navigator>
  );
}
