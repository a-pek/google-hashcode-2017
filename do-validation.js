const {readdirSync} = require('fs');
const {submission} = require('./validation');

const INPUT_DIR = './input-data-set';
const OUTPUT_DIR = './output';

var sum = 0;
readdirSync(INPUT_DIR).forEach( (filename) => {
    var inputFile = `${INPUT_DIR}/${filename}`;
    var outputFile = `${OUTPUT_DIR}/${filename}.output.txt`;
    console.log('submitting:', inputFile, outputFile);
    var {isValid, score} = submission(inputFile, outputFile);
    console.log(`The output data is valid: ${isValid}, the score for it: ${score}`);
    sum += score;
});
console.log(`The final score is: ${sum}`);
