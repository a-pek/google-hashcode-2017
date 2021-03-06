let fs = require('fs');

module.exports = function(data, fileName){ // This is the cache server data

    fileName = fileName || 'output.txt';

    let outputString = data.length + '\n';

    for(let i = 0; i<data.length; i++){
        let server = data[i];
        outputString += server.id + ' ';
        outputString += server.videoList.map(function(v){
            return v.id
        }).join(' ') + '\n';    
    }
    fs.writeFileSync(fileName, outputString);
};