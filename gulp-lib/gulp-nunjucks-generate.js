// gulp-nunjucks-generate.js
// functions related to custom data injection and generating "one-to-many" templates with nunjucks

const config = require('../gulp-config.js')('..');
const configCwd = require('../gulp-config.js')('.');

var
File            = require('vinyl'),
es              = require('event-stream'),
request         = require('request'),
fs              = require('fs')
;

// object used to compile data extracted from the data sources
exports.generatedData = {}
exports.lock = false;

// compile all the datasets into a composite set
// for injection into nunjucks using gulp-data
var compileData = function (dataPath, ext, cb) {

  // stupid code courtesy of node doesnt support default parameters as of v5
  ext = ext === undefined ? config.options.dataExt : ext;

  var dataDir = fs.readdirSync(dataPath),
  _dataIndex = require(config.options.dataIndex);
  baseName, r, _data;

  for (var d in _dataIndex) {
    baseName = _dataIndex[d].name;

    if (_dataIndex[d].source.type == 'local') {
      // add JSON to generatedData object
      _data = require(config.options.dataPath + _dataIndex[d].source.location).data;
    } else if (_dataIndex[d].source.type == 'remote') {
      var httpData = '';
      exports.lock = true;
      request
      .get(url)
      .on('error', function(err) {
        console.log(err)
        exports.lock = false;
      })
      .on('response', function (response) {
        response.on('data', (chunk) => {
          if (chunk) { httpData += chunk };
        });
        response.on('end', () => {
          if (httpData.length) { console.log('Stream data recieved from HTTP (length)', httpData.length); }
          else { console.log('No data received from HTTP'); }
          cb(baseName, JSON.parse(httpData), 'remote');
        });
      });
    } else {
      console.log ('compileData: unknown source type');
    }

    exports.generatedData[baseName] = _data;
    exports.generatedData[baseName]._type = _dataIndex[d].type;
    exports.generatedData[baseName]._target = _dataIndex[d].target || false;
  }
}

var updateData = function (name, data) {
  exports.generatedData[name] = data;
  exports.lock = false;
}

// generate a stream of one or more vinyl files from a json data source
// containing the parent template specified by templatePath
// which can then be piped into nunjucks to create output with data scoped to the datum
exports.generateVinyl = function (basePath, dataPath, fSuffix, dSuffix) {
  var files = [], r, r2, f, baseTemplate, baseName, _data, fname,
  base = fs.readdirSync(basePath);

  // stupid code courtesy of node doesnt support default parameters as of v5
  fSuffix = fSuffix === undefined ? config.options.ext : fSuffix;
  dSuffix = dSuffix === undefined ? config.options.dataExt : dSuffix;

  // compile datasets
  compileData(dataPath, dSuffix, updateData);

  while (exports.lock) {
    console.log('Waiting for data to finish compiling (this may take a few minutes)...\r');
  }

  for (var d in exports.generatedData) {

    if ( exports.generatedData[d]._type = 'multi') {
      _path = exports.generatedData[d]._target || d + config.options.ext;
      _data = exports.generatedData[d];

      baseTemplate = fs.readFileSync(basePath + _path);

      // create a new vinyl file for each datum in _data and push to files
      // using directory based on naming convention and base template as content
      for (var d in _data) {
        f = new File({
          path: _path,
          contents: baseTemplate
        });
        f.data = _data[d];
        files.push(f);
      }
    }
  }

  // convert files array to stream and return
  return require('stream').Readable({ objectMode: true }).wrap(es.readArray(files));
}