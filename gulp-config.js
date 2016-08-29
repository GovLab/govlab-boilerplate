// gulp-config.js
// configuration options for the local gulp environment

var minimist = require('minimist');

var env = require('./gulp-lib/gulp-nunjucks-env.js');

// get arguments from command line
var argv = minimist(process.argv.slice(2));

module.exports = (prefix) => {

  return {
    // command line options (usage: gulp --optionname)
    cliOptions: {
      verbose   : false || argv.verbose,
      nosync    : false || argv.nosync
    },

    // gulpfile options
    options: {
      path: prefix + '/source/templates/', // base path to templates
      dataPath: prefix + '/source/data/', // base path to datasets
      sitePath: prefix + '/public/', // base path to site output
      ext: '.html', // extension to use for templates
      dataExt: '.json', // extension to use for data
      manageEnv: env, // function to manage nunjucks environment
      libraryPath: prefix + '/node_modules/govlab-styleguide/dist/', // path to installed sass/js library distro folder
      defaultData: prefix + '/source/data/default.json', // default dataset to use if no automatically generated template is found
      hashLength: 7, // length to truncate hash for page urls
      slugLength: 128, // length to truncate title slug for page urls
      useId: // whitelist for data files to use an id hash in the url, all others will just be title slug
      [
      ]
    }
  };

};