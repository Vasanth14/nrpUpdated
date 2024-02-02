import React, { useState } from "react";
import { StatusBar, StyleSheet, View, ActivityIndicator } from "react-native";
import LoginScreen from "react-native-login-screen";
import axios from "axios";
import AddOperationData from "./AddOperationData";
import OperationalDataScreen from "./OperationalDataScreen";
import * as SecureStore from "expo-secure-store";
import environment from "../env";
import Alert from "../alert";

const Ccont = StyleSheet.create({
  Ccont: {
    flex: 0.7,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFAEB",
    color: "white",
  },
  background: {
    flex: 1,
    backgroundColor: "#FBFAEB",
  },
  white: {
    borderBlockColor: "#FFFFFF",
  },
  titleStyle: {
    color: "#FFFFFF",
  },
});

const css = StyleSheet.create({
  button: {
    backgroundColor: "#665208",
  },
  activityIndicatorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

const { apiUrl } = environment();

const LoginView = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const onLoginPress = () => {
    setIsLoading(true);
    axios
      .post(apiUrl + "auth/login", { username, password })
      .then((res) => {
        setIsLoading(false);
        const token = res.data.tokens.access.token;
        SecureStore.setItemAsync("token", token);
        navigation.navigate(AddOperationData);
      })
      .catch((error) => {
        console.log("re" + error);
        setIsLoading(false);
        setShowErrorAlert(true);
      });
        // setIsLoading(false);
        // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWE4ZGVjMzUzMGFjMDk1NzVlNDI2MTQiLCJpYXQiOjE3MDY4NTMyNzksImV4cCI6MTcwNjkzOTY3OSwidHlwZSI6ImFjY2VzcyJ9.BVQYZufVr1ChUURoTbkw9Ezp6H1qSCMlLMqu7rssVUs";
        // SecureStore.setItemAsync("token", token);
        // navigation.navigate(OperationalDataScreen);
  };

  return (
    <View style={Ccont.background}>
      <StatusBar backgroundColor={Ccont.background.backgroundColor} />
      <View style={Ccont.Ccont}>
        <ActivityIndicator
          animating={isLoading}
          style={css.activityIndicatorContainer}
          size="large"
          color="#665208"
        />
        <Alert
          visible={showErrorAlert}
          heading="Error"
          message="Please check your credentials"
          onClose={() => setShowErrorAlert(false)}
        />
        <LoginScreen
          style={Ccont.Ccont}
          disableSocialButtons
          disableSignup
          disableEmailTooltip
          emailPlaceholder="User Name"
          logoImageSource={require("../assets/icon.png")}
          onSignupPress={() => {}}
          onLoginPress={onLoginPress}
          onEmailChange={(text) => setUsername(text)}
          onPasswordChange={(text) => setPassword(text)}
          loginButtonStyle={css.button}
          disableDivider
        />
      </View>
    </View>
  );
};

export default LoginView;
