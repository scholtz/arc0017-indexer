import NodeConfiguration from './NodeConfiguration';

type SecureConfiguration = {
  indexerId: number;
  mn: string;
  authGenesisID: string;
  authGenesisHash: string;
  authRealm: string;
  algod: NodeConfiguration;
  indexer: NodeConfiguration;
  graphQLServer: string;
};
export default SecureConfiguration;
