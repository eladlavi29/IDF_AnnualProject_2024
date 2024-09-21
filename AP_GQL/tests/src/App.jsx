import { useState } from 'react'
import './App.css'
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
loadDevMessages();
loadErrorMessages();

function runTest(query, name, test, tests, setTests) {
  client.query({query: query}).then((r) => {
    const d = {...tests}
    d[name] = test(r) ? 'PASSED' : `FAILED: ${JSON.stringify(r)}`
    if (!(JSON.stringify(d) === JSON.stringify(tests))) {
      setTests(d)
    }
  });
}


const client = new ApolloClient({
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache(),
});

function App() {
  const [title, setTitle] = useState('Running Tests...')
  const [tests, setTests] = useState({})

  runTest(gql`
  query {
    flight(fid: 1) {
      fid
    }
  }`
  ,"1", (r) => r['data']['flight']['fid'] === "1", tests, setTests)

  runTest(gql`
    query {
      flight(fid: 1) {
        row(packet: 500) {
          fid
          packet
          params(names: ["fid", "packet"]) {
            name
            value
          }
        }
      }
    }
  `, "2", (r) => r['data']['flight']['row']['packet'] === 500 && r['data']['flight']['row']['params'][0]['value'] === 1 && r['data']['flight']['row']['params'][1]['value'] === 500, tests, setTests)

runTest(gql`
query {
  flight(fid: 2) {
    row(packet: 2597) {
      fid
      packet
      params(names: ["fid", "packet"]) {
        name
        value
      }
    }
  }
}
`, "3", (r) => r['data']['flight']['row']['packet'] === 2597 && r['data']['flight']['row']['params'][0]['value'] === 2 && r['data']['flight']['row']['params'][1]['value'] === 2597, tests, setTests)
  
runTest(gql`
  query {
    flight(fid: 5) {
      fid
    }
  }`
  ,"4", (r) => r['data']['flight']['fid'] === "5", tests, setTests)

  runTest(gql`
query {
  flight(fid: 4) {
    row(packet: 12689) {
      fid
      packet
      params(names: ["fid", "packet"]) {
        name
        value
      }
    }
  }
}
`, "5", (r) => r['data']['flight']['row']['packet'] === 12689 && r['data']['flight']['row']['params'][0]['value'] === 4 && r['data']['flight']['row']['params'][1]['value'] === 12689, tests, setTests)
  
  return (
    <pre>{JSON.stringify(tests, null, 2)}</pre>
  )
}

export default App
