  exports.fiz = function () {
      console.log('fiz!');
    }


gulp.task('nunjucksHTTP', function() {
  return gulp.src('source/templates/**/*.+(html|nunjucks)')
  .pipe(data(function(file, cb) {

    var httpData = '';
    request
    .get('https://raw.githubusercontent.com/GovLab/orgpedia-prototype/master/source/data/company.json')
    .on('response', function (response) {
      response.on('data', (chunk) => {
        if (chunk) { httpData += chunk };
      });
      response.on('end', () => {
        if (httpData.length) { console.log('Stream data recieved from HTTP (length)', httpData.length); }
        else { console.log('No data received from HTTP'); }
        cb(undefined, JSON.parse(httpData));
      });
    });

  }))
  .pipe(nunjucksRender({
    path: ['source/templates'],
    manageEnv: nunjucksEnv
  }))
  .pipe(gulp.dest('public'))
  .pipe(browserSync.reload({ stream: true }));
});
