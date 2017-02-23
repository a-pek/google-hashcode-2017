let _ = require('underscore');

module.exports = function(inputData){

    let cacheServers = inputData.cacheServers;
    let endPoints = inputData.endPoints;

    let endPointsByPopularity = _.sortBy(endPoints, 'latencyToDataCenter').reverse();
    endPointsByPopularity.map(function(endPoint){
        endPoint.videosSortedByPopularityInNode = _.sortBy(endPoint.videos, 'predictedRequests').reverse();
    });

    let maxIterationCycles = 5;     // MAGIC 1: it would be nice to get this from the data.
    let firstRoundHowMany = 5;      // MAGIC 2: number of the first cycle's iteration 

    for(var i = 0; i<maxIterationCycles; i++){
        
        for(var endPointIndex = 0; endPointIndex < endPointsByPopularity.length; endPointIndex++){

            let endPoint = endPointsByPopularity[endPointIndex];
            let howManyVideosCanIHaz = howManyVideosCanThisEndpointHaz(i, endPointIndex, endPoint);
            
            let videosRemoved = []
            for (var videoIndex = 0; videoIndex < howManyVideosCanIHaz; videoIndex){
                let video = endPoint.videosSortedByPopularityInNode[videoIndex];
                if (placeToNearestCache(video, endPoint.videosSortedByPopularityInNode)){
                    videosRemoved.push(video)
                }

            }
        }

    }


    // let magicNumberForEndPointLatencyDistribution = endPointsByPopularity[0] + endPointsByPopularity[endPointsByPopularity.length-1]/2;
        
    function howManyVideosCanThisEndpointHaz(iteationCycle, endPointIndex, endPoint){
        
        if (iteration == 0){
            return firstRoundHowMany; 
        }
        else{
            return 1;
        }
    }

    function placeToNearestCache(video, endPoint){
        for(let cacheServerIndex = 0; cacheServerIndex < endPoint.accessibleCacheServers.length; ){
            if (endPoint.accessibleCacheServers[cacheServerIndex].remainingSize > video.size){
                videoList.push(video);
                return true;
            }
        }
            
        return false;
    }

    cacheServers: [
    {
        id: 1,
        size: 333, 
        remainingSize: 333,
        videoList: []
    }    
    ],
    
endPoints: [
    {
        latencyToDataCenter: 123, // in millisec
        videos: [
                {
                    id: 333, // videoid
                    size: 111, // in MB
                    
                    },
                    ...
                
            ],
        accessibleCacheServers: [
            {
                id: 1435,  // cacheServerId (or index)
                size: 444 //in MB
                },
                ...
            ]    
        }
    ]

    return { pina: 'hahh!'}
}
