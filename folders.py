.gitignore # we ignore public and any auto generated files for repository sanitation.

package.json
# Styleguide Updates to be done via `npm update`

source/
  vendor/
    styleguide/   # styleguide SASS, JS and Image files | I want this as SASS files so we can use the variables, and @extend classes.
      images/**   # the styleguide doesn't need to be in this folder. If it is easier to pull it into /node_modules, let's do it
      components/**
      styleguide.scss
      foundation.min.css
      jquery-2.1.4.min.js
      slick.css
      slick.js
  
  images/         # site specific images

  js/
    scripts.js    # site specific js

  templates/      
    _base.html    # boilerplate base. Base setup for a styleguide enabled site. Can be tweaked for each project.
    index.html    # index example. Will be tweaked for the project needs
                  # temp vinyl files whould not be saved here, or at least kept in .gitignore
  
  data/
    data.json     # global data file, available anywhere in the system using {{global.variable}} | Check below
    
  sass/           # site specific styles. Specific components, tweaks or new reusable components are added here.
    styles.scss   # @import ../**/styleguide/**.scss and _custom.scss
    _custom.scss

gulpfile.js
# imports 'extra-tasks.js' | or whichever name you prefer :)
# DONE- Task - clean - clean public on watch
# DONE - Task - browser-sync
# DONE - Task - sass - with sourcemaps, and error log (not breaking gulp watch)
# DONE - Tasks - vendor, image, js - copying files from source to public
# Task - maybe watch the data/ folder for auto refresh on that?
# Task - nunjucks
# DONE - Tasks - push-gh-master, push-gh-pages - these areused for the deploy task
# DONE - Task - deploy
# HALF-DONE - Task - watch
# HALF-DONE - Task - default

extra_tasks.js
# long file with the long tasks
# Initial Extra Tasks
# - convert yaml to json
# - data.json to aggregate data from local and remote sources (contentful thingy)
# - generatePages() - cleaned version of OGRX. Generate html files from yaml item. 
#   Ideally not creating any temp files inside source/ folder.


data.json # Example
{ 'global': [
    { 
      'posts': 'http://url-from-contentful-api.json',
      'template': 'posts.html'
    },{ 
      'resources': 'resources.json',
      'template': ''
    },{
    ...
    }
]}






