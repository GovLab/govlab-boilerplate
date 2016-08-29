// gulp-nunjucks-generate.js
// functions related to custom data injection and generating "one-to-many" templates with nunjucks

const config = require('../gulp-config.js')('..');
const configCwd = require('../gulp-config.js')('.');

var
File            = require('vinyl'),
es              = require('event-stream'),
fs              = require('fs')
;

// object used to compile data extracted from the data sources
exports.generatedData = {}

// compile all the datasets into a composite set
// for injection into nunjucks using gulp-data
var compileData = function (dataPath, ext) {

  // stupid code courtesy of node doesnt support default parameters as of v5
  ext = ext === undefined ? config.options.dataExt : ext;

  var dataDir = fs.readdirSync(dataPath),
  baseName, r, _data;

  // look for a data file matching the naming convention
  r = new RegExp('\\' + ext + '$');
  for (var dataset in dataDir) {
    if (r.test(dataDir[dataset])) {

      // trim basename
      baseName = dataDir[dataset].replace(new RegExp('\\' + ext + '$'), '');

      // add JSON to object
      _data = require(config.options.dataPath + dataDir[dataset]).data;
      exports.generatedData[baseName] = _data;
    }
  }
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
  compileData(dataPath, dSuffix);

  for (var template in base) {
    // match a filename starting with '__' and ending with the file suffix
    r = new RegExp('^__[^.]*\\' + fSuffix + '$');
    if (r.test(base[template])) {
      // read the file in as our base template
      baseTemplate = fs.readFileSync(basePath + base[template]);

      // strip __ and extension to get base naming convention
      baseName = base[template]
      .replace(/^__/, '')
      .replace(new RegExp('\\' + fSuffix + '$'), '')
      ;

      // look for a dataset matching the naming convention
      for (var dataset in exports.generatedData) {
        if (dataset === baseName) {

          _data = exports.generatedData[dataset];

          // create a new vinyl file for each datum in _data and push to files
          // using directory based on naming convention and base template as content
          for (var d in _data) {
            f = new File({
              path: _data[d].path,
              contents: baseTemplate
            });
            f.data = _data[d];
            files.push(f);
          }
        }
      }
    }
  }

  // convert files array to stream and return
  return require('stream').Readable({ objectMode: true }).wrap(es.readArray(files));
}