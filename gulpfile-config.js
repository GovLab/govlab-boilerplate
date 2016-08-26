  exports.fiz = function () {
      console.log('fiz!');
    }

// get arguments from command line
var argv = minimist(process.argv.slice(2));

// command line options (usage: gulp --optionname)
var cliOptions = {
  verbose   : false || argv.verbose,
  nosync    : false || argv.nosync
};

// gulpfile options
var options = {
  path: './source/templates/', // base path to templates
  dataPath: './source/data/', // base path to datasets
  ext: '.html', // extension to use for templates
  dataExt: '.json', // extension to use for data
  manageEnv: nunjucksEnv, // function to manage nunjucks environment
  libraryPath: 'node_modules/govlab-styleguide/dist/', // path to installed sass/js library distro folder
  defaultData: './source/data/default.json', // default dataset to use if no automatically generated template is found
  hashLength: 7, // length to truncate hash for page urls
  slugLength: 128, // length to truncate title slug for page urls
  useId: // whitelist for data files to use an id hash in the url, all others will just be title slug
  [
  ]
};