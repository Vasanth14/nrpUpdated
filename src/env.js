const ENV = {
  development: {
    apiUrl: 'https://api.nrppms.in/v1/',
  },
  production: {
    apiUrl: 'https://api.nrppms.in/v1/',
  },
};

// const environment = (env = Constants.manifest.releaseChannel) => {
//   if (__DEV__) {
//     return ENV.development;
//   } else if (env === 'production') {
//     return ENV.production;
//   }
// };

const environment = () => {
  return ENV.production;
};

export default environment;
