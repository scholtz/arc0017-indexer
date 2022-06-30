import algosdk from 'algosdk';
import { CustomTokenHeader } from 'algosdk/dist/types/src/client/urlTokenBaseHTTPClient';
import getLogger from '../common/getLogger';
import getSecureConfiguration from '../common/getSecureConfiguration';

const getAlgodClient = () => {
  const config = getSecureConfiguration();
  const auth: CustomTokenHeader = {};
  auth[config.algod.header] = config.algod.token;
  const logger = getLogger();
  logger.info(`Connecting to algod ${config.algod.host}`);
  return new algosdk.Algodv2(auth, config.algod.host, config.algod.port);
};
export default getAlgodClient;
