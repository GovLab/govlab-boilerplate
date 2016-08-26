  exports.fiz = function () {
      console.log('fiz!');
    }

// AUTO GENERATED PAGES

// compile all the datasets into a composite set
// for injection into nunjucks using gulp-data
var generatedData = {};

function compileData(dataPath, ext) {
  ext = ext === undefined ? options.dataExt : ext;
  var dataDir = fs.readdirSync(dataPath),
  baseName, r, _data;

  // look for a data file matching the naming convention
  r = new RegExp('\\' + ext + '$');
  for (var dataset in dataDir) {
    if (r.test(dataDir[dataset])) {

      // trim basename
      baseName = dataDir[dataset].replace(new RegExp('\\' + ext + '$'), '');

      // add JSON to object
      _data = require(dataPath + dataDir[dataset]).data;
      generatedData[baseName] = _data;
    }
  }
}

// generate a stream of one or more vinyl files from a json data source
// containing the parent template specified by templatePath
// which can then be piped into nunjucks to create output with data scoped to the datum
function generateVinyl(basePath, dataPath, fSuffix, dSuffix) {
  var files = [], r, r2, f, baseTemplate, baseName, _data, fname,
  base = fs.readdirSync(basePath);

  // stupid code courtesy of node doesnt support default parameters as of v5
  fSuffix = fSuffix === undefined ? options.ext : fSuffix;
  dSuffix = dSuffix === undefined ? options.dataExt : dSuffix;

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
      for (var dataset in generatedData) {
        if (dataset === baseName) {

          _data = generatedData[dataset];

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

gulp.task('yaml', function () {
  return gulp.src('source/data/**/*.+(yaml|yml)')
  .pipe(yaml())
  .pipe(gulp.dest('source/data'));
});

gulp.task('json', ['yaml'], function() {
  return gulp.src('source/data/**/*.json')
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
            b.data[j].id = md5(b.data[j].title); // otherwise use first prop
          } else {
            b.data[j].id = md5(b.data[j][Object.keys(b.data[j])[0]]);
          }
        }
        // build paths / urls for files
        if (!b.data[j].hasOwnProperty('path')) {
          p = '';
          if (options.useId.indexOf(file.path.replace(/^.*\//g, '')) > -1) {
            if (b.data[j].hasOwnProperty('id')) {
              p += slugify(b.data[j].id).substring(0, options.hashLength) + '-';
            }
          }
          if (b.data[j].hasOwnProperty('title')) { // name file if title exists
            p += slugify(b.data[j].title).substring(0, options.slugLength) + options.ext;
          }
          b.data[j].path = p;
        }
      }
      if (cliOptions.verbose) {
        util.log(util.colors.magenta('Proccessing json, ' + file.path));
      }
      file.contents = new Buffer(JSON.stringify(b));
      return file;
    }))
    .pipe(gulp.dest('source/data'));
});

gulp.task('nunjucksGenerated', ['json'], function() {
  return generateVinyl(options.path, options.dataPath)
  .pipe(plumber())
  .pipe(data(function(file) {
    if (cliOptions.verbose) {
      util.log(util.colors.green(' Generated Template ' + file.path), ': using', JSON.stringify(file.data));
    }
    var d = file.data;
    // add all datasets as special prop $global
    d.$global = generatedData;
    return d;
  }))
  .pipe(nunjucksRender(options))
  .pipe(flatten())
  .pipe(gulp.dest('public'));
});

gulp.task('nunjucksData', ['json'], function() {
  return gulp.src('source/templates/**/*.html')
  .pipe(plumber())
  .pipe(data(function(file) {
    return generatedData;
  }))
  .pipe(nunjucksRender(options))
  .pipe(flatten())
  .pipe(gulp.dest('public'));
});

// END AUTO GEN PAGES