import { gql } from '@apollo/client/core';
import { Escrow, Escrow_Min_Fields } from '../generated/graphql';
import getApolloClient from '../common/getApolloClient';
const query = gql`
  query GetAllEscrows {
    escrow {
      address
      seller
      assetBuy
      assetSell
      price
      multiplier
      env
    }
  }
`;
const getAllEscrows = async () => {
  const client = getApolloClient();
  const res = await client.query({
    query: query,
  });
  if (!res || !res.data || !res.data.escrow) return new Map<string, Escrow_Min_Fields>();
  const escrowData = res.data.escrow as Array<Escrow_Min_Fields>;
  if (escrowData.length == 0) return new Map<string, Escrow_Min_Fields>();
  const map = new Map<string, Escrow_Min_Fields>();

  escrowData.forEach((item: Escrow_Min_Fields) => {
    map.set(item.address, item);
  });
  return map;
};

export default getAllEscrows;
