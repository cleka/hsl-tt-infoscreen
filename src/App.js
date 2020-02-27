import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import Stop from './Stop'; 
import './App.css';

const client = new ApolloClient({
  // uri: "https://vm8mjvrnv3.lp.gpl.zone/graphql"
  uri: "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql"

})


const App = () => (
  <ApolloProvider client = {client}>
    <div>
       <Stop></Stop>
    </div>
  </ApolloProvider>
);

export default App;
