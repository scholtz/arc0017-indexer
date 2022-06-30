import algosdk from 'algosdk';
import computeTransactionId from '../algo/computeTransactionId';
import QuestionV1 from '../interface/QuestionV1';
import setQuestion from '../repository/insertQuestion';
import { Question } from '../generated/graphql';
import moment from 'moment';
import getTokenId from './getTokenId';
import getAsaId from './getAsaId';

const processQuestionV1 = async (data: QuestionV1, round: number, stxn: any, block: any) => {
  //console.log("processQuestionV2",data)
  //console.log(stxn)
  const txId = computeTransactionId(block.gh, block.gen, stxn);
  const asa = getAsaId(stxn);

  const tokenId = await getTokenId(stxn);

  const publish: Question = {
    title: data.t ?? '',
    text: data.q ?? '',
    url: data.url ?? '',
    category: data.category ?? 'any',
    encryption_address: data.e ?? '',
    json: JSON.stringify(data),
    questioner: algosdk.encodeAddress(stxn.txn.snd),
    token: tokenId,
    asa: asa,
    env: stxn.txn.gen,
    ending_round: data.max,
    open_from_round: round,
    open_from_time: moment(block.ts, 'X').toISOString(),
    tx: txId,
    created_at: undefined,
    id: 0,
    updated_at: undefined,
  };
  console.log('publish', publish);
  const ret = await setQuestion(publish);
  console.log('ret', ret);
};
export default processQuestionV1;
