// gulp-nunjucks-env.js
// add filters, globals, etc to the nunjucks environment

// returns a nicely formatted date based on keyword arg
var dateFilter = function (date, arg) {
    var locale = "en-us";
    var date = new Date(date);
    switch (arg) {
        case "month":
        return date.toLocaleString(locale, { month: "long" });
        break;
        case "day":
        return date.getDate();
        break;
        case "year":
        return date.getFullYear();
        break;
    }
};

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

// set up nunjucks environment
module.exports = (env) => {
    env.addFilter('slug', slugify);
    env.addFilter('dateFilter', dateFilter);
    env.addGlobal('getContext', function() {
        return this.ctx;
    });
};
