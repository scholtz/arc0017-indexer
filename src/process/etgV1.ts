import algosdk from 'algosdk';
import computeTransactionId from '../algo/computeTransactionId';
import EtgV1 from '../interface/EtgV1';
import insertEtg from '../repository/insertEtg';
import { Etg } from '../generated/graphql';
import getToken from '../repository/getAllEscrows';
import createToken from './createToken';
import moment from 'moment';
import getTokenId from './getTokenId';
import getAsaId from './getAsaId';

const processEtgV1 = async (data: EtgV1, round: number, stxn: any, block: any) => {
  const txId = computeTransactionId(block.gh, block.gen, stxn);

  const tokenId = await getTokenId(stxn);
  const asa = getAsaId(stxn);

  const publish: Etg = {
    tx: txId,
    account: algosdk.encodeAddress(stxn.txn.snd),
    asa: asa,
    env: stxn.txn.gen,
    json: JSON.stringify(data),
    round: round,
    token: tokenId,
    id: 0,
    created_at: undefined,
    updated_at: undefined,
  };
  console.log('publish', publish);
  const ret = await insertEtg(publish);
  console.log('ret', ret);
};
export default processEtgV1;
