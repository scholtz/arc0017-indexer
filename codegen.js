module.exports = {
  schema: [
    {
      'https://graphql.k8s.diatomix.xyz/v1/graphql': {
        headers: {
          //                    'x-hasura-admin-secret': process.env.AUTH_TOKEN,
        },
      },
    },
  ],
  //documents: ['./src/**/*.tsx', './src/**/*.ts'],
  overwrite: true,
  generates: {
    './src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        skipTypename: false,
        withHooks: true,
        withHOC: false,
        withComponent: false,
      },
    },
    './graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
};
