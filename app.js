let processVideos = require('./processvideos');
let output = require('./output');

let data = inputData('asdf.txt');

let outputData = processVideos(data);

output(outputData);

function inputData(fileName){
    return {};
}