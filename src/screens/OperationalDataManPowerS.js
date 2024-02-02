import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TextInput, Platform, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Button as PaperButton, Card, Divider, ProgressBar } from "react-native-paper";
import { Controller, useForm } from "react-hook-form";
import { WizardStore } from "../store";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import OperationalConsumables from "./OperationalConsumables";
import { useIsFocused } from "@react-navigation/native";
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
      placeholder="Category"
      searchable={true}
      onChangeItem={(item) => {
        console.log(`Selected Project ${index}:`, item);
        // Add additional logic if needed
      }}
    />
  );
};

export default function OperationalDataManPowerS({ navigation }) {
  const [projectOptions, setProjectOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const projectCodeId = WizardStore.getRawState().Project;
    console.log("Project Code:", projectCodeId);

    try {
      const token = await SecureStore.getItemAsync("token");

      if (token) {
        fetch(apiUrl + 'projectCode/' + projectCodeId, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(response => response.json())
          .then(data => {
            const projectCode = data.projectCode;
            console.log(projectCode);

            return fetchDescription(projectCode, token);
          })
          .then(() => {
            setLoading(false);
          })
          .catch(error => {
            console.error("Error fetching data:", error);
            setLoading(false);
          });
      }
    } catch (error) {
      console.error("Error getting token:", error);
      setLoading(false);
    }
  };

  const fetchDescription = async (projectCode, token) => {
    try {
      const response = await fetch(apiUrl + `manpower?projectCode=${projectCode}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const descriptions = data.results.map(result => ({
          id: result.id,
          label: result.category,
          value: result.category
        }));
        console.log(descriptions);

        setProjectOptions(descriptions);
      }
    } catch (error) {
      console.error("Additional API Error:", error);
    }
  };

  const isFocused = useIsFocused();
  const [openProject, setOpenProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  // const [projectOptions, setProjectOptions] = useState([]);

  useEffect(() => {
    if (isFocused) {
      WizardStore.update((s) => {
        s.progress = "0.5";
      });

      fetchData();
    }
  }, [isFocused]);


  const { handleSubmit, control, formState: { errors }, reset } = useForm({
    mode: "onBlur",
    defaultValues: WizardStore.useState((s) => s),
  });

  const [formData, setFormData] = useState([
    {
      quantity: "",
      name: "",
      timeIn: new Date(0, 0, 0, 12, 0, 0),
      timeOut: new Date(0, 0, 0, 12, 0, 0),
    },
  ]);

  const FloatingButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={styles.floatingButton} onPress={addRow}>
        <FontAwesome
          name="plus"
          color='white'
          size={20}
        >
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

  const [isTimeInPickerVisible, setTimeInPickerVisible] = useState(false);
  const [isTimeOutPickerVisible, setTimeOutPickerVisible] = useState(false);

  const showTimeInPicker = (index) => {
    setTimeInPickerVisible(true);
    setFormData((prevData) => {
      const newFormData = [...prevData];
      newFormData[index].selectedTimeIndex = index;
      return newFormData;
    });
  };

  const showTimeOutPicker = (index) => {
    setTimeOutPickerVisible(true);
    setFormData((prevData) => {
      const newFormData = [...prevData];
      newFormData[index].selectedTimeIndex = index;
      return newFormData;
    });
  };

  const hideTimeInPicker = () => {
    setTimeInPickerVisible(false);
  };

  const hideTimeOutPicker = () => {
    setTimeOutPickerVisible(false);
  };

  const handleTimeInConfirm = (date) => {
    hideTimeInPicker();
    if (date !== undefined) {
      const index = formData[0].selectedTimeIndex;
      const newFormData = [...formData];
      newFormData[index].timeIn = date;
      setFormData(newFormData);
    }
  };

  const handleTimeOutConfirm = (date) => {
    hideTimeOutPicker();
    if (date !== undefined) {
      const index = formData[0].selectedTimeIndex;
      const newFormData = [...formData];
      newFormData[index].timeOut = date;
      setFormData(newFormData);
    }
  };

  const addRow = () => {
    setFormData((prevData) => [
      ...prevData,
      {
        name: "",
        product: "",
        timeIn: new Date(0, 0, 0, 12, 0, 0),
        timeOut: new Date(0, 0, 0, 12, 0, 0),
      },
    ]);
  };

  const removeRow = (indexToRemove) => {
    setFormData((prevData) => {
      const newFormData = prevData.filter((_, index) => index !== indexToRemove);
      return newFormData;
    });
  };

  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const handleDescriptionChange = (index, value) => {
    const newFormData = [...formData];
    newFormData[index].product = value;
    setFormData(newFormData);
  };

  const handleQuantityChange = (index, value) => {
    const newFormData = [...formData];
    newFormData[index].name = value;
    setFormData(newFormData);
  };

  const onSubmit = (data) => {

    const manpower = formData.map((item, index) => {
      // Get the selected description's ID
      const selectedDescriptionId = projectOptions.find(option => option.value === data[`category${index}`])?.id;

      return {
        ManPowerId: selectedDescriptionId, // Assuming you want to name it ConsumablesId
        Description: typeof data[`category${index}`] === 'function'
          ? data[`category${index}`]()  // If it's a function, call it to get the value
          : data[`category${index}`],
        TimeIn: item.timeIn,
        TimeOut: item.timeOut,
      };
    }).filter((item) =>
      item.Description &&
      item.Description.trim() !== ''
    );


    const vv = formData.map((item, index) => ({
      product: data[`product${index}`],
      name: data[`name${index}`],
      TimeIn: item.timeIn,
      TimeOut: item.timeOut,
    })).filter((item) =>
      item.name && item.product &&
      item.name.trim() !== '' && item.product.trim() !== ''
    );

    if (manpower.length > 0) {
      WizardStore.update((s) => {
        s.progress = '0.5';
        s.manpower = manpower;
      });

      navigation.navigate("OperationalConsumables");
    } else {
      setShowErrorAlert(true);
    }
  };



  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <ProgressBar
          style={styles.progressBar}
          progress={WizardStore.getRawState().progress}
        />
        <View style={{ paddingHorizontal: 10 }}>
          <Alert
            visible={showErrorAlert}
            heading="Validation Error"
            message="At least one man power entry is required."
            onClose={() => setShowErrorAlert(false)}
          />

          {loading && (
            <ActivityIndicator
              style={{ marginTop: 20 }}
              size="large"
              color="#0000ff"
            />
          )}

          {!loading && (
            <>
              <View style={styles.formEntry}>
                {formData.map((item, index) => (
                  <View key={index} style={{ marginBottom: 25 }}>
                    <Card.Content>
                      <View style={styles.row}>
                        <View style={styles.column}>
                          <Text style={styles.heading}>Category</Text>
                          <Controller
                            control={control}
                            name={`category${index}`}
                            defaultValue=''
                            rules={{ required: 'Category is required' }}
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
                                {errors[`category${index}`] && (
                                  <Text style={{ color: 'red', paddingTop: 2, fontSize: 12 }}>
                                    {errors[`category${index}`].message}
                                  </Text>
                                )}
                              </>
                            )}
                          />

                        </View>
                      </View>

                      <View style={styles.row}>
                        <View style={styles.column}>
                          <Text style={styles.heading}>Working Time In</Text>
                          <PaperButton
                            onPress={() => showTimeInPicker(index)}
                            style={styles.timeButton}
                          >
                            {item.timeIn.toLocaleTimeString()}
                          </PaperButton>
                          <DateTimePickerModal
                            isVisible={isTimeInPickerVisible && item.selectedTimeIndex === index}
                            mode="time"
                            onConfirm={handleTimeInConfirm}
                            style={styles.dateTimePickerModal}
                            onCancel={hideTimeInPicker}
                          />
                        </View>
                        <View style={styles.column}>
                          <Text style={styles.heading}>Working Time Out</Text>
                          <PaperButton
                            onPress={() => showTimeOutPicker(index)}
                            style={styles.timeButton}
                          >
                            {item.timeOut.toLocaleTimeString()}
                          </PaperButton>
                          <DateTimePickerModal
                            isVisible={isTimeOutPickerVisible && item.selectedTimeIndex === index}
                            mode="time"
                            onConfirm={handleTimeOutConfirm}
                            style={styles.dateTimePickerModal}
                            onCancel={hideTimeOutPicker}
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
                        }}
                      />
                    </Card.Actions>
                  </View>
                ))}
              </View>

              <Divider />
              <FloatingButton />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              </View>
            </>
          )}
        </View>
        <PreviousButton />
        <NextButton />
      </View>
    </ScrollView>
  );
}
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
  titleStyle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
const styles2 = StyleSheet.create({
  flexContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  flexItem: {
    flex: 1,
  },
});

const styles = StyleSheet.create({
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
  scrollContainer: {
    flexGrow: 1,
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
    // bottom:130,
    paddingVertical: 10,
  },

  container: {
    flex: 1,
    backgroundColor: '#FBFAEB',
  },
  card: {
    marginBottom: 16,
  },
  card1: {
    paddingHorizontal: 0,
    paddingVertical: 0
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
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    margin: 3,
    width: 50,
    height: 30,
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
  removeButton: {
    margin: 8,
    flex: 1,
  },
  addButton: {
    margin: 8,
    width: 100,
  },
  progressBar: {
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  formEntry: {
    margin: 3,
  },
  timeButton: {
    alignSelf: 'flex-start',
    marginVertical: 0,
  },
  dateTimePickerModal: {

    justifyContent: 'left',
    alignItems: 'left',
    margin: 0,
  },
  createButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#665208',
  },
  actionIcon: {
    paddingHorizontal: 3,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton1: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
