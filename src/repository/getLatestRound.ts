import { gql } from '@apollo/client/core';
import getApolloClient from '../common/getApolloClient';

const query = gql`
  query indexer_by_pk($id: Int!) {
    indexer_by_pk(id: $id) {
      round
    }
  }
`;
const getLatestRound = async (id: number) => {
  const client = getApolloClient();
  const res = await client.query({
    query: query,
    variables: {
      id: id,
    },
  });
  return res.data.indexer_by_pk.round;
};

export default getLatestRound;
