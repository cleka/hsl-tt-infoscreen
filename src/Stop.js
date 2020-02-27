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

           return  data.stops.map(( { id, gtfsId, name, lat, lon, } ) => (
               <div key={id}>
                   <p>{`HSL stop with gtfs-ID '${gtfsId}' has name '${name}', latitude ${lat} and longitude ${lon} `}</p>
               </div>
           ));
       } } 

    </Query>
);

export default Stop;
