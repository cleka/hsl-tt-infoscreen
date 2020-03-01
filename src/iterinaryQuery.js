import gql from 'graphql-tag';

// fromPlace: "Pohjoinen Rautatienkatu 25, Helsinki::60.1693803,24.9236575",
// toPlace: "Laurinniityntie 20, Helsinki::60.2318774,24.8733656",

// date: "2020-02-29",
// time: "14:10:00",


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
export default iterinaryQuery;
