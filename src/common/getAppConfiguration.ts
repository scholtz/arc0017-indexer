import AppConfiguration from '../interface/configuration/AppConfiguration';

const config: AppConfiguration = require('../../env/app.json');

const getAppConfiguration = () => {
  return config;
};
export default getAppConfiguration;
