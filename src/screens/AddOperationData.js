import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { WizardStore } from "../store";
import { Divider, Button as PaperButton, Card, MD3Colors, ProgressBar } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import OperationalDataScreen from './OperationalDataScreen';

const AddOperationData = ({ navigation }) => {

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerTitle: 'Operational Data',
    });
    navigation.setOptions({ title: "" });
  }, [navigation]);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    mode: "onBlur",
    defaultValues: WizardStore.useState((s) => s),
  });

  const onSubmit = () => {
    navigation.navigate(OperationalDataScreen);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome To NRP Projects</Text>


      <View style={styles.container}>
        <PaperButton
          mode="outlined"
          onPress={handleSubmit(onSubmit)}
          style={[styles.button]}
        >
          <Text style={styles.titleStyle}>Add Operational data</Text>
        </PaperButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFAEB',
    paddingHorizontal: 16,
    paddingBottom: 50,
    justifyContent: 'center',
    alignContent: 'center',
  },
  title: {
    paddingTop: 10,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  card: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  column: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  button: {
    margin: 8,
    backgroundColor: '#665208',
    color: 'white',
  },
  nextButton: {
    backgroundColor: '#665208',
  },
  titleStyle: {
    color: '#FFFFFF'
  },
});

export default AddOperationData;
