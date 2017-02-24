const {readFileSync, writeFileSync} = require('fs');

function inputData(fileName){
    let cacheServers = [];
    let endPoints = [];
    let videos = [];

    var getCacheServer = (id, size) => {
        var result = cacheServers.filter( (cacheServer) => cacheServer.id === id );
        if(result.length == 0) {
            var newCacheServer = {id, size: size, remainingSize: size, videoList: []};
            cacheServers.push(newCacheServer);
            return newCacheServer;
        } else {
            return result[0]
        }
    };


    let rawData = readFileSync(fileName, 'utf8').split('\n');
    let numberOfConnectedCacheServers, latencyToDataCenter, processedEndpoints, numberOfVideos, numberOfEndpoints,
        numberOfRequestDescriptions, numberOfCacheServers, cacheServerSize, newEndPoint, actualEndPointId = 0,
        numberOfProcessedRequestDescription = 0;

    let testIndex
    rawData.forEach( (line, index) => {
        if(line == '') return;
        if(index === 0) {
            let lineData = line.split(' ').map(Number);
            if(!lineData || lineData.length !== 5) { throw Error(`Error parsing first line, ${index+1}, ${line}`) };
            [numberOfVideos, numberOfEndpoints, numberOfRequestDescriptions, numberOfCacheServers, cacheServerSize] = lineData;
            processedEndpoints = 0;
        } else if(index === 1 ) {
            videos = line.split(' ').map((size, id) => {
                return {id, size: Number(size)};
            });
            if(videos.length !== numberOfVideos) { throw Error(`Wrong no of videos ${videos.length} !== ${numberOfVideos}`) };
        } else if(index > 1 && processedEndpoints < numberOfEndpoints) {
            if (numberOfConnectedCacheServers === undefined || numberOfConnectedCacheServers === 0) {
                let lineData = line.split(' ').map(Number);
                if(!lineData || lineData.length !== 2) { throw Error(`Error in processing endpoint data @ ${index+1}, ${line}`); }
                [latencyToDataCenter, numberOfConnectedCacheServers] = lineData;
                newEndPoint = {
                    id: actualEndPointId,
                    latencyToDataCenter: Number(latencyToDataCenter),
                    videos: [],
                    accessibleCacheServers: []
                };
                if(numberOfConnectedCacheServers === 0) { processedEndpoints++; actualEndPointId++}
            } else {
                let lineData = line.split(' ').map(Number);
                if(!lineData || lineData.length !== 2 || lineData[0] >= numberOfCacheServers) {
                    throw Error(`Error in processing endpoint cache data @ ${index + 1}, ${line}`);
                }
                var [cacheServerId, latencyToCacheServer] = lineData;
                var cacheServer = getCacheServer(cacheServerId, cacheServerSize);
                newEndPoint.accessibleCacheServers.push({
                    cacheServerReference: cacheServer,
                    latencyToCacheServer: latencyToCacheServer
                });
                numberOfConnectedCacheServers--;
                if (numberOfConnectedCacheServers === 0) {
                    processedEndpoints++;
                    endPoints.push(newEndPoint);
                    actualEndPointId++;
                }
            }
        } else {
            let lineData = line.split(' ').map(Number);
            if(!lineData || lineData.length !== 3 || lineData[0] >= numberOfVideos || lineData[1] >= numberOfEndpoints) {
                throw Error(`Error during request processing @ ${index+1}, ${line}`);
            }
            let [videoId, endpointId, requestNumber] = lineData;
            let video = videos.filter( (video)=> video.id == videoId )[0];
            let endPoint = endPoints.filter( (endpoint) => endpoint.id == endpointId)[0];
            if(!endPoint) {
                throw Error('sdkfjsdkl');
            }
            endPoint.videos.push({videoReference: video, numberOfRequests: requestNumber});
        }
    });
    if(cacheServers.length !== numberOfCacheServers || endPoints.length !== numberOfEndpoints) {
        throw Error(`Final checksum not successful. cache servers: ${cacheServers.length}, endpoints: ${endPoints.length}, videos: ${videos.length}`);
    }
    return {cacheServers, endPoints, videos};
}

const saveDataToJson = (data, fileName) => {
    writeFileSync(fileName, JSON.stringify(data), 'utf8');
};

module.exports = {inputData, saveDataToJson};