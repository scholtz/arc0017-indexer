import insertToken from '../repository/insertEscrow';
import getIndexerClient from '../algo/getIndexerClient';
import { Token } from '../generated/graphql';

const createToken = async (asa: number, env: string) => {
  if (asa === 0) {
    const token: Token = {
      asa: asa,
      creator: '',
      manager: '',
      clawback: '',
      freeze: '',
      reserve: '',
      env: env,
      name: 'Algorand',
      url: 'https://www.algorand.com',
      unit: 'Algo',
      total: 10000000000000000,
      decimals: 6,
      created_at_round: 1,
      id: 0,
      created_at: undefined,
      updated_at: undefined,
      icon: '',
    };
    return await insertToken(token);
  } else {
    const indexer = getIndexerClient();
    const data = await indexer.lookupAssetByID(asa).do();
    const token: Token = {
      asa: asa,
      creator: data.asset.params.creator,
      manager: data.asset.params.manager,
      clawback: data.asset.params.clawback,
      freeze: data.asset.params.freeze,
      reserve: data.asset.params.reserve,
      env: env,
      name: data.asset.params.name,
      url: data.asset.params.url,
      unit: data.asset.params['unit-name'],
      total: data.asset.params.total,
      decimals: data.asset.params.decimals,
      created_at_round: data.asset['created-at-round'],
      id: 0,
      created_at: undefined,
      updated_at: undefined,
      icon: '',
    };
    return await insertToken(token);
  }
};
export default createToken;
