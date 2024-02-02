import { registerInDevtools, Store } from "pullstate";



export const WizardStore = new Store({
  Project:"",
  ProjectCode:"",
  ProjectCompany:"",
  Location:"",
  Date:"",
  Chainage:"",
  ProjectMaster:"",
  Activity:"",
  JobIdentification:"",
  progress: "0.1",
  manpower:[],
  instrumentData: [],
  consumablesData:[],
  tooltacklesData:[],
  safetyTool:[],
  machine:[],
});

registerInDevtools({
  WizardStore,
});