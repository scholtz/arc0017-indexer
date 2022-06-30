import { gql } from '@apollo/client/core';
import getApolloClient from '../common/getApolloClient';
import { Escrow, Escrow_Min_Fields, Offer_Min_Fields } from '../generated/graphql';
import { InsertTransaction } from './insertTransaction';

const query = gql`
  mutation upsert_offer($id: String!, $owner: String!, $volume: bigint!, $assetBuy: bigint!, $assetSell: bigint!, $env: Int!, $price: float8!) {
    insert_offer(
      objects: [{ id: $id, owner: $owner, volume: $volume, assetBuy: $assetBuy, assetSell: $assetSell, price: $price, env: $env }]
      on_conflict: { constraint: offer_pkey, update_columns: [owner, volume, assetBuy, assetSell, price, env] }
    ) {
      affected_rows
      returning {
        id
        created_at
        updated_at
      }
    }
  }
`;
const upsertOffer = async (item: InsertTransaction, insertResult: any, escrow: Escrow_Min_Fields) => {
  const client = getApolloClient();
  const toUpdate = {
    id: item.account,
    owner: escrow.seller,
    price: escrow.price / escrow.multiplier,
    assetBuy: escrow.assetBuy,
    assetSell: escrow.assetSell,
    volume: insertResult.data.insert_transaction.returning[0].balance,
    env: escrow.env
  };
  console.log('upserting offer', item, insertResult, insertResult.data.insert_transaction.returning[0], escrow, toUpdate);
  return await client.mutate({
    mutation: query,
    variables: toUpdate,
  });
};

export default upsertOffer;
