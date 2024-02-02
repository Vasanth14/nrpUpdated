import React, {useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function HomeScreen({navigation}) {
  
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView style={{padding: 20}}>
        <View>
          <Text>Hello Home</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
