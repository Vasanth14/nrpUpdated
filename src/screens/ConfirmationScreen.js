import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TextInput, ScrollView, Button, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { WizardStore } from "../store";
import { Divider, Button as PaperButton, Card as PaperCard, MD3Colors, ProgressBar } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import environment from "../env";
import * as SecureStore from "expo-secure-store";
import OperationalDataScreen from "./OperationalDataScreen";

const { apiUrl } = environment();
export default function Confirmation({ navigation }) {
  console.log('WizardStore data:', WizardStore);
  // Keep back arrow from showing
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerTitle: 'Confirmation',
    });
    navigation.setOptions({ title: "" });
  }, [navigation]);


  const formatDate = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    var timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    return timeString;
  };

  const [forceUpdate, setForceUpdate] = React.useState(0);

  useEffect(async () => {
    const projectCodeId = WizardStore.getRawState().Project;
    console.log("Project Code:", projectCodeId);

    try {
      const getToken = async () => {
        try {
          return await SecureStore.getItemAsync("token");
        } catch (error) {
          console.error("Error getting token:", error);
          return null;
        }
      };
      const token = await getToken();
      if (token) {
        const response = await fetch(apiUrl + 'projectCode/' + projectCodeId, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await response.json()
        const projectCode = data.projectCode
        console.log(projectCode)
        projectCompanyFind(projectCode, token)
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  }, [])

  const projectCompanyFind = async (projectCode, token) => {
    try {
      const response = await fetch(apiUrl + `projectCode?projectCode=` + projectCode, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()
      const projCompany = data.results[0].projectCompany
      const proMaster = data.results[0].projectMaster
      console.log(projCompany)
      console.log("Before Update:", WizardStore.getRawState());
      WizardStore.update((s) => {
        s.ProjectCompany = projCompany;
        s.Project = projectCode;
        s.ProjectMaster = proMaster
      });
      setForceUpdate((prev) => prev + 1);
      console.log("After Update:", WizardStore.getRawState());
    } catch (error) {
      console.error("Additional API Error:", error);
    }
  }

  const {
    Project,
    ProjectCompany,
    ProjectCode,
    Location,
    Date,
    Chainage,
    ProjectMaster,
    Activity,
    JobIdentification,
    manpower,
    instrumentData,
    consumablesData,
    tooltacklesData,
    safetyTool,
    machine
  } = WizardStore.currentState;

  console.log("Locaa" + JSON.stringify(WizardStore.currentState))


  const onSubmit = async () => {
    try {
      // Display confirmation alert
      Alert.alert(
        'Confirmation',
        'Are you sure you want to submit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Submit',
            onPress: async () => {
              try {
                // Get token
                const token = await SecureStore.getItemAsync("token");

                if (token) {

                  const projectCodeId = WizardStore.getRawState().Project;
                  console.log("Project Code:", projectCodeId);

                  // Call the function to get projectCompany
                  const [projectCompany, projectMaster, projectCode] = await getProjectCompany(projectCodeId, token);

                  // Extracting data from WizardStore.currentState
                  const manpowerData = manpower.map(item => ({
                    manpowerId: item.ManPowerId,
                    category: item.Description,
                    workinginTime: item.timeIn,
                    workingoutTime: item.timeOut,
                  }));

                  const consumablesArray = consumablesData.map(item => ({
                    consumablesId: item.ConsumablesId,
                    description: item.Description,
                    specification: item.Specification,
                    quantity: item.Quantity,
                  }));

                  const tooltacklesArray = tooltacklesData.map(item => ({
                    toolandtacklesId: item.TooltacklesId,
                    description: item.Description,
                    quantity: item.Quantity,
                  }));

                  const safetyToolArray = safetyTool.map(item => ({
                    saftytoolsId: item.SafetyToolId,
                    description: item.Description,
                    quantity: item.Quantity,
                  }));

                  const instrumentsArray = instrumentData.map(item => ({
                    instrumentsId: item.InstrumentId,
                    description: item.Description,
                    quantity: item.Quantity,
                  }));

                  const machineryArray = machine.map(item => ({
                    machineryId: item.MachineryId,
                    assetid: item.AssetID,
                    machine: item.Description,
                    openingkm: item.OpeningKM,
                    closingkm: item.ClosingKM,
                    fuelQty: item.FuelQty,
                    fuelcost: item.FuelCostPerLiter,
                  }));

                  // Replace hardcoded values with data from WizardStore.currentState
                  const requestBody = {
                    dailyoperationalBody: {
                      projectCode: projectCode,
                      projectActivity: Activity,
                      projectMaster: projectMaster,
                      projectCompany: projectCompany,
                      date: Date,
                      location: Location,
                      chainage: Chainage,
                      jobidentification: JobIdentification,
                      manpower: manpowerData,
                      instruments: instrumentsArray,
                      comsumables: consumablesArray,
                      toolandTackles: tooltacklesArray,
                      saftytools: safetyToolArray,
                      machinery: machineryArray,
                    }
                  };

                  // Make POST request
                  console.log(JSON.stringify(requestBody) + 'thisisreq')
                  const response = await fetch(apiUrl + 'dailyoperational/', {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                  });

                  // Check response status
                  if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    // Show success alert
                    Alert.alert('Success', 'Data Added Successfully');
                    // Navigate to another screen
                    navigation.navigate('OperationalDataScreen');
                  } else {
                    // Handle non-OK response status
                    console.error('API Error:', response.status, response.statusText);
                  }
                }
              } catch (error) {
                console.error('API Request Error:', error);
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Confirmation Dialog Error:', error);
    }
  };

  const getProjectCompany = async (projectCodeId, token) => {
    try {
      const response = await fetch(apiUrl + `projectCode?projectCode=` + projectCodeId, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const projCompany = result.projectCompany;
        const projMaster = result.projectMaster;
        const projCode = result.projectCode;
        console.log(projCompany, projMaster, projCode + 'Hola');
        return [projCompany, projMaster, projCode];
      } else {
        console.error("No results found in the API response");
        return null;
      }
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles2.container}>
          <Text style={styles1.title}>Operational Data</Text>
          <PaperButton onPress={onSubmit} mode="outlined" style={styles2.button}>
            <Text style={styles2.titleStyle}>Submit</Text>
          </PaperButton>
        </View>
        <View>
          <PaperCard style={styles.card}>
            <PaperCard.Content>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Product:</Text>
                </View>
                <View style={styles.column}>
                  <Text> {Project}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Project Company:</Text>
                </View>
                <View style={styles.column}>
                  <Text> {ProjectCompany}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Location</Text>
                </View>
                <View style={styles.column}>
                  <Text>{Location}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Date</Text>
                </View>
                <View style={styles.column}>
                  <Text> {Date}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Chainage</Text>
                </View>
                <View style={styles.column}>
                  <Text> {Chainage}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Project Master</Text>
                </View>
                <View style={styles.column}>
                  <Text> {ProjectMaster}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Activity</Text>
                </View>
                <View style={styles.column}>
                  <Text> {Activity}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.column}>
                  <Text style={styles.label}>Job Identification</Text>
                </View>
                <View style={styles.column}>
                  <Text> {JobIdentification}</Text>
                </View>
              </View>
            </PaperCard.Content>
          </PaperCard>

          <Text style={styles.title}>Man Power</Text>
          {manpower.map((manpowers, index) => (
            <PaperCard key={index} style={styles.card}>
              <PaperCard.Content>
                {/* <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Nae:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{manpowers.name}</Text>
                  </View>
                </View> */}
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Category:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{manpowers.Description}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Time In:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{formatDate(manpowers.TimeIn)}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Time Out:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{formatDate(manpowers.TimeOut)}</Text>
                  </View>
                </View>
              </PaperCard.Content>
            </PaperCard>
          ))}

          <Text style={styles.title}>Consumables</Text>
          {consumablesData.map((instrument, index) => (
            <PaperCard key={index} style={styles.card}>
              <PaperCard.Content>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Description:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{instrument.Description}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Quantity:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{instrument.Quantity}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Specification:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{instrument.Specification}</Text>
                  </View>
                </View>
              </PaperCard.Content>
            </PaperCard>
          ))}

          <Text style={styles.title}>Tools And Tackles</Text>
          {tooltacklesData.map((instrument, index) => (
            <PaperCard key={index} style={styles.card}>
              <PaperCard.Content>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Description:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{instrument.Description}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Quantity:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{instrument.Quantity}</Text>
                  </View>
                </View>
              </PaperCard.Content>
            </PaperCard>
          ))}

          <Text style={styles.title}>Instrument</Text>
          {instrumentData.map((instrument, index) => (
            <PaperCard key={index} style={styles.card}>
              <PaperCard.Content>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Description:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{instrument.Description}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Quantity:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{instrument.Quantity}</Text>
                  </View>
                </View>
              </PaperCard.Content>
            </PaperCard>
          ))}

          <Text style={styles.title}>Safety Tool</Text>
          {safetyTool.map((instrument, index) => (
            <PaperCard key={index} style={styles.card}>
              <PaperCard.Content>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Description:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{instrument.Description}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Quantity:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{instrument.Quantity}</Text>
                  </View>
                </View>
              </PaperCard.Content>
            </PaperCard>
          ))}



          <Text style={styles.title}>Machinery</Text>
          {/* Machinery Data */}
          {machine.map((item, index) => (
            <PaperCard key={index} style={styles.card}>
              <PaperCard.Content>
              <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>AssetID:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{item.AssetID}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Machine:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{item.Description}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Opening KM:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{item.OpeningKM}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Closing KM:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{item.ClosingKM}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Fuel Qty:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{item.FuelQty}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Fuel Cost Per Liter:</Text>
                  </View>
                  <View style={styles.column}>
                    <Text>{item.FuelCostPerLiter}</Text>
                  </View>
                </View>
              </PaperCard.Content>
            </PaperCard>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFAEB',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
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
});

const styles1 = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    marginLeft: 16,
    margin: 8,
    Color: '#FBFBFB',
    backgroundColor: '#665208',
  },
  titleStyle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
});

const styles2 = StyleSheet.create({
  container: {
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginLeft: 16,
    margin: 0,
    Color: '#FBFBFB',
    backgroundColor: '#665208',
  },
  titleStyle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
});
