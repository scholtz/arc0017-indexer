import algosdk from 'algosdk';
import computeTransactionId from '../algo/computeTransactionId';
import VoteV1 from '../interface/VoteV1';
import insertVote from '../repository/insertVote';
import { Vote } from '../generated/graphql';
import getTokenId from './getTokenId';
import getAsaId from './getAsaId';

const processVoteV1 = async (data: VoteV1, round: number, stxn: any, block: any) => {
  const txId = computeTransactionId(block.gh, block.gen, stxn);

  const tokenId = await getTokenId(stxn);
  const asa = getAsaId(stxn);

  const publish: Vote = {
    tx: txId,
    address: algosdk.encodeAddress(stxn.txn.snd),
    asa: asa,
    env: stxn.txn.gen,
    json: JSON.stringify(data),
    questiontx: data.q ?? '',
    round: round,
    token: tokenId,
    id: 0,
    created_at: undefined,
    updated_at: undefined,
  };
  console.log('publish', publish);
  const ret = await insertVote(publish);
  console.log('ret', ret);
};
export default processVoteV1;
