// build-tasks.js
// gulp task module for tasks related to the static site build pipeline

// config file
// --- using both for testing, but probably only need one ---
const config = require('../gulp-config.js')('..');
const configCwd = require('../gulp-config.js')('.');

var
// libs
fs              = require('fs'),
md5             = require('md5'),
File            = require('vinyl'),
gulp            = require('gulp'),
util            = require('gulp-util'),
yaml            = require('gulp-yaml'),
data            = require('gulp-data'),
nunjucksRender  = require('gulp-nunjucks-render'),
flatten         = require('gulp-flatten'),
plumber         = require('gulp-plumber'),
intercept       = require('gulp-intercept'),

// local libs
gen             = require('./gulp-nunjucks-generate.js')
;

// converts string t to a slug (eg 'Some Text Here' becomes 'some-text-here')
var slugify = function (t) {
  return t ? t.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '')
  : false ;
};

exports.yaml = function () {
  return gulp.src(configCwd.options.dataPath + '**/*.+(yaml|yml)')
  .pipe(yaml())
  .pipe(gulp.dest(configCwd.options.dataPath));
};

exports.json = function() {
  return gulp.src(configCwd.options.dataPath + '**/*.json')
  .pipe(intercept(function(file) {
    var o = JSON.parse(file.contents.toString()),
    b = {},
    p;
      // wrap json in a top level property 'data'
      if (!o.hasOwnProperty('data')) {
        b.data = o;
      } else {
        b = o;
      }
      // do some processing on the json
      for (var j in b.data) {
        if (!b.data[j].hasOwnProperty('id')) { // assign a unique id to each entry in data
          if (b.data[j].hasOwnProperty('title')) { // use title to create hash if exists,
            b.data[j].id = md5(b.data[j].title);
          } else {  // otherwise use first prop
            b.data[j].id = md5(b.data[j][Object.keys(b.data[j])[0]]);
          }
        }
        // build paths / urls for files
        if (!b.data[j].hasOwnProperty('path')) {
          p = '';
          if (config.options.useId.indexOf(file.path.replace(/^.*\//g, '')) > -1) {
            if (b.data[j].hasOwnProperty('id')) {
              p += slugify(b.data[j].id).substring(0, config.options.hashLength) + '-';
            }
          }
          if (b.data[j].hasOwnProperty('title')) { // name file if title exists
            p += slugify(b.data[j].title).substring(0, config.options.slugLength) + config.options.ext;
          }
          b.data[j].path = p;
        }
      }
      if (config.cliOptions.verbose) {
        util.log(util.colors.magenta('Proccessing json, ' + file.path));
      }
      file.contents = new Buffer(JSON.stringify(b));
      return file;
    }))
  .pipe(gulp.dest(configCwd.options.dataPath));
};

exports.nunjucksGenerated = function() {
  return gen.generate()
  .pipe(plumber())
  .pipe(data(function(file) {
    if (config.cliOptions.verbose) {
      util.log(util.colors.green(' Generated Template ' + file.path), ': using', JSON.stringify(file.data));
    }
    var d = file.data;

    // add all datasets as special prop $global
    d.$global = gen.generatedData;
    return d;
  }))
  .pipe(nunjucksRender(configCwd.options))
  .pipe(flatten())
  .pipe(gulp.dest(configCwd.options.sitePath));
};

// exports.nunjucksHTTP = function(url) {
//   return gulp.src(configCwd.options.path + '**/*.+(html|nunjucks)')
//   .pipe(data(function(file, cb) {

//     var httpData = '';
//     request
//     .get(url)
//     .on('response', function (response) {
//       response.on('data', (chunk) => {
//         if (chunk) { httpData += chunk };
//       });
//       response.on('end', () => {
//         if (httpData.length) { console.log('Stream data recieved from HTTP (length)', httpData.length); }
//         else { console.log('No data received from HTTP'); }
//         cb(undefined, JSON.parse(httpData));
//       });
//     });

//   }))
//   .pipe(nunjucksRender(config.options))
//   .pipe(flatten())
//   .pipe(gulp.dest(configCwd.options.sitePath));
// };

exports.nunjucks = function() {
  console.log(configCwd.options.path)
  return gulp.src(configCwd.options.path + '**/*.+(html|nunjucks)')
  .pipe(plumber())
  .pipe(data(function(file) {
    console.log(file.path);
    return gen.generatedData;
  }))
  .pipe(nunjucksRender(configCwd.options))
  .pipe(flatten())
  .pipe(gulp.dest(configCwd.options.sitePath));
};
