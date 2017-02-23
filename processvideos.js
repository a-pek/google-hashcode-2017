let _ = require('underscore');

module.exports = function(inputData){

    let cacheServers = inputData.cacheServers;
    let endPoints = inputData.endPoints;

    let endPointsByPopularity = _.sortBy(endPoints, 'latencyToDataCenter').reverse();
    endPointsByPopularity.map(function(endPoint){
        endPoint.videosSortedByPopularityInNode = _.sortBy(endPoint.videos, 'predictedRequests').reverse();
        endPoint.accessibleCacheServersSortedByLatencyAsc = _.sortBy(endPoint.accessibleCacheServers, 'latencyToCacheServer');
    });

    let maxIterationCycles = 5;     // MAGIC 1: it would be nice to get this from the data.
    let firstRoundHowMany = 3;      // MAGIC 2: number of the first cycle's iteration 

    for(var i = 0; i<maxIterationCycles; i++){
        
        for(var endPointIndex = 0; endPointIndex < endPointsByPopularity.length; endPointIndex++){

            let endPoint = endPointsByPopularity[endPointIndex];
            let howManyVideosCanIHaz = howManyVideosCanThisEndpointHaz(i, endPointIndex, endPoint);
                        
            let videosRemoved = [];
            // Try busting the videos into the caches. Its not necessarily successful, so keep that in mind.
            for (var videoIndex = 0; videoIndex < howManyVideosCanIHaz; videoIndex ++){
                let video = endPoint.videosSortedByPopularityInNode[videoIndex].videoReference;
                if (placeToNearestCache(video, endPoint)){
                    videosRemoved.push(video.id);
                }                
            }
            // Filter out videos which we just removed, so we do not cache them again.
            endPoint.videosSortedByPopularityInNode = endPoint.videosSortedByPopularityInNode.filter(function(video){
                return videosRemoved.indexOf(video.id)==-1;
            })
        }
    }


    var magicNumberForEndPointLatencyDistribution = 0.5;
    
    function howManyVideosCanThisEndpointHaz(iteationCycle, endPointIndex, endPoint){
        // magic number to one scaling: magic to 1
        let howMany = Math.ceil(magicNumberForEndPointLatencyDistribution * endPoint.latencyToDataCenter);
        if (iteationCycle == 0){
            return howMany; 
        }
        else{
            return 1;
        }
    }

    function placeToNearestCache(video, endPoint){
        for(let cacheServerIndex = 0; cacheServerIndex < endPoint.accessibleCacheServersSortedByLatencyAsc.length; cacheServerIndex ++ ){
            
            let cacheServerWithLatencyToDataCenter = endPoint.accessibleCacheServersSortedByLatencyAsc[cacheServerIndex];                        
            let cacheServer = cacheServerWithLatencyToDataCenter.cacheServerReference;

            // Only put it there, if it worths it.
            if (worthCachingVideoToCacheServer(endPoint, cacheServerWithLatencyToDataCenter) &&
                cacheServer.remainingSize > video.size){
                    cacheServer.remainingSize -= video.size;
                    cacheServer.videoList.push(video);
                    return true;
                }
        }            
        return false;
    }

    
    function worthCachingVideoToCacheServer(endpoint, serverWithLatency){
         return endpoint.latencyToDataCenter > serverWithLatency.latencyToCacheServer
    }

    // remove not used servers.
    cacheServers = cacheServers.filter(function(server){
        return server.videoList.length;
    });

    return cacheServers;


}



//     cacheServers: [
//     {
//         id: 1,
//         size: 333, 
//         remainingSize: 333,
//         videoList: []
//     }    
//     ],
    
// endPoints: [
//     {
//         latencyToDataCenter: 123, // in millisec
//         videos: [
//                 {
//                     id: 333, // videoid
//                     size: 111, // in MB
                    
//                     },
//                     ...
                
//             ],
//         accessibleCacheServers: [
//             {
//                 id: 1435,  // cacheServerId (or index)
//                 size: 444 //in MB
//                 },
//                 ...
//             ]    
//         }
//     ]

