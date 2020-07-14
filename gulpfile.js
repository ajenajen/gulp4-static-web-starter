//========== Gulp file ==========//
var gmWatch        = false; // ON/OFF GraphicsMagick watching "img/_src" folder (true/false).

var gulp          = require('gulp');
const { file }    = require('babel-types');
		sass          = require('gulp-sass'),
		browserSync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require('gulp-notify'),
		rsync         = require('gulp-rsync'),
		imageResize   = require('gulp-image-resize'),
		imagemin      = require('gulp-imagemin'),
    minifyCSS     = require('gulp-minify-css'),
    minifyJS      = require('gulp-minify'),
    del           = require('del');

var paths = 'app';
var pathLocalhost = 'http://localhost/gulp4test';
var pathExport = paths + '/export';

var pathExports = {
  js:       pathExport + '/js' ,
  img:      pathExport + '/img' ,
  fonts:    pathExport + '/fonts' ,
  css:      pathExport + '/css'
};

// Local Server
gulp.task('browser-sync', function() {
	browserSync({
		server: {
      baseDir: 'app',
      // proxy: pathLocalhost
		},
		notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

// Sass|Scss Styles
gulp.task('styles', function() {
	return gulp.src(paths + '/scss/**/*.scss')
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest(paths + '/css'))
	.pipe(browserSync.stream())
});

// JS
gulp.task('scripts', function() {
	return gulp.src([
		paths + '/libs/js/jquery.min.js',
    paths + '/js/common.js', // Always at the end
	])
	.pipe(concat('scripts.min.js'))
	.pipe(gulp.dest(paths + '/js'))
	.pipe(browserSync.reload({ stream: true }))
});

// Images @x1 & @x2 + Compression | Required graphicsmagick (sudo apt update; sudo apt install graphicsmagick)
gulp.task('img1x', function() {
	return gulp.src(paths + '/img/_src/**/*.*')
	.pipe(imageResize({ width: '50%' }))
	.pipe(imagemin())
	.pipe(gulp.dest(paths + '/img/@1x/'))
});
gulp.task('img2x', function() {
	return gulp.src(paths + '/img/_src/**/*.*')
	.pipe(imageResize({ width: '100%' }))
	.pipe(imagemin())
	.pipe(gulp.dest(paths + '/img/@2x/'))
});

// Clean @*x IMG's
gulp.task('cleanimg', function() {
	return del([paths + '/img/@*'], { force:true })
});

// PHP Live Reload
gulp.task('code', function() {
	return gulp.src(paths + '/*.php')
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('img', gulp.parallel('img1x', 'img2x'));


//======================================================================


// Remove Export folder
gulp.task('cleanExport', function() { 
  return del(pathExport + '/**');
});
//Concatenates CSS files
gulp.task('concatVendorsStyles', function() {
  return gulp.src(paths + '/libs/css/**/*')
    .pipe(concat('all-libs.css'))
    .pipe(gulp.dest(pathExports.css))
    .pipe(minifyCSS())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(pathExports.css));
});
//Concatenates JS files
gulp.task('concatVendorScripts', function() {
  return gulp.src(paths + '/libs/js/**/*')
    .pipe(concat('all-libs.js'))
    .pipe(gulp.dest(pathExports.js));
});
gulp.task('minifyJS', function () {
  return gulp.src(pathExports.js + '/*.js')
    .pipe(minifyJS())
    .pipe(gulp.dest(pathExports.js));
});


// Export
gulp.task('export', 
  gulp.parallel('cleanExport', 'concatVendorsStyles', 'concatVendorScripts', 'minifyJS', 'styles', 'scripts'), 
  function() {
    gulp.src(paths + '/*.php').pipe(gulp.dest(pathExport))
    gulp.src(paths + '/img/_src/**/*.*').pipe(gulp.dest(pathExport + '/img/'))
    .on('end', function () { done(); });
  });


// Watch
gulp.task('watch', function() {
  gulp.watch(paths + '/scss/**/*.scss', gulp.parallel('styles'));
  gulp.watch(['libs/**/*.js', paths + '/js/common.js'], gulp.parallel('scripts'));
  gulp.watch(paths + '/*.php', gulp.parallel('code'));
  gmWatch && gulp.watch(paths + '/img/_src/**/*', gulp.parallel('img')); // GraphicsMagick watching image sources if allowed.
});
gmWatch ? gulp.task('default', gulp.parallel('img', 'styles', 'scripts', 'browser-sync', 'watch')) 
        : gulp.task('default', gulp.parallel('styles', 'scripts', 'browser-sync', 'watch'));


// Deploy
gulp.task('rsync', function() {
	return gulp.src(paths + '/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});