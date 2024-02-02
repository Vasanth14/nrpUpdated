import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginView from '../screens/LoginScreen';
import OperationalDataScreen from '../screens/OperationalDataScreen';
import OperationalToolsTackles from '../screens/OperationalToolsTackles';
import OperationalInstrument from '../screens/OperationalInstrument';
import OperationalSafetyTool from '../screens/OperationalSafetyTool';
import OperationalConsumables from '../screens/OperationalConsumables';
import OperationalDataManPowerS from '../screens/OperationalDataManPowerS';
import OperationalMachine from '../screens/OperationalMachine';
import { RootSiblingParent } from 'react-native-root-siblings';
import AddOperationData from '../screens/AddOperationData';
import  Confirmation  from "../screens/ConfirmationScreen";
const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <RootSiblingParent> 
    <Stack.Navigator screenOptions={{
      headerBackTitleVisible: false
    }}>
      <Stack.Screen name="LoginView" options={{
      headerShown: false, 
    }} component={LoginView} />
    <Stack.Screen name="OperationalDataScreen" component={OperationalDataScreen} />

    <Stack.Screen name="OperationalConsumables" options={{
            headerLeft: () => null,
            headerTitle: null, // Hide previous page name
          }} component={OperationalConsumables} />

    <Stack.Screen name="OperationalToolsTackles" options={{
            headerLeft: () => null,
            headerTitle: null, // Hide previous page name
          }} component={OperationalToolsTackles} />
    
    <Stack.Screen name="OperationalInstrument" options={{
            headerLeft: () => null,
            headerTitle: null, // Hide previous page name
          }} component={OperationalInstrument} />
    <Stack.Screen name="OperationalSafetyTool" options={{
            headerLeft: () => null,
            headerTitle: null, // Hide previous page name
          }} component={OperationalSafetyTool} />
    <Stack.Screen name="OperationalDataManPowerS" options={{
            headerLeft: () => null,
            headerTitle: null, // Hide previous page name
          }} component={OperationalDataManPowerS} />
    <Stack.Screen name="OperationalMachine" options={{
            headerLeft: () => null,
            headerTitle: null, // Hide previous page name
          }} component={OperationalMachine} />
    <Stack.Screen name="AddOperationData" options={{
            headerLeft: () => null,
            headerTitle: null, // Hide previous page name
          }} component={AddOperationData} />
    <Stack.Screen name="Confirmation" options={{
            headerLeft: () => null,
            headerTitle: null, // Hide previous page name
          }} component={Confirmation} />
    

    </Stack.Navigator>
    </RootSiblingParent>
  );
};

export default AuthStack;
