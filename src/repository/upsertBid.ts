import { gql } from '@apollo/client/core';
import getApolloClient from '../common/getApolloClient';
import { Escrow, Escrow_Min_Fields, Offer_Min_Fields } from '../generated/graphql';
import { InsertTransaction } from './insertTransaction';

const query = gql`
  mutation upsert_bid($id: String!, $owner: String!, $volumeAsa2: bigint!, $assetBuy: bigint!, $assetSell: bigint!, $env: Int!, $price: float8!, $volume: float8!) {
    insert_bid(
      objects: [{ id: $id, owner: $owner, volumeAsa2: $volumeAsa2, assetBuy: $assetBuy, assetSell: $assetSell, price: $price, volume: $volume, env: $env }]
      on_conflict: { constraint: bid_pkey, update_columns: [owner, volumeAsa2, assetBuy, assetSell, price, volume, env] }
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
const upsertBid = async (item: InsertTransaction, insertResult: any, escrow: Escrow_Min_Fields) => {
  const client = getApolloClient();
  const toUpdate = {
    id: item.account,
    owner: escrow.seller,
    price: 1 / (escrow.price / escrow.multiplier),
    volume: (1 / (escrow.price / escrow.multiplier)) * insertResult.data.insert_transaction.returning[0].balance,
    assetBuy: escrow.assetSell,
    assetSell: escrow.assetBuy,
    volumeAsa2: insertResult.data.insert_transaction.returning[0].balance,
    env: escrow.env,
  };
  console.log('upserting bid', item, insertResult, insertResult.data.insert_transaction.returning[0], escrow, toUpdate);
  return await client.mutate({
    mutation: query,
    variables: toUpdate,
  });
};

export default upsertBid;
