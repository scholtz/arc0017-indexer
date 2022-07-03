import { gql } from '@apollo/client/core';
import { encodeAddress } from 'algosdk';
import moment from 'moment';
import getApolloClient from '../common/getApolloClient';
import { Escrow, Escrow_Min_Fields, Offer_Min_Fields } from '../generated/graphql';
import { InsertTransaction } from './insertTransaction';

const query = gql`
  mutation upsert_trade(
    $id: String!
    $tx2Id: String!
    $seller: String!
    $buyer: String!
    $sellQuantity: bigint!
    $buyQuantity: bigint!
    $assetBuy: bigint!
    $assetSell: bigint!
    $sellPriceBase: bigint!
    $sellPriceMultiplier: bigint!
    $env: Int!
    $price: numeric!
    $amount: numeric!
    $priceInverted: numeric!
    $amountInverted: numeric!
    $time: timestamptz!
  ) {
    insert_trade(
      objects: [
        {
          id: $id
          tx2Id: $tx2Id
          seller: $seller
          buyer: $buyer
          sellQuantity: $sellQuantity
          buyQuantity: $buyQuantity
          assetBuy: $assetBuy
          assetSell: $assetSell
          sellPriceBase: $sellPriceBase
          sellPriceMultiplier: $sellPriceMultiplier
          env: $env
          price: $price
          amount: $amount
          priceInverted: $priceInverted
          amountInverted: $amountInverted
          time: $time
        }
      ]
      on_conflict: {
        constraint: trade_pkey
        update_columns: [tx2Id, seller, buyer, sellQuantity, buyQuantity, assetBuy, assetSell, sellPriceBase, sellPriceMultiplier, env, price, amount, priceInverted, amountInverted, time]
      }
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
const upsertTrade = async (item: InsertTransaction, ts: number, tx2Id: string, paymentStxn: any, escrow: Escrow_Min_Fields): Promise<any> => {
  const client = getApolloClient();
  console.log('upserting trade init', item, escrow);
  const toUpdate = {
    id: item.txId,
    tx2Id: tx2Id,
    seller: escrow.seller,
    buyer: encodeAddress(new Uint8Array(paymentStxn.txn.snd)),
    sellQuantity: item.amount,
    buyQuantity: paymentStxn.txn.aamt ? paymentStxn.txn.aamt : 0,
    assetSell: item.asset,
    assetBuy: paymentStxn.txn.xaid,
    sellPriceBase: escrow.price,
    sellPriceMultiplier: escrow.multiplier,
    env: escrow.env,
    price: escrow.price / escrow.multiplier,
    amount: item.amount,
    priceInverted: escrow.multiplier / escrow.price,
    amountInverted: 1 / item.amount,
    time: moment(ts * 1000).toISOString(),
  };
  console.log('upserting trade', item, escrow, toUpdate);
  if (toUpdate.buyer == toUpdate.seller) return null; // no trade - buyer is equal to seller
  if (toUpdate.buyer == escrow.address) return null; // no trade - 2nd tx was signed by escrow
  return await client.mutate({
    mutation: query,
    variables: toUpdate,
  }); /**/
};

export default upsertTrade;
