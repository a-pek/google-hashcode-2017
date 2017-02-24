'use strict';
const {inputData} = require('./input');
let processVideos = require('./processvideos');
let output = require('./output');
let data;

const testFolder = './input-data-set/';
const fs = require('fs');
fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    console.log('parsing input...', file);
    data = inputData('./input-data-set/' + file);
    console.log('processing....', file);
    let outputData = processVideos(data);
    console.log('output...', file);
    output(outputData, 'output/' + file + '.output.txt');
  });
});


