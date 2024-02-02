import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { WizardStore } from "../store";
import DropDownPicker from "react-native-dropdown-picker";
// import { Divider, Button as PaperButton, Card } from "react-native-paper";
import { Divider, Button as PaperButton, Card, MD3Colors, ProgressBar } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import Confirmation from "./ConfirmationScreen";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Alert from "../alert";
import environment from "../env";
import * as SecureStore from "expo-secure-store";

const { apiUrl } = environment();

const DropdownPickerItemAsset = ({ index, projectOptionsAsset, onChangeItem, zIndex, zIndexInverse }) => {
  const [openProjectAsset, setOpenProjectAsset] = useState(false);
  const [selectedProjectAsset, setSelectedProjectAsset] = useState(null);

  return (
    <DropDownPicker
      multiple={false}
      open={openProjectAsset}
      value={selectedProjectAsset}
      items={projectOptionsAsset}
      setOpen={(value) => {
        setOpenProjectAsset(value);
      }}
      zIndex={zIndex}
      zIndexInverse={zIndexInverse}
      setValue={(value) => {
        setSelectedProjectAsset(value);
        onChangeItem(index, value); // Pass the index and value to the parent component
      }}
      placeholder="AssetID"
      searchable={true}
      onChangeItem={(item) => {
        console.log(`Selected Project ${index}:`, item);
        // Add additional logic if needed
      }}
    />
  );
};

const DropdownPickerItem = ({ index, projectOptions, onChangeItem, zIndex, zIndexInverse }) => {
  const [openProject, setOpenProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <DropDownPicker
      multiple={false}
      open={openProject}
      value={selectedProject}
      items={projectOptions}
      setOpen={(value) => {
        setOpenProject(value);
      }}
      zIndex={zIndex}
      zIndexInverse={zIndexInverse}
      setValue={(value) => {
        setSelectedProject(value);
        onChangeItem(index, value); // Pass the index and value to the parent component
      }}
      placeholder="Description"
      searchable={true}
      onChangeItem={(item) => {
        console.log(`Selected Project ${index}:`, item);
        // Add additional logic if needed
      }}
    />
  );
};

