import './App.css';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-boost';
import InfoScreen from './InfoScreen';

const client = new ApolloClient({
  uri: "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql"
})

const App = () => (
  <ApolloProvider client = {client}>
    <div>
        <InfoScreen></InfoScreen>
    </div>
  </ApolloProvider>
);

export default App;
