import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { WizardStore } from "../store";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from 'react-native-safe-area-context';
// import { Divider, Button as PaperButton, Card } from "react-native-paper";
import { Divider, Button as PaperButton, Card, MD3Colors, ProgressBar } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import OperationalMachine from "./OperationalMachine";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Alert from "../alert";
import environment from "../env";
import * as SecureStore from "expo-secure-store";

const { apiUrl } = environment();

const DropdownPickerItem = ({ index, projectOptions, onChangeItem, zIndex, zIndexInverse }) => {
  const [openProject, setOpenProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <DropDownPicker
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

export default function OperationalSafetyTool({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerTitle: 'Safety Tool',
    });
    navigation.setOptions({ title: "" });
  }, [navigation]);

  const isFocused = useIsFocused();

  const [openProject, setOpenProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectOptions, setProjectOptions] = useState([]);

  useEffect(() => {
    isFocused &&
      WizardStore.update((s) => {
        s.progress = "0.4";
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
    setValue,
  } = useForm({
    mode: "onBlur",
    defaultValues: WizardStore.useState((s) => s),
  });

  const [formData, setFormData] = useState([
    { Description: "", Quantity: "" }
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
      const response = await fetch(apiUrl + `saftytools?projectCode=` + projectCode, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const descriptions = data.results.map(result => ({
          id: result.id,
          label: result.description,
          value: result.description
        }));
        console.log(descriptions)
        setProjectOptions(descriptions);
      }
    } catch (error) {
      console.error("Additional API Error:", error);
    }
  }

  const FloatingButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={styles.floatingButton} onPress={addRow}>
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

  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const handleDescriptionChange = (index, value) => {
    const newFormData = [...formData];
    newFormData[index].description = value;
    setFormData(newFormData);
  };

  const handleQuantityChange = (index, value) => {
    const newFormData = [...formData];
    newFormData[index].quantity = value;
    setFormData(newFormData);
  };

  const onSubmit = (data) => {
    const safetyTool = formData.map((item, index) => {
      // Get the selected description's ID
      const selectedDescriptionId = projectOptions.find(option => option.value === data[`description${index}`])?.id;

      return {
        SafetyToolId: selectedDescriptionId, // Assuming you want to name it ConsumablesId
        Description: typeof data[`description${index}`] === 'function'
          ? data[`description${index}`]()  // If it's a function, call it to get the value
          : data[`description${index}`],
        Quantity: data[`quantity${index}`],
      };
    }).filter((item) =>
      item.Description && item.Quantity &&
      item.Description.trim() !== '' && item.Quantity.trim() !== ''
    );

    if (safetyTool.length > 0) {
      WizardStore.update((s) => {
        s.progress = "1";
        s.safetyTool = safetyTool;
      });
      navigation.navigate("OperationalMachine");
    } else {
      setShowErrorAlert(true);
    }
  };

  useEffect(() => {
    console.log("Descriptions:", projectOptions);
  }, [projectOptions]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <ProgressBar
          style={styles.progressBar}
          progress={WizardStore.getRawState().progress}
          color={MD3Colors.primary60}
        />
        <View style={{ paddingHorizontal: 10 }}>
          <Alert
            visible={showErrorAlert}
            heading="Validation Error"
            message="At least one Tool & Tackles entry is required."
            onClose={() => setShowErrorAlert(false)}
          />
          <View style={styles.formEntry}>
            {formData.map((item, index) => (
              <View key={index} style={{ marginBottom: 25 }}>
                <Card.Content>
                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.heading}>Description</Text>
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
                      <Text style={styles.heading}>Quantity</Text>
                      <Controller
                        control={control}
                        name={`quantity${index}`}
                        defaultValue={item.quantity}
                        rules={{ required: 'Quantity is required' }}
                        render={({ field }) => (
                          <>
                            <TextInput
                              {...field}
                              placeholder={`Quantity`}
                              value={field.value}
                              onChangeText={(value) => {
                                field.onChange(value);
                                handleQuantityChange(index, value);
                              }}
                            />
                            {errors[`quantity${index}`] && (
                              <Text style={{ color: 'red', paddingTop: 2, fontSize: 12 }}>
                                {errors[`quantity${index}`].message}
                              </Text>
                            )}
                          </>
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
    bottom: 55,
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
  column: {
    flex: 1,
    margin: 4,
  },
  heading: {
    fontWeight: 'bold',
  },
  button: {
    margin: 8,
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
