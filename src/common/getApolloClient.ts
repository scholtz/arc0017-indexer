import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import fetch from 'cross-fetch';
import createAuthenticationHeader from './createAuthenticationHeader';
import getSecureConfiguration from './getSecureConfiguration';

let client: ApolloClient<any> = null;
const getApolloClient = () => {
  if (client != null) return client;
  const config = getSecureConfiguration();
  const headers = config.mn
    ? {
        Authorization: createAuthenticationHeader(),
      }
    : {};
  client = new ApolloClient({
    link: new HttpLink({
      uri: config.graphQLServer,
      fetch,
      headers,
    }),
    cache: new InMemoryCache(),
  });
  return client;
};

export default getApolloClient;
