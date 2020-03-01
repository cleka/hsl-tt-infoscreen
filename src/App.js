import './App.css';
import React,{ Component }  from 'react';
import { ApolloProvider, Query } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';
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
    return Math.round(seconds / 60)+' min';
}

// For a value up to 500, round to closest 50, above that 100's, or 1.6 km if even more
function rounded(distance)
{
    let result = 0;
    if (distance > 1500)
    {
	result = Math.round(distance / 100)/10 + ' km';
    }
    else if (distance < 500)
    {
	result = Math.round(distance / 50)*50 + ' m';
    }
    else
    {
	result = Math.round(distance /100)*100 + ' m';

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

function giventime_hhmmss(time_ms_epoch)
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

function calcDuration(start, end)
{
    let seconds = (end-start)/1000;
    if (seconds < 60)
    {
	return seconds + ' sec';
    }
    else
    {
	return Math.round(seconds/60) + ' min';
    }

}


/*
  One iterinary looks like this:
  Place0
  Transport1
  Place1
  Transport2
  Place2
  ...
  Transport3
  Place3 (destination)
  
  I will try to display that in a table of variable length, Transport-Place pairs
  and a special row for the final destination.
  (first start and then pairs, I think I would have a problem because I need the bus stop number
   when displaying the place)

  So, an iterinary with 3 legs (walk, bus, walk) will result in 7 rows.
*/

function buildIterinary(it)
{
    let rows = [ ];
    for (var i=0; i < it.legs.length; i++) {
	let leg=it.legs[i];
	let startTime = giventime_hhmmss(leg.startTime);
	let fromPlace = leg.from.name;
	if (leg.mode === 'BUS')
	{
	    fromPlace += ' [' + leg.from.stop.code + ']';
	}
	let place = <tr><td><b>{startTime}</b></td><td></td><td><b>{fromPlace}</b></td></tr>;


	var mode;
	if (leg.mode === 'WALK')
	{
	    mode = 'Walk ' + rounded(leg.distance);
	}
	else if (leg.mode === 'BUS' || leg.mode === 'TRAIN')
	{
	    let vehicle = leg.mode === 'BUS' ? 'Bus' : 'Train';
	    let stopcount = leg.intermediateStops.length;
	    mode = vehicle + ' ' + leg.route.shortName + ' ' + leg.trip.tripHeadsign + ' (' + stopcount + ' stops)';
	}
	else
	{
	    // just in case. Tram?
	    mode = leg.mode + leg.route.shortName;
	}
	let duration = calcDuration(leg.startTime, leg.endTime)
	let transport = <tr><td align='center'>{duration}</td><td></td><td>{mode}</td></tr>;
	rows.push(place, transport);
    }

    // Contruct the entry for destination:
    let lastLeg = it.legs[it.legs.length-1];
    let arrivalTime = giventime_hhmmss(lastLeg.endTime);
    let destination = lastLeg.to.name;
    let destinationRow = <tr><td><b>{arrivalTime}</b></td><td></td><td><b>{destination}</b></td></tr>;
    rows.push(destinationRow);

    return <div>
	<table border='0' cellspacing='20'>{rows}</table>
	</div>;
}

function Iterinary () {
    const { loading, error, data } = useQuery(iterinaryQuery);
    
    if (loading) return <p>Refreshing the schedules... </p>;
    if (error)   return <p>An error occured fetching the data, try again later.</p>;

    // ==================== Main Iterinary (on the left) ====================
    // TODO: display all a bit bigger, using CSS ?
    const it0 = data.plan.itineraries[0];
    
    const walkdist_raw = Math.round(it0.walkDistance);
    const walkdist = rounded(walkdist_raw);
    // for debugging
    let walkdist_detailed = ' ('+walkdist_raw+'m)';
    walkdist_detailed = '';

    let startTime = it0.legs[0].startTime;
    let minsLeftUntilLeave = minutes(timeleft_secs(startTime));

    let detailedIterinary = buildIterinary(it0);
    
    const duration = minutes(it0.duration);

    // TODO: build it from reusable components instead?
    let nextDepartureInfo = <div><h1>Next connection:</h1>
	<p>Leave latest in: <font size='+8'>{minsLeftUntilLeave}</font></p>
	{detailedIterinary}
	<p>Total walk distance {walkdist}{walkdist_detailed}, total duration {duration}</p>
	</div>;


    // ==================== Build it all together ====================

    let debugInfo = <pre>{JSON.stringify(it0, null, 4)}</pre>;
    debugInfo = '';

    // Build the whole page. As first hack, table to show main iterinary left, and summaries of upcoming
    // following iterinaries on the right. Later perhaps use floating "div" elements with CSS?
    let currentTime = currenttime_hhmmss();
    const mainPageLayout = <div>
	<p align='right'><h2>Generated: {currentTime}</h2></p>
	<table  width='90%'><tr>
	<td valign='top' width='50%'>
  	{nextDepartureInfo}</td>
	<td width='10%' valign='top'></td>
	<td valign='top' width='40%'><p><h2>Upcoming connections:</h2></p></td></tr></table>
	{debugInfo}
    </div>;
    return mainPageLayout;

};




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
	walkSpeed: 1.33,

    ) {
	itineraries {
	    walkDistance
	    duration
	    legs {
		mode
		startTime
		endTime
		distance
		intermediateStops {
		    id
		}
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
