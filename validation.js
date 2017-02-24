const {readFileSync} = require('fs');
const has = Object.prototype.hasOwnProperty;

var inputFile = './input-data-set/me_at_the_zoo.in';
var outputFile = './output/me_at_the_zoo.in.output.txt';

const processInput = (file) => {
    let nVideo, nEndpoint, nRequest, nCache, cacheSize;
    let videos = {}, endpoints = {}, requests = [];

    let processedEndpoints = 0, processedCachesOfEndpoint = 0, endpoint = {}, nCachesOfEndpoint = 0;

    readFileSync(file, 'utf8').split('\n').forEach( (line, index) => {

        if (index == 0) {
            [nVideo, nEndpoint, nRequest, nCache, cacheSize] = line.split(' ').map(Number);
        } else if (index === 1) {
            line.split(' ').map(Number).forEach((size, index) => { videos[index] = {size} });
        } else if (index > 1 && nEndpoint > processedEndpoints) {
            if(nCachesOfEndpoint <= processedCachesOfEndpoint) {
                [dataCenterLatency, nCachesOfEndpoint] = line.split(' ').map(Number);
                endpoint = {dataCenterLatency, cachesLatencies: {}};
                endpoints[processedEndpoints] = endpoint;
                processedEndpoints++;
                processedCachesOfEndpoint = 0;
            } else {
                let [cacheId, latencyToCache] = line.split(' ').map(Number);
                endpoint.cachesLatencies[cacheId] = {latencyToCache};
                processedCachesOfEndpoint++;
            }
        } else {
            let [videoId, endpointId, numberOfRequests] = line.split(' ').map(Number);
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
            console.log(`Sum of videos of the cache server no.${index}, ${sumVideoSize} MB`);
            numberOfCaches++;
        }
    }
    if(numberOfCaches !== output.numberOfCaches) {
        throw Error(`INVALID: The total amount of processed cache (${numberOfCaches}) server not the same as the given number (${output.numberOfCaches})`);
    }

};

const calulatePoints = (input, output) => {

};

var input = processInput(inputFile);
var output = processOutput(outputFile)

console.log(validate(input, output));