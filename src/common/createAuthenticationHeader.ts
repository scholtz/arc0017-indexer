import algosdk from 'algosdk';
import getSecureConfiguration from './getSecureConfiguration';

const createAuthenticationHeader = () => {
  const config = getSecureConfiguration();
  const account = algosdk.mnemonicToSecretKey(config.mn);
  const suggestedParams: algosdk.SuggestedParams = {
    fee: 0,
    firstRound: 0,
    lastRound: 30000000, // long term service token durability
    genesisID: config.authGenesisID,
    genesisHash: config.authGenesisHash,
  };
  const tx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    amount: 0,
    from: account.addr,
    to: account.addr,
    note: new Uint8Array(Buffer.from(config.authRealm, 'utf-8')),
    suggestedParams: suggestedParams,
  });
  const signed = tx.signTxn(account.sk);
  const b64 = Buffer.from(signed.buffer).toString('base64');
  const ret = `SigTx ${b64}`;
  return ret;
};
export default createAuthenticationHeader;
