import asyncDelay from '../common/asyncDelay';
import getToken from '../repository/getAllEscrows';
import createToken from './createToken';
import getAsaId from './getAsaId';

const getTokenId = async (stxn: any) => {
  const asa = getAsaId(stxn);
  let tokenId = await getToken(asa, stxn.txn.gen);
  console.log('token', tokenId);
  if (!tokenId) {
    await createToken(asa, stxn.txn.gen);
    await asyncDelay(1000);
    tokenId = await getToken(asa, stxn.txn.gen);
  }
  return tokenId;
};
export default getTokenId;
