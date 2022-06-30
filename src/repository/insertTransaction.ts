import { gql } from '@apollo/client/core';
import getApolloClient from '../common/getApolloClient';
import { Escrow, Escrow_Min_Fields, Transaction_Min_Fields } from '../generated/graphql';

const queryPayToEscrow = gql`
  mutation insert_transaction($txId: String!, $account: String!, $type: Int!, $asset: bigint!, $round: bigint!, $intraround: Int!, $amount: bigint!, $env: Int!) {
    insert_transaction(
      objects: [{ txId: $txId, type: $type, account: $account, asset: $asset, round: $round, intraround: $intraround, amount: $amount, env: $env }]
      on_conflict: { constraint: transaction_txId_type_env_key, update_columns: [account, asset, round, intraround, amount, env] }
    ) {
      affected_rows
      returning {
        id
        balance
        created_at
        updated_at
      }
    }
  }
`;

const queryFromEscrowWithoutFee = gql`
  mutation insert_transaction($txId: String!, $account: String!, $type: Int!, $asset: bigint!, $round: bigint!, $intraround: Int!, $negAmount: bigint!, $env: Int!) {
    insert_transaction(
      objects: [{ txId: $txId, type: $type, account: $account, asset: $asset, round: $round, intraround: $intraround, amount: $negAmount, env: $env }]
      on_conflict: { constraint: transaction_txId_type_env_key, update_columns: [account, asset, round, intraround, amount, env] }
    ) {
      affected_rows
      returning {
        id
        balance
        created_at
        updated_at
      }
    }
  }
`;
const queryFromEscrowWithFee = gql`
  mutation insert_transaction($txId: String!, $account: String!, $type: Int!, $asset: bigint!, $round: bigint!, $intraround: Int!, $negAmount: bigint!, $negFee: bigint!, $env: Int!) {
    insert_transaction(
      objects: [
        { txId: $txId, type: $type, account: $account, asset: $asset, round: $round, intraround: $intraround, amount: $negAmount, env: $env }
        { txId: $txId, type: 5, account: $account, asset: 0, round: $round, intraround: $intraround, amount: $negFee, env: $env }
      ]
      on_conflict: { constraint: transaction_txId_type_env_key, update_columns: [account, asset, round, intraround, amount, env] }
    ) {
      affected_rows
      returning {
        id
        balance
        created_at
        updated_at
      }
    }
  }
`;

export interface InsertTransaction {
  txId: String;
  account: String;
  asset: number;
  round: number;
  intraround: number;
  amount: number;
  type: number;
  fee: number;
  env: number;
}
const insertTransaction = async (tx: InsertTransaction) => {
  const client = getApolloClient();
  console.log('inserting transaction', tx);
  if (tx.fee > 0) {
    if (tx.type == 2 || tx.type == 4) {
      // from escrow
      console.log('sending queryFromEscrowWithFee', {
        txId: tx.txId,
        account: tx.account,
        type: tx.type,
        asset: tx.asset,
        round: tx.round,
        intraround: tx.intraround,
        amount: tx.amount,
        negAmount: -1 * tx.amount,
        fee: tx.fee,
        negFee: -1 * tx.fee,
        env: tx.env,
      });
      return await client.mutate({
        mutation: queryFromEscrowWithFee,
        variables: {
          txId: tx.txId,
          account: tx.account,
          type: tx.type,
          asset: tx.asset,
          round: tx.round,
          intraround: tx.intraround,
          amount: tx.amount,
          negAmount: -1 * tx.amount,
          fee: tx.fee,
          negFee: -1 * tx.fee,
          env: tx.env,
        },
      });
    } else {
      throw Error(`Type ${tx.type} not implemented`);
    }
  } else {
    if (tx.type == 1 || tx.type == 3) {
      // to escrow
      console.log('sending queryPayToEscrow', {
        txId: tx.txId,
        account: tx.account,
        type: tx.type,
        asset: tx.asset,
        round: tx.round,
        intraround: tx.intraround,
        amount: tx.amount,
        negAmount: -1 * tx.amount,
        env: tx.env,
      });
      return await client.mutate({
        mutation: queryPayToEscrow,
        variables: {
          txId: tx.txId,
          account: tx.account,
          type: tx.type,
          asset: tx.asset,
          round: tx.round,
          intraround: tx.intraround,
          amount: tx.amount,
          negAmount: -1 * tx.amount,
          env: tx.env,
        },
      });
    } else if (tx.type == 2 || tx.type == 4) {
      // from escrow
      console.log('sending queryFromEscrowWithoutFee', {
        txId: tx.txId,
        account: tx.account,
        type: tx.type,
        asset: tx.asset,
        round: tx.round,
        intraround: tx.intraround,
        amount: tx.amount,
        negAmount: -1 * tx.amount,
        env: tx.env,
      });
      return await client.mutate({
        mutation: queryFromEscrowWithoutFee,
        variables: {
          txId: tx.txId,
          account: tx.account,
          type: tx.type,
          asset: tx.asset,
          round: tx.round,
          intraround: tx.intraround,
          amount: tx.amount,
          negAmount: -1 * tx.amount,
          env: tx.env,
        },
      });
    } else {
      throw Error(`Type ${tx.type} not implemented`);
    }
  }
};

export default insertTransaction;
