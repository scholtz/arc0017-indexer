import algosdk from 'algosdk';
import computeTransactionId from '../algo/computeTransactionId';
import TrustedListV1 from '../interface/TrustedListV1';
import insertTrustedList from '../repository/insertTrustedList';
import { Trusted_List } from '../generated/graphql';
import getToken from '../repository/getAllEscrows';
import createToken from './createToken';
import moment from 'moment';
import getTokenId from './getTokenId';
import getAsaId from './getAsaId';

const processTrusted_ListV1 = async (data: TrustedListV1, round: number, stxn: any, block: any) => {
  const txId = computeTransactionId(block.gh, block.gen, stxn);

  const tokenId = await getTokenId(stxn);
  const asa = getAsaId(stxn);

  const publish: Trusted_List = {
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
  const ret = await insertTrustedList(publish);
  console.log('ret', ret);
};
export default processTrusted_ListV1;
