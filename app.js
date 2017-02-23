'use strict';
let {readFileSync} = require('fs');
let _ = require('underscore');

let processVideos = require('./processvideos');
let output = require('./output');

const testFolder = './input-data-set/';
const fs = require('fs');
fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    console.log(file);
    let data = inputData('./input-data-set/' + file);

    let outputData = processVideos(data);

    output(outputData, 'output/' + file + '.output.txt');

  });
})

//let data = inputData(process.argv[2]);
let data = inputData('./input-data-set/me_at_the_zoo.in');

let outputData = processVideos(data);

output(outputData);

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
    rawData.forEach( (line, index) => {
        var numberOfConnectedCacheServers, latencyToDataCenter, lineData, processedEndpoints = 0;

        if(index === 0) {
            var [numberOfVideos, numberOfEndpoints, numberOfRequestDescriptions, numberOfCacheServers, cacheServerSize] = line.split(' ').map(Number);
        } else if(index === 1 ) {
            videos = line.split(' ').map((size, id) => {
                return {id, size: Number(size)};
            });
        } else if(index > 1 && processedEndpoints < numberOfEndpoints) {
            if (numberOfConnectedCacheServers === undefined || numberOfConnectedCacheServers === 0) {
                lineData = line.split(' ').map(Number);
                latencyToDataCenter = lineData[0]
                numberOfConnectedCacheServers = lineData[1];
                var newEndPoint = {
                    id: index,
                    latencyToDataCenter: Number(latencyToDataCenter),
                    videos: [],
                    accessibleCacheServers: []
                }
            } else {
                var [cacheServerId, latencyToCacheServer] = line.split(' ').map(Number);
                var cacheServer = getCacheServer(cacheServerId, cacheServerSize);
                newEndPoint.accessibleCacheServers.push({
                    cacheServerReference: cacheServer,
                    latencyToCacheServer: latencyToCacheServer
                });
                numberOfConnectedCacheServers--;
                if (numberOfConnectedCacheServers === 0) {
                    processedEndpoints++;
                }
            }
        } else if(index > 1 + numberOfEndpoints) {
            let [videoId, endpointId, requestNumber] = line.split(' ').map(Number);
            let video = videos.filter( (video)=> video.id == videoId )[0];
            let endPoint = endPoints.filter( (endpoint) => endpoint.id == endpointId);
            endPoint.videos.push({videoReference: video, numberOfRequests: requestNumber});
        }


    });
    // console.log({cacheServers, endPoints, videos});
    return {cacheServers, endPoints, videos};

}