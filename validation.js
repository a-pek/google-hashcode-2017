const {readFileSync} = require('fs');
const has = Object.prototype.hasOwnProperty;

const processInput = (file) => {
    let nVideo, nEndpoint, nRequest, nCache, cacheSize;
    let videos = {}, endpoints = {}, requests = [];

    let processedEndpoints = 0, processedCachesOfEndpoint = 0, endpoint = {}, nCachesOfEndpoint = 0;

    readFileSync(file, 'utf8').split('\n').forEach( (line, index) => {

        if (index == 0) {
            let lineData = line.split(' ').map(Number);
            if(!lineData || lineData.length !== 5) {
                throw Error(`Error during processing the first input line! @ line no ${index}`);
            }
            [nVideo, nEndpoint, nRequest, nCache, cacheSize] = lineData
        } else if (index === 1) {
            let lineData = line.split(' ').map(Number);
            if(!lineData || lineData.length !== nVideo) {
                throw Error(`Wrong number of videos: ${lineData.length} instead of ${nVideo}`);
            }
            lineData.forEach((size, index) => { videos[index] = {size} });
        } else if (index > 1 && nEndpoint > processedEndpoints) {
            if(nCachesOfEndpoint === 0 || nCachesOfEndpoint <= processedCachesOfEndpoint) {
                let lineData = line.split(' ').map(Number);
                if(!lineData || lineData.length !== 2) {
                    throw Error(`error processing endpoint @ line no ${index}, ${line}`);
                }
                [dataCenterLatency, nCachesOfEndpoint] = lineData;
                endpoint = {dataCenterLatency, cachesLatencies: {}};
                endpoints[processedEndpoints] = endpoint;
                processedCachesOfEndpoint = 0;
                if(nCachesOfEndpoint === 0) { processedEndpoints++; }
            } else {
                let lineData = line.split(' ').map(Number);
                if(!lineData || lineData.length !== 2 || lineData[0] >= nCache) {
                    throw Error(`error processing endpoint's cache @ line no ${index}, ${line}`);
                }
                let [cacheId, latencyToCache] = lineData;
                endpoint.cachesLatencies[cacheId] = {latencyToCache};
                if(processedCachesOfEndpoint > nCachesOfEndpoint) {
                    throw Error(`wrong number of caches/endpoint @ line no ${index}, ${line}`);
                }
                processedCachesOfEndpoint++;
                if(processedCachesOfEndpoint == nCachesOfEndpoint) {
                    processedEndpoints++;
                }

            }
        } else if(line.length > 0) {
            let lineData = line.split(' ').map(Number);
            if(!lineData || lineData.length !== 3 || lineData[0] >= nVideo || lineData[1] >= nEndpoint) {
                throw Error(`Error processing a request line, line no ${index}, line ${line}`);
            }
            [videoId, endpointId, numberOfRequests]= lineData
            requests.push({videoId, endpointId, numberOfRequests});
        }
    });
    return {cacheSize, videos, endpoints, requests}

};

const processOutput = (file) => {
    var numberOfCaches;
    var caches = {};

    readFileSync(file, 'utf8').split('\n').forEach( (line, index) => {
        if(index === 0) {
            numberOfCaches = Number(line);
        } else if(index > 0) {
            let data = line.split(' ').map(Number);
            let serverIndex = data.shift();
            caches[serverIndex] = {videos: []};
            caches[serverIndex].videos = data;
        }
    });
    return {numberOfCaches, caches};
};

const validate = (input, output) => {
    var numberOfCaches = 0;

    for(let index in output.caches) {
        if(has.call(output.caches, index)) {
            let sumVideoSize = output.caches[index].videos.reduce( (sum, videoId) => {
                return sum + input.videos[videoId].size;
            }, 0);
            if(input.cacheSize < sumVideoSize ) {
                throw Error(`INVALID: Videos size exceeds on cache size at cache server ${index}, video size: ${sumVideoSize}, allowed: ${input.cacheSize}`);
            }
            //console.log(`Sum of videos of the cache server no.${index}, ${sumVideoSize} MB`);
            numberOfCaches++;
        }
    }
    if(numberOfCaches !== output.numberOfCaches) {
        throw Error(`INVALID: The total amount of processed cache (${numberOfCaches}) server not the same as the given number (${output.numberOfCaches})`);
    }
    return true;
};

const calculateScore = (input, output) => {
    var savedTime = 0, availableCaches, minimumLatency, dataCenterLatency, allRequests = 0;

    input.requests.forEach( (request) =>{
        dataCenterLatency = input.endpoints[request.endpointId].dataCenterLatency;
        minimumLatency = dataCenterLatency;
        availableCaches = input.endpoints[request.endpointId].cachesLatencies;
        for(let cacheId in availableCaches) {
            if(has.call(availableCaches, cacheId) && has.call(output.caches, cacheId)) {
                if(output.caches[cacheId].videos.indexOf(request.videoId) !== -1
                    && availableCaches[cacheId].latencyToCache < minimumLatency
                ) {
                    minimumLatency = availableCaches[cacheId].latencyToCache;
                }
                allRequests += request.numberOfRequests;
            }
        }

        savedTime += (dataCenterLatency - minimumLatency) * request.numberOfRequests;
    });
    return Math.round(savedTime * 1000 / allRequests);
};


const submission = (inputFile, outputFile) => {
    var input = processInput(inputFile);
    var output = processOutput(outputFile);

    return {isValid: validate(input, output), score: calculateScore(input, output)};
};

module.exports = {submission};
