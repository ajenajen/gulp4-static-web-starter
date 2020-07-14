# gulp4-static-web-starter
> OptimizedHTML Gulp v4 - Start HTML Template
> using Gulp, HTML base on Bootstrap 4, SASS, Js, PHP, Browsersync, Autoprefixer, Clean-CSS, Uglify, Rsync and Bower (libs path) support.
> The template contains a .htaccess file with caching rules for web server.

## Requirements
Make sure all dependencies have been installed before moving on:
* [Gulpfile + Package.json](https://gulpjs.com/docs/en/getting-started/quick-start)
* [Node.js](http://nodejs.org/)

### Get Started install Node Package from Package.json 
```bash
$ npm install 
```

### Development
```bash
$ gulp 
```

### Build for production
```bash
$ gulp export
```

#### Gulp tasks:
* gulp: run default gulp task (sass, js, watch, browserSync) for web development;
* gulp export: run gulp export for file transfer to another development;
* rsync: project deployment on the server from dist folder via RSYNC;
* (run rsync change current .htaccess name and switch ht.access to .htaccess )