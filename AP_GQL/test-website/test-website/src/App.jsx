import { useState } from 'react'
import io from "socket.io-client";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import Comp from './GQL_comp'


const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache()
});


function App() {
  const [count, setCount] = useState(0)
  return (
    <ApolloProvider client={client}>
      <Comp/>
    </ApolloProvider>
  )
}

export default App
