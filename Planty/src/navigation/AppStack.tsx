// AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from './types'; 
import BtnTap from '../components/BtnTap';
import RegisterScreen from '../screens/RegisterScreen';
import AnalyzeScreen from '../screens/AnalyzeScreen';
import ResultScreen from '../screens/ResultScreen';
import EditregisterScreen from '../screens/EditregisterScreen';
import PlantDetail from '../screens/PlantDetail';
import JournalScreen from '../screens/JournalScreen';
import JournalaiScreen from '../screens/JournalaiScreen';

const Stack = createNativeStackNavigator<AppStackParamList>(); 

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTab" component={BtnTap} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AnalyzeScreen" component={AnalyzeScreen} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} />
      <Stack.Screen name="EditregisterScreen" component={EditregisterScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetail} />
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="JournalAI" component={JournalaiScreen} />
    </Stack.Navigator>
  );
}
