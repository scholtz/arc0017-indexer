import { gql } from '@apollo/client/core';
import getApolloClient from '../common/getApolloClient';

const query = gql`
  mutation update_indexer_by_pk($id: Int!, $round: bigint!) {
    update_indexer_by_pk(pk_columns: { id: $id }, _set: { round: $round }) {
      round
    }
  }
`;
const setLatestRound = (id: number, round: number) => {
  const client = getApolloClient();
  client.mutate({
    mutation: query,
    variables: {
      id: id,
      round: round,
    },
  });
};

export default setLatestRound;
