import './App.css';
import React,{ Component }  from 'react';
import { ApolloProvider, Query } from 'react-apollo';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';


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

function minutes(seconds)
{
    return Math.round(seconds / 60)+'min';
}

// For a value up to 500, round to closest 50, above that 100's, or 1.6 km if even more
function rounded(distance)
{
    let result = 0;
    if (distance > 1500)
    {
	result = Math.round(distance / 100)/10 + 'km';
    }
    else if (distance < 500)
    {
	result = Math.round(distance / 50)*50 + 'm';
    }
    else
    {
	result = Math.round(distance /100)*100 + 'm';

    }
    return result;
}

function timeleft_secs(time_ms_epoch)
{
    let now = new Date();
    let secs = Math.round(time_ms_epoch/1000);
    var date = new Date(time_ms_epoch);
    let timeleft = date - now;
    
    return timeleft;
}

function starttime_hhmmss(time_ms_epoch)
{
    let d = new Date(time_ms_epoch);
    let options = { 
	hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
    };

    // fi-FI gives dots, I want colons
    return new Intl.DateTimeFormat('de-DE', options).format(d);
}


const Iterinary = () => (
    <Query query={iterinaryQuery}>
       {( {loading, error, data } ) => { 
           if (loading) return <p>Loading... </p>;
           if (error)   return <p>An error occured fetching the data, try again later.</p>;

	   const it0 = data.plan.itineraries[0];

	   
	   const walkdist_raw = Math.round(it0.walkDistance-50);
	   const walkdist = rounded(walkdist_raw);
	   // for debugging
	   let walkdist_detailed = ' ('+walkdist_raw+'m)';
	   walkdist_detailed = '';

	   const duration = minutes(it0.duration);
	   
	   let startTime = it0.legs[0].startTime;
	   let minsLeftUntilLeave = minutes(timeleft_secs(startTime));

	   let starttime_hr = starttime_hhmmss(startTime);

           return  <div><p>Total walk distance is {walkdist}{walkdist_detailed}, total duration is {duration}</p><p>Start time {starttime_hr}, time left until leave {minsLeftUntilLeave} </p></div>
       } } 

    </Query>
);




class InfoScreen extends Component {

  constructor(props) {
      super(props);
      this.state = { minutesLeft: 30 };
  }


  render(){
    return (
      <div className="InfoScreen">
        <p>
	    <Iterinary></Iterinary>
	</p>
	    <p>
	    Route info
	</p>
	    <p>
	    Destination info
	</p>

      </div>
    );
  } 
} 




const iterinaryQuery = gql`
{
    plan(
	fromPlace: "Pohjoinen Rautatienkatu 25, Helsinki::60.1693803,24.9236575",
	toPlace: "Laurinniityntie 20, Helsinki::60.2318774,24.8733656",
	date: "2020-02-29",
	time: "13:10:00",
	numItineraries: 3,
	walkReluctance: 10.0,
	minTransferTime: 180,
	maxWalkDistance: 1200,
	walkSpeed: 1.5,

    ) {
	itineraries {
	    walkDistance
	    duration
	    legs {
		mode
		startTime
		endTime
		distance
		route {
		    id
		    gtfsId
		    shortName
		    desc
		    
		}
		from {
		    name
		    stop {
			code
			name
			gtfsId
		    }
		}
		to {
		    name
		    vertexType
		}
		trip {
		    gtfsId
		    tripHeadsign
		}
	    }
	}
    }
}
`
