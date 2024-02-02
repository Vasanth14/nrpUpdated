import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Constants from "expo-constants";
import DropDownPicker from "react-native-dropdown-picker";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { WizardStore } from "../store";
import { Button, MD3Colors, ProgressBar, TextInput } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import OperationalDataManPowerS from "./OperationalDataManPowerS";
import DatePicker from "react-native-modern-datepicker";
import { getFormatedDate } from "react-native-modern-datepicker";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as SecureStore from "expo-secure-store";
import environment from "../env";

export default function OperationalDataScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerTitle: "Daily Operational Data",
    });
    navigation.setOptions({ title: "" });
  }, [navigation]);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: WizardStore.useState((s) => {
      return s;
    }),
  });

  const isFocused = useIsFocused();
  useEffect(() => {
    isFocused &&
      WizardStore.update((s) => {
        s.progress = "0.1";
      });
  }, [isFocused]);

  useEffect(() => {
    const currentDate = new Date();
    const formattedDate =
      currentDate.getDate().toString().padStart(2, "0") +
      "-" +
      (currentDate.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      currentDate.getFullYear();
    setValue("currentDate", formattedDate);
  }, [setValue]);

  const handleTextInputFocus = () => {
    Alert.alert("Date Edit Alert", "You can't edit the date.");
  };

  const NextButton = ({ onPress }) => {
    return (
      <TouchableOpacity
        style={styles.NextButton}
        onPress={handleSubmit(onSubmit)}
      >
        <FontAwesome
          name="chevron-right"
          color="white"
          size={20}
          style={styles.nextIcon}
        />
      </TouchableOpacity>
    );
  };

  const onSubmit = (data) => {
    console.log("Selected Project Company:", valueProjectCompany);
    WizardStore.update(
      (s) => {
        s.progress = 0.2;
        s.Project = valueProject;
        s.ProjectCompany = valueProjectCompany;
        s.Location = data.Location;
        s.Date = data.currentDate;
        s.Chainage = data.Chainage;
        s.ProjectMaster = valueProjectMaster;
        s.Activity = valueActivity;
        s.JobIdentification = data.JobIdentification;
      },
      () => {
        navigation.navigate(OperationalDataManPowerS);
      }
    );
  };

  const { apiUrl } = environment();

  const [openProject, setOpenProject] = useState(false);
  const [valueProject, setValueProject] = useState(null);
  const [itemsProject, setItemsProject] = useState([]);

  const [openProjectCompany, setOpenProjectCompany] = useState(false);
  const [valueProjectCompany, setValueProjectCompany] = useState(null);
  const [itemsProjectCompany, setItemsProjectCompany] = useState([]);

  const [openLocation, setOpenLocation] = useState(false);
  const [valueLocation, setValueLocation] = useState(null);
  const [itemsLocation, setItemsLocation] = useState([]);

  const [projectChainage, setProjectchainage] = useState([])

  const [openProjectMaster, setOpenProjectMaster] = useState(false);
  const [valueProjectMaster, setValueProjectMaster] = useState(null);
  const [itemsProjectMaster, setItemsProjectMaster] = useState([]);

  useEffect(() => {
    const fetchData = async (token) => {
      try {
        if (token) {
          const response = await fetch(apiUrl + "projectMaster/getallmasters", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          // const projectMasterOptions = data.results.map((item) => ({
          //   label: item.projectMaster,
          //   value: item.id,
          // }));

          const projectMasterOptions = [];

          data.forEach((item) => {
            projectMasterOptions.push({
              label: item.projectMaster,
              value: item.id,
            });
          });

          setItemsProjectMaster(projectMasterOptions);
        } else {
          console.error("Token not found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchProjectData = async (token) => {
      try {
        if (token) {
          const response = await fetch(apiUrl + "projectCode/allprojectcode", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          console.log("datttta" + JSON.stringify(data.length));
          console.log("datttta" + JSON.stringify(data));
          const projectOptions = [];
          data.forEach((item) => {
            projectOptions.push({
              label: item.projectCode,
              value: item.id,
            });
          });
          setItemsProject(projectOptions);
        } else {
          console.error("Token not found");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    const fetchDataAndProjectData = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        await fetchData(token);
        await fetchProjectData(token);
      } catch (error) {
        console.error("Error getting token or fetching data:", error);
      }
    };

    fetchDataAndProjectData();
  }, []);

  const fetchProjectActivities = async (selectedProjectMaster) => {
    console.log(selectedProjectMaster)
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
        const response = await fetch(
          apiUrl + "projectMaster/" + selectedProjectMaster,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        const projectActivitiesOptions = data.projectMasterActivity.map(
          (item) => ({
            label: item,
            value: item,
          })
        );
        setItemsActivity(projectActivitiesOptions);
      }
    } catch (error) {
      //fake data
      const data = { projectMasterActivity: ["test1", "test2"] };
      const projectActivitiesOptions = data.projectMasterActivity.map(
        (item) => ({
          label: item,
          value: item,
        })
      );
      setItemsActivity(projectActivitiesOptions);
      console.error("Error fetching project activities:", error);
    }
  };

  const fetchCompanyLocation = async (selectedProjectMaster) => {
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
        const response = await fetch(
          apiUrl + "projectCode/" + selectedProjectMaster,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        const projectCompanyOptions = {
          label: data.projectCompany,
          value: data.projectCompany,
        };
        setItemsProjectCompany([projectCompanyOptions]);

        const projectLocationOptions = {
          label: data.location,
          value: data.location,
        }
        console.log(projectLocationOptions);
        setItemsLocation([projectLocationOptions]);

        const projectChainageOptions = {
          label: data.chainage,
          value: data.chainage,
        }
        console.log(projectChainageOptions);
        setProjectchainage([projectChainageOptions]);
      }
    } catch (error) {
      console.error("Error fetching project Company Location:", error);
    }
  };

  const [openActivity, setOpenActivity] = useState(false);
  const [valueActivity, setValueActivity] = useState(null);
  const [itemsActivity, setItemsActivity] = useState([]);

  const today = new Date();
  const startDate = getFormatedDate(
    today.setDate(today.getDate() + 1),
    "MM/DD/YYYY"
  );
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [startedDate, setStartedDate] = useState("");

  function handleChangeStartDate(propDate) {
    setStartedDate(propDate);
  }

  const handleOnPressStartDate = () => {
    console.log("sadsfds");
    setOpenStartDatePicker(!openStartDatePicker);
  };

  return (
    // <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      <ProgressBar
        style={styles.progressBar}
        progress={WizardStore.getRawState().progress}
        color={MD3Colors.primary60}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View
            style={{
              flex: 1,
              alignItems: 'start',
              justifyContent: 'start',
              paddingHorizontal: 10,
            }}>
            <Text style={styles.label}>Project Code</Text>
            <Controller
              control={control}
              rules={{ required: "Project Code is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <DropDownPicker
                    open={openProject}
                    value={value}
                    items={itemsProject}
                    setOpen={setOpenProject}
                    setValue={(value) => {
                      setValueProject(value);
                      fetchCompanyLocation(value());
                      onChange(value);
                    }}
                    setItems={setItemsProject}
                    placeholder="Select Project Code"
                    searchable={true}
                    onBlur={onBlur}
                    listMode="SCROLLVIEW"
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                    }}
                  />
                  {errors.Project && (
                    <Text style={{ paddingTop: 2, color: "red" }}>
                      {errors.Project.message}
                    </Text>
                  )}
                </View>
              )}
              name="Project"
            />
          </View>

          <View
            style={{
              flex: 1,
              alignItems: 'start',
              justifyContent: 'start',
              paddingHorizontal: 10,
              zIndex: 0,
            }}>
            <Text style={styles.label}>Project Company</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <DropDownPicker
                    open={openProjectCompany}
                    value={value || itemsProjectCompany[0]?.value}
                    items={itemsProjectCompany}
                    setOpen={setOpenProjectCompany}
                    setValue={(value) => {
                      setValueProjectCompany(value);
                      onChange(value);
                    }}
                    setItems={setItemsProjectCompany}
                    placeholder="Select Project Company"
                    searchable={true}
                    disabled={true}
                    onBlur={onBlur}
                  />
                  {errors.ProjectCompany && (
                    <Text style={{ color: "red" }}>
                      {errors.ProjectCompany.message}
                    </Text>
                  )}
                </View>
              )}
              name="ProjectCompany"
            />
          </View>

          <View
            style={{
              flex: 1,
              alignItems: 'start',
              justifyContent: 'start',
              paddingHorizontal: 10,
            }}>
            <Text style={styles.label}>Location</Text>
            <Controller
              control={control}
              rules={{
                required: "Location is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  placeholder="Enter Location"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="Location"
            />
            {errors.Location && (
              <Text style={{ margin: 8, marginLeft: 16, color: "red" }}>
                This is a required field.
              </Text>
            )}
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'start',
              justifyContent: 'start',
              paddingHorizontal: 10,
            }}>
            <Text style={styles.label}>Date</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  value={value}
                  onFocus={handleTextInputFocus}
                  editable={false}
                  onBlur={() => { }}
                />
              )}
              name="currentDate"
              defaultValue=""
            />
          </View>

          <View
            style={{
              flex: 1,
              alignItems: 'start',
              justifyContent: 'start',
              paddingHorizontal: 10,
            }}>
            <Text style={styles.label}>Chainage</Text>
            <Controller
              control={control}
              rules={{
                required: "Chainage is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  placeholder="Enter Chainage"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="Chainage"
            />
            {errors.Chainage && (
              <Text style={{ paddingTop: 2, color: "red" }}>
                {errors.Chainage.message}
              </Text>
            )}
          </View>

          <View
            style={{
              flex: 1,
              alignItems: 'start',
              justifyContent: 'start',
              paddingHorizontal: 10,
            }}>
            <Text style={styles.label}>Project Master</Text>
            <Controller
              control={control}
              rules={{ required: "Project Master is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <DropDownPicker
                  open={openProjectMaster}
                  value={value}
                  items={itemsProjectMaster}
                  setOpen={setOpenProjectMaster}
                  setValue={(value) => {
                    setValueProjectMaster(value);
                    fetchProjectActivities(value());
                    onChange(value);
                  }}
                  onChangeItem={(item) => {
                    setSelectedProjectMaster(item.value);
                    onChange(item.value);
                  }}
                  setItems={setItemsProjectMaster}
                  placeholder="Select Project Master"
                  searchable={true}
                  onBlur={onBlur}
                />
              )}
              name="ProjectMaster"
            />
            {errors.ProjectMaster && (
              <Text style={{ paddingTop: 2, color: "red" }}>
                {errors.ProjectMaster.message}
              </Text>
            )}
          </View>

          <View
            style={{
              flex: 1,
              alignItems: 'start',
              justifyContent: 'start',
              paddingHorizontal: 10,
            }}>
            <Text style={styles.label}>Daily Activity</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <DropDownPicker
                  open={openActivity}
                  value={value}
                  items={itemsActivity}
                  setOpen={setOpenActivity}
                  setValue={(value) => {
                    setValueActivity(value);
                    onChange(value);
                  }}
                  setItems={setItemsActivity}
                  placeholder="Select Activity"
                  searchable={true}
                />
              )}
              name="Activity"
            />
            {errors.Activity && (
              <Text style={{ margin: 8, marginLeft: 16, color: "red" }}>
                This is a required field.
              </Text>
            )}
          </View>

          <View
            style={{
              flex: 1,
              alignItems: 'start',
              justifyContent: 'start',
              paddingHorizontal: 10,
            }}>
            <Text style={styles.label}>Job Indentification</Text>
            <Controller
              control={control}
              rules={{
                required: "Job Identification is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  placeholder="Enter Job Identification"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="JobIdentification"
            />
            {errors.JobIdentification && (
              <Text style={{ paddingTop: 2, color: "red" }}>
                {errors.JobIdentification.message}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      <NextButton />
    </View>
    // </ScrollView>
  );
}
const styles = StyleSheet.create({
  NextButton: {
    backgroundColor: "#665208",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
    elevation: 8,
  },
  button: {
    margin: 8,
    Color: "#FBFBFB",
    backgroundColor: "#665208",
  },
  container: {
    flex: 1,
    backgroundColor: "#FBFAEB",
  },
  progressBar: {
    marginBottom: 16,
  },
  titleStyle: {
    color: "white",
    fontSize: 12,
    margin: 0,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 0,
    marginHorizontal: 0,
    marginVertical: 5,
  },
  modalView: {
    margin: 20,
    backgroundColor: "#665208",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: 35,
    width: 90,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inputBtn: {
    backgroundColor: "white",
    borderColor: "black",
    borderRadius: 10,
    height: 48,
    margin: 0,
    paddingTop: 0,
    paddingBottom: 0,
    letterSpacing: 0.15,
  },
  textStyle: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: 12,
    fontWeight: "300",
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: "#665208",
    marginTop: 10,
    width: 70,
    height: 32,
    margin: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
});
