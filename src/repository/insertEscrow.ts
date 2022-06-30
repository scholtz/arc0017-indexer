import { gql } from '@apollo/client/core';
import getApolloClient from '../common/getApolloClient';
import { Escrow, Escrow_Min_Fields } from '../generated/graphql';

const query = gql`
  mutation insert_escrow($address: String!, $seller: String!, $ver: String!, $lsig: String!, $assetBuy: bigint!, $assetSell: bigint!, $price: bigint!, $multiplier: bigint!, $env: Int!) {
    insert_escrow(
      objects: { address: $address, seller: $seller, ver: $ver, lsig: $lsig, assetBuy: $assetBuy, assetSell: $assetSell, price: $price, multiplier: $multiplier, env: $env }
      on_conflict: { constraint: escrow_pkey, update_columns: [address, seller, ver, lsig, assetBuy, assetSell, price, multiplier, env] }
    ) {
      affected_rows
      returning {
        address
        created_at
        updated_at
      }
    }
  }
`;
const insertEscrow = async (item: Escrow_Min_Fields) => {
  const client = getApolloClient();
  console.log('inserting escrow', item);
  return await client.mutate({
    mutation: query,
    variables: {
      address: item.address,
      seller: item.seller,
      ver: item.ver,
      assetBuy: item.assetBuy,
      assetSell: item.assetSell,
      price: item.price,
      multiplier: item.multiplier,
      lsig: item.lsig,
      env: item.env,
    },
  });
};

export default insertEscrow;
