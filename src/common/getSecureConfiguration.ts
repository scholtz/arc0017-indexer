/**
 * To generate secure key and iv, use openssl rand -hex 16
 */
import getAppConfiguration from './getAppConfiguration';
import CryptoJS from 'crypto-js';
import StorageConfiguration, { StorageConfigurationTypeEnum } from '../interface/configuration/StorageConfiguration';
import SecureConfiguration from '../interface/configuration/SecureConfiguration';
import getLogger from './getLogger';
const storage: StorageConfiguration = require('../../env/data.json');
let currentConfiguration: SecureConfiguration = null;
const getSecureConfiguration = (): SecureConfiguration => {
  const logger = getLogger();
  try {
    if (currentConfiguration !== null) return currentConfiguration;
    const appConfig = getAppConfiguration();
    const ivStr: string = process.env.IV;
    if (!storage.encryption || storage.encryption === StorageConfigurationTypeEnum.plain || !ivStr) {
      const fileStorage: SecureConfiguration = require('../../env/secure.json');
      logger.error('STORAGE IS NOT ENCRYPTED!!!');
      currentConfiguration = fileStorage;
      return fileStorage;
    }
    if (storage.encryption === StorageConfigurationTypeEnum.base64Aes256KeyAppIVEnv) {
      if (!ivStr) throw 'Missing environmental variable IV';
      if (ivStr.length != 32) throw 'IV must be 32 bytes long hex number.';
      if (!appConfig.encryptionKey) throw 'Missing encryption key';
      if (appConfig.encryptionKey.length != 32) throw 'Encryption key must be 32 bytes long hex number';

      const keyEnc = CryptoJS.enc.Hex.parse(appConfig.encryptionKey);
      const ivEnc = CryptoJS.enc.Hex.parse(ivStr);
      const data = storage.data;
      var decrypted = CryptoJS.AES.decrypt(data, keyEnc, { iv: ivEnc });
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
      const json: SecureConfiguration = JSON.parse(decryptedStr);
      currentConfiguration = json;
      return json;
    }
    throw `Storage type ${storage.encryption} not supported`;
  } catch (e) {
    logger.error('Error reading secure configuration', e);
    return null;
  }
};
export default getSecureConfiguration;
