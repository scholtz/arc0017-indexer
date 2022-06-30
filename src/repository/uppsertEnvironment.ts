import { gql } from '@apollo/client/core';
import getApolloClient from '../common/getApolloClient';
import { Environment_Min_Fields, Escrow, Escrow_Min_Fields, Offer_Min_Fields } from '../generated/graphql';
import { InsertTransaction } from './insertTransaction';

const query = gql`
  mutation upsert_environment($name: String!, $hash: String!) {
    insert_environment(objects: [{ name: $name, hash: $hash }], on_conflict: { constraint: environment_name_hash_key, update_columns: [name, hash] }) {
      affected_rows
      returning {
        id
        name
        hash
        created_at
        updated_at
      }
    }
  }
`;
const upsertEnvironment = async (item: Environment_Min_Fields) => {
  const client = getApolloClient();
  const toUpdate = {
    name: item.name,
    hash: item.hash,
  };
  console.log('upserting env', item, toUpdate);
  return await client.mutate({
    mutation: query,
    variables: toUpdate,
  });
};

export default upsertEnvironment;
