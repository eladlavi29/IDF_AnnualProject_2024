import { useQuery, gql } from '@apollo/client';
import {useState} from 'react';
import {Button, TextField} from '@mui/material';

const GET_PLANES = `
  query {
    planes {
      tail_number
    }
  }
`

function Comp() {
    const [query, setQuery] = useState(GET_PLANES);
    const [rquery, setRQuery] = useState(query);
    const { loading, error, data } = useQuery(gql(rquery));
    return (
    <>
    <TextField id="button" label="Outlined" multiline rows={10} value={query} onChange={(e) => setQuery(e.target.value)}/>
    <Button variant="contained" onClick={() => setRQuery(query)}>Run Query</Button>
    
    {loading && 'loading'}
    {error && 'error'}
    {!error && !loading &&
    <div>
        <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
    }
    </>
      );
}

export default Comp