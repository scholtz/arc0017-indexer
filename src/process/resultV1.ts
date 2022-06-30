import algosdk from 'algosdk';
import computeTransactionId from '../algo/computeTransactionId';
import ResultV1 from '../interface/ResultV1';
import insertResult from '../repository/insertResult';
import { Result } from '../generated/graphql';
import getToken from '../repository/getAllEscrows';
import createToken from './createToken';
import moment from 'moment';
import getTokenId from './getTokenId';
import getAsaId from './getAsaId';

const processResultV1 = async (data: ResultV1, round: number, stxn: any, block: any) => {
  const txId = computeTransactionId(block.gh, block.gen, stxn);

  const tokenId = await getTokenId(stxn);
  const asa = getAsaId(stxn);
  const publish: Result = {
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
    questiontx: data.q,
    encryption_key: data.e,
  };
  console.log('publish', publish);
  const ret = await insertResult(publish);
  console.log('ret', ret);
};
export default processResultV1;
