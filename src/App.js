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
    var date = new Date(time_ms_epoch);
    let timeleft = date - now;
    
    // millis to seconds
    return Math.round(timeleft/1000);
}

function starttime_hhmmss(time_ms_epoch)
{
    let d = new Date(time_ms_epoch);
    return time_to_hhmmss(d);
}

function currenttime_hhmmss()
{
    return time_to_hhmmss(new Date());
}

function time_to_hhmmss(d)
{
    let options = { 
	hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
    };

    // fi-FI gives dots, I want colons
    return new Intl.DateTimeFormat('de-DE', options).format(d);
}


class MainIterinary extends Component {

  constructor(props) {
      super();

  }

  render(){

    return (
      <div className="MainIterinary">
        <p>
	    This is the main iterinary.
	</p>
      </div>
    );
  } 
} 

function buildIterinary(it)
{
    let startTime = it.legs[0].startTime;
    let count = it.legs.length;
    let debuginfo = JSON.stringify(it, null, 4);
    return <div>Detailed iterinary ({count} legs)<p><pre>{debuginfo}</pre></p></div>;
}

const Iterinary = () => (
    <Query query={iterinaryQuery}>
       {( {loading, error, data } ) => { 
           if (loading) return <p>Loading... </p>;
           if (error)   return <p>An error occured fetching the data, try again later.</p>;

	   // ==================== Main Iterinary (on the left) ====================
	   // TODO: display all a bit bigger, using CSS ?
	   const it0 = data.plan.itineraries[0];
	   
	   const walkdist_raw = Math.round(it0.walkDistance-50);
	   const walkdist = rounded(walkdist_raw);
	   // for debugging
	   let walkdist_detailed = ' ('+walkdist_raw+'m)';
	   walkdist_detailed = '';

	   
	   let startTime = it0.legs[0].startTime;
	   let minsLeftUntilLeave = minutes(timeleft_secs(startTime));

	   let starttime_hr = starttime_hhmmss(startTime);
	   // let detailedIterinary = <p>Start time {starttime_hr}</p>;
	   let detailedIterinary = buildIterinary(it0);
	   
	   const duration = minutes(it0.duration);

	   // TODO: build it from reusable components instead?
	   let nextDepartureInfo = <div><h1>Next connection:</h1>
	       <p>Leave latest in: <font size='+8'>{minsLeftUntilLeave}</font></p>
	       <p>Total walk distance {walkdist}{walkdist_detailed}, total duration {duration}</p>
	       {detailedIterinary}
	       </div>;


	   // ==================== Build it all together ====================

	   // Build the whole page. As first hack, table to show main iterinary left, and summaries of upcoming
	   // following iterinaries on the right. Later perhaps use floating "div" elements with CSS?
	   let currentTime = currenttime_hhmmss();
	   const mainPageLayout = <div>
	       <p align='right'><h2>Generated: {currentTime}</h2></p>
	       <table border='yes' width='90%'><tr>
	       <td valign='top' width='50%'>
  	         {nextDepartureInfo}</td>
	       <td width='10%' valign='top'></td>
	       <td valign='top' width='40%'><p><h2>Upcoming connections:</h2></p></td></tr></table></div>;
           return mainPageLayout;

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
      </div>
    );
  } 
} 



//	fromPlace: "Pohjoinen Rautatienkatu 25, Helsinki::60.1693803,24.9236575",
//	toPlace: "Laurinniityntie 20, Helsinki::60.2318774,24.8733656",

//	date: "2020-02-29",
//	time: "14:10:00",

const iterinaryQuery = gql`
{
    plan(
	fromPlace: "Pohjoinen Rautatienkatu 25::60.1693803,24.9236575",
	toPlace: "Laurinniityntie 20::60.2318774,24.8733656",
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
