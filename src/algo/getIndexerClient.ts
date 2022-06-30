import algosdk from 'algosdk';
import { CustomTokenHeader } from 'algosdk/dist/types/src/client/urlTokenBaseHTTPClient';
import getSecureConfiguration from '../common/getSecureConfiguration';

const getIndexerClient = () => {
  const config = getSecureConfiguration();
  const auth: CustomTokenHeader = {};
  auth[config.indexer.header] = config.indexer.token;
  return new algosdk.Indexer(auth, config.indexer.host, config.indexer.port);
};
export default getIndexerClient;
