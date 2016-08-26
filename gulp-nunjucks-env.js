  exports.fiz = function () {
      console.log('fiz!');
  }

// set up nunjucks environment
function nunjucksEnv(env) {
    env.addFilter('slug', slugify);
    env.addFilter('dateFilter', dateFilter);
    env.addGlobal('getContext', function() {
        return this.ctx;
    });
}

function dateFilter(date, arg) {
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
}

// converts string t to a slug (eg 'Some Text Here' becomes 'some-text-here')
function slugify(t) {
  return t ? t.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '')
  : false ;
}