export default function OperationalMachine({ navigation }) {
  // ... (previous code)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerTitle: 'Machinery',
    });
    navigation.setOptions({ title: "" });
  }, [navigation]);

  const isFocused = useIsFocused();

  const [openProject, setOpenProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectOptions, setProjectOptions] = useState([]);

  const [openProjectAsset, setOpenProjectAsset] = useState(false);
  const [selectedProjectAsset, setSelectedProjectAsset] = useState(null);
  const [projectOptionsAsset, setProjectOptionsAsset] = useState([]);

  useEffect(() => {
    isFocused &&
      WizardStore.update((s) => {
        s.progress = "0.9";
      });
    const projectCodeId = WizardStore.getRawState().Project;
    console.log("Project Code:", projectCodeId);

    console.log("updated state...", WizardStore.getRawState().progress);
    fetchProjectCode(projectCodeId)
  }, [isFocused]);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: WizardStore.useState((s) => {
      console.log("IRSRT" + JSON.stringify(s)); // Log 's' here
      return s;
    })
  });



  const [formData, setFormData] = useState([
    { AssetID: "", Machine: "", OpeningKM: "", ClosingKM: "", FuelQty: "", FuelCostPerLiter: "" }
  ]);

  const fetchProjectCode = async (projectCodeId) => {
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
        fetchDescription(projectCode, token)
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  }

  const fetchDescription = async (projectCode, token) => {
    try {
      const response = await fetch(apiUrl + `machinery?projectCode=` + projectCode, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(apiUrl + `machinery?projectCode=` + projectCode)
      const data = await response.json()
      if (data.internalApiData && data.internalApiData.results && data.internalApiData.results.length > 0) {
        const descriptions = data.internalApiData.results.map(result => ({
          id: result.id,
          label: result.description,
          value: result.description
        }));
        const assetid = data.internalApiData.results.map(result => ({
          label: result.assetid,
          value: result.assetid
        }));
        console.log(descriptions)
        setProjectOptions(descriptions);
        setProjectOptionsAsset(assetid)
      }
    } catch (error) {
      console.error("Additional API Error:", error);
    }
  }

  const FloatingButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={styles.floatingButton} onPress={addRow}>
        {/* <Text style={styles.buttonText}>Button</Text> */}
        <FontAwesome name="plus" color='white' size={20}>
        </FontAwesome>
      </TouchableOpacity>

    );
  };

  const NextButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={styles.NextButton} onPress={handleSubmit(onSubmit)}>
        <FontAwesome name="chevron-right" color="white" size={20} style={styles.nextIcon} />
      </TouchableOpacity>

    );
  };

  const PreviousButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={styles.PreviousButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="chevron-left" color="white" size={20} style={styles.nextIcon} />
      </TouchableOpacity>
    );
  };

  const addRow = () => {
    setFormData([...formData, { description: "", quantity: "" }]);
  };

  const removeRow = (indexToRemove) => {
    const newFormData = [...formData];
    newFormData.splice(indexToRemove, 1);
    setFormData(newFormData);
  };


  // ... (previous code)

  const handleMachineChange = (index, value) => {
    const newFormData = [...formData];
    newFormData[index].Machine = value;
    setFormData(newFormData);
  };

  const handleOpeningKMChange = (index, value) => {
    const newFormData = [...formData];
    newFormData[index].OpeningKM = value;
    setFormData(newFormData);
  };

  const handleClosingKMChange = (index, value) => {
    const newFormData = [...formData];
    newFormData[index].ClosingKM = value;
    setFormData(newFormData);
  };

  const handleFuelQtyChange = (index, value) => {
    const newFormData = [...formData];
    newFormData[index].FuelQty = value;
    setFormData(newFormData);
  };

  const handleFuelCostPerLiterChange = (index, value) => {
    const newFormData = [...formData];
    newFormData[index].FuelCostPerLiter = value;
    setFormData(newFormData);
  };


  const onSubmit = (data) => {

    const machine = formData.map((item, index) => {
      // Get the selected description's ID
      const selectedDescriptionId = projectOptions.find(option => option.value === data[`description${index}`])?.id;

      return {
        MachineryId: selectedDescriptionId, // Assuming you want to name it ConsumablesId
        AssetID: typeof data[`assetid${index}`] === 'function'
        ? data[`assetid${index}`]()  // If it's a function, call it to get the value
        : data[`assetid${index}`],
        Description: typeof data[`description${index}`] === 'function'
          ? data[`description${index}`]()  // If it's a function, call it to get the value
          : data[`description${index}`],
        OpeningKM: data[`OpeningKM${index}`],
        ClosingKM: data[`ClosingKM${index}`],
        FuelQty: data[`FuelQty${index}`],
        FuelCostPerLiter: data[`FuelCostPerLiter${index}`],
      };
    }).filter((item) =>
      item.AssetID &&
      item.Description && item.OpeningKM &&
      item.ClosingKM && item.FuelQty &&
      item.FuelCostPerLiter &&
      item.AssetID.trim() !== '' &&
      item.Description.trim() !== '' && item.OpeningKM.trim() !== '' &&
      item.ClosingKM.trim() !== '' && item.FuelQty.trim() !== '' &&
      item.FuelCostPerLiter.trim() !== ''
    );

    WizardStore.update((s) => {
      s.progress = "0.9";
      console.log(machine.length)
      if (machine.length > 0) {
        s.machine = machine;
      }
    });
    navigation.navigate(Confirmation);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <ProgressBar
          style={styles.progressBar}
          progress={WizardStore.getRawState().progress}
          color={MD3Colors.primary60}
        />
        <View style={{ paddingHorizontal: 10 }}>
          {/* Dynamic form for Machine, Opening KM, Closing KM, Fuel Qty, and Fuel Cost per Liter */}
          <View style={styles.formEntry}>
            {formData.map((item, index) => (
              <View key={index} style={{ marginBottom: 25 }}>
                <Card.Content>
                <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.heading}>AssetId</Text>
                      <Controller
                        control={control}
                        name={`assetid${index}`}
                        defaultValue=''
                        rules={{ required: 'assetid is required' }}
                        render={({ field }) => (
                          <>
                            <DropdownPickerItemAsset
                              index={index}
                              projectOptionsAsset={projectOptionsAsset}
                              onChangeItem={(index, value) => {
                                const selectedValue = typeof value === 'function' ? value() : value;

                                field.onChange(selectedValue);
                                setSelectedProjectAsset(selectedValue);

                                // Log the selected value and the array of projectOptions
                                console.log("Selected Value:", selectedValue);
                                console.log("Project Options:", projectOptionsAsset);

                                // Get the selected description's ID
                                const selectedOption = projectOptionsAsset.find(option => option.value === selectedValue);
                                console.log("Selected Option:", selectedOption);

                                const selectedDescriptionId = selectedOption?.id;
                                console.log("Selected Description ID:", selectedDescriptionId);
                              }}
                              zIndex={(formData.length - index) * 1000} // Calculate zIndex
                              zIndexInverse={index * 1000} // Calculate zIndexInverse
                            />
                            {errors[`description${index}`] && (
                              <Text style={{ color: 'red', paddingTop: 2, fontSize: 12 }}>
                                {errors[`description${index}`].message}
                              </Text>
                            )}
                          </>
                        )}
                      />

                    </View>
                  {/* </View>
                  <View style={styles.row}> */}
                    <View style={styles.column}>
                      <Text style={styles.heading}>Machine</Text>
                      <Controller
                        control={control}
                        name={`description${index}`}
                        defaultValue=''
                        rules={{ required: 'Description is required' }}
                        render={({ field }) => (
                          <>
                            <DropdownPickerItem
                              index={index}
                              projectOptions={projectOptions}
                              onChangeItem={(index, value) => {
                                const selectedValue = typeof value === 'function' ? value() : value;

                                field.onChange(selectedValue);
                                setSelectedProject(selectedValue);

                                // Log the selected value and the array of projectOptions
                                console.log("Selected Value:", selectedValue);
                                console.log("Project Options:", projectOptions);

                                // Get the selected description's ID
                                const selectedOption = projectOptions.find(option => option.value === selectedValue);
                                console.log("Selected Option:", selectedOption);

                                const selectedDescriptionId = selectedOption?.id;
                                console.log("Selected Description ID:", selectedDescriptionId);
                              }}
                              zIndex={(formData.length - index) * 1000} // Calculate zIndex
                              zIndexInverse={index * 1000} // Calculate zIndexInverse
                            />
                            {errors[`description${index}`] && (
                              <Text style={{ color: 'red', paddingTop: 2, fontSize: 12 }}>
                                {errors[`description${index}`].message}
                              </Text>
                            )}
                          </>
                        )}
                      />

                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.heading}>Opening KM</Text>
                      <Controller
                        control={control}
                        name={`OpeningKM${index}`}
                        defaultValue={item.OpeningKM}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            placeholder={`Opening KM`}
                            value={field.value}
                            onChangeText={(value) => {
                              field.onChange(value);
                              handleOpeningKMChange(index, value);
                            }}
                          />
                        )}
                      />
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.heading}>Closing KM</Text>
                      <Controller
                        control={control}
                        name={`ClosingKM${index}`}
                        defaultValue={item.ClosingKM}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            placeholder={`Closing KM`}
                            value={field.value}
                            onChangeText={(value) => {
                              field.onChange(value);
                              handleClosingKMChange(index, value);
                            }}
                          />
                        )}
                      />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.heading}>Fuel Cost / Lt</Text>
                      <Controller
                        control={control}
                        name={`FuelCostPerLiter${index}`}
                        defaultValue={item.FuelCostPerLiter}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            placeholder={`Fuel Cost / Lt`}
                            value={field.value}
                            onChangeText={(value) => {
                              field.onChange(value);
                              handleFuelCostPerLiterChange(index, value);
                            }}
                          />
                        )}
                      />
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.heading}>Fuel Qty</Text>
                      <Controller
                        control={control}
                        name={`FuelQty${index}`}
                        defaultValue={item.FuelQty}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            placeholder={`Fuel Qty`}
                            value={field.value}
                            onChangeText={(value) => {
                              field.onChange(value);
                              handleFuelQtyChange(index, value);
                            }}
                          />
                        )}
                      />
                    </View>
                  </View>
                </Card.Content>
                <Card.Actions style={styles.cardActions}>
                  <FontAwesome
                    name="trash"
                    color="#FF0000"
                    size={20}
                    onPress={() => {
                      removeRow(index);
                    }}>
                  </FontAwesome>
                </Card.Actions>
              </View>
            ))}
          </View>

          <Divider />
          <FloatingButton />
        </View>
        <PreviousButton />
        <NextButton />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  floatingButton: {
    backgroundColor: 'green',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    // position: 'absolute',
    top: 10,
    left: 305,
    elevation: 8,
  },
  NextButton: {
    backgroundColor: '#665208',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 8,
  },
  PreviousButton: {
    backgroundColor: '#665208',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    elevation: 8,
  },
  cardActions: {
    position: 'fixed',
    // bottom:135,
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#FBFAEB'
  },
  card: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  row_machine: {
    flexDirection: 'row',
    width: 100
  },
  column: {
    flex: 1,
    margin: 4,
  },
  heading: {
    fontWeight: 'bold',
  },
  button: {
    margin: 0,
  },
  goBackButton: {
    backgroundColor: '#665208',
    color: 'white',
  },
  nextButton: {
    backgroundColor: '#665208',
    // color: "white",
  },
  progressBar: {
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  formEntry: {
    margin: 3,
  },
  actionButton: {
    backgroundColor: '#665208',
    marginTop: 10,
    width: 70,
    height: 32,
    margin: 10
  },
  titleStyle: {
    color: 'white',
    fontSize: 12,
    margin: 0,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 0,
    marginHorizontal: 0,
    marginVertical: 5
  },
  actionIcon: {
    backgroundColor: 'transparent', // Set a transparent background
    borderWidth: 0, // Remove any border or styling that might interfere
    // padding: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginHorizontal: 5,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    paddingHorizontal: 3,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'green',
    borderRadius: 20,
  },
  actionButton1: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green',
    marginTop: 10,
    width: 30,
    height: 30,
  },
});