'use strict';
const {inputData, saveDataToJson} = require('./input');
let processVideos = require('./processvideos');
let output = require('./output');
let data;

const testFolder = './input-data-set/';
const jsonFolder = './json';

const fs = require('fs');
fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    console.log('parsing input...', file);
      if (fs.existsSync(`${jsonFolder}/${file}.json`)) {
          data = require(`${jsonFolder}/${file}.json`);
      } else {
          data = inputData('./input-data-set/' + file);
          saveDataToJson(data, `${jsonFolder}/${file}.json`);
      }
    console.log('processing....', file);
    let outputData = processVideos(data);
    console.log('output...', file);
    output(outputData, 'output/' + file + '.output.txt');
  });
});


