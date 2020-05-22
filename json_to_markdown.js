//Andrew Um 5/22/2020

// The script should be run as follows:
// node json_to_markdown.js input_file.json

// Make sure to provide a file as a parameter.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

var path = require('path');
const EXTENSION = '.json';

var fs = require('fs'), filename = process.argv[2];

if (path.extname(filename).toLowerCase() !== EXTENSION) {
  console.log('Error: Please provide the correct json file');
  process.exit(1);
};

fs.readFile(filename, 'utf8', function (err, data) {
  if (err) throw err;
  //Parse the JSON data
  const entries = JSON.parse(data);

  //Get list of column names
  var flattenedArr = [];
  Object.keys(entries).forEach(function (key) {
    const columnName = Object.keys(entries[key]).map(v => v.toLowerCase());
    flattenedArr.push(...columnName);
  });
  var columnList = Array.from(new Set(flattenedArr)).sort();

  //Create writable stream
  var writeStream = fs.createWriteStream('output.md', {
    flags: 'w' //Overwrite file if it already exists
  });

  writeStream.on('open', function (fd) {
    //Helper
    /* This helper is used as a lookup/dictionary to compare when the keys are essentially the same words 
    but maybe have different letter casing */
    var theKeys;
    var lookup = {};
    var getPropValue = function (prop) {
      return lookup[prop.toLowerCase()];
    }

    //Methods
    var writeColumns = () => {
      for (let x = 0; x < columnList.length; x++) {
        if (x == 0) {
          writeStream.write('|')
        }
        writeStream.write(' ' + columnList[x].toString() + ' |')
      }
      writeStream.write('\n')
    }
    var writeHyphenLines = () => {
      for (let x = 0; x < columnList.length; x++) {
        if (x == 0) {
          writeStream.write('|')
        }
        writeStream.write(' --- |')
      }
      writeStream.write('\n')
    }
    var writeEntries = () => {
      //Traverse through entries
      for (let j = 0; j < entries.length; j++) {
        var entry = entries[j];

        //Get all keys within entry object and populate key lookup dictionary
        theKeys = Object.getOwnPropertyNames(entry);
        theKeys.forEach(function (key) {
          lookup[key.toLowerCase()] = key;
        });
        writeStream.write('|')

        //Iterate through entry object and write values
        for (let i = 0; i < columnList.length; i++) {
          let key = getPropValue(columnList[i]);
          //If key/value does not exist for the given column
          if ((theKeys.indexOf(key) < 0)) {
            writeStream.write(' |')
          } else {
            if (typeof entry[key] === 'object' && entry[key] !== null) {
              writeStream.write(' ' + JSON.stringify(entry[key]) + ' |')
            } else {
              writeStream.write(' ' + entry[key] + ' |')
            }
          }
        }
        if (j != entries.length - 1) writeStream.write('\n')
      }
    }

    writeColumns();
    writeHyphenLines();
    writeEntries();

    //End writing
    writeStream.end();
  })
  writeStream.on('error', function (err) {
    console.log(err);
  });
  writeStream.on('finish', function () {
    console.log('Conversion finished! ');
  })
});
