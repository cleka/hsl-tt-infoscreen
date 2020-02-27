import React from 'react';
import { Query }   from 'react-apollo';
import gql from 'graphql-tag';

const Stop = () => (
    <Query query={gql`
	{
	    stops (ids: "HSL:1294140")
	    {
		id
		name
		lat
		lon
		locationType
		gtfsId
		code
		
	    }
	}
    `}>
       {( {loading, error, data } ) => { 
           if(loading) return <p>Loading... </p>;
           if (error) return <p>Error :(</p>;

           return  data.stops.map(( { id, name, } ) => (
               <div key={id}>
                   <p>{`Id ${id} has name ${name}`}</p>
               </div>
           ));
       } } 

    </Query>
);

export default Stop;
