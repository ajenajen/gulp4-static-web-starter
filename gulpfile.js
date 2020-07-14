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
    minifyJS      = require('gulp-minify'),
    del           = require('del');

var paths = 'app';
var pathExport = 'export';

var pathExports = {
  js:       pathExport + '/js' ,
  img:      pathExport + '/img' ,
  fonts:    pathExport + '/fonts' ,
  css:      pathExport + '/css'
};

// Local Server
gulp.task('browser-sync', function() {
	browserSync({
    proxy: 'http://localhost/gulp4test/app/',
		// server: {
    //   baseDir: 'app',
		// },
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
	return gulp.src(paths + '/js/common.js')
	.pipe(concat('scripts.min.js'))
	.pipe(gulp.dest(paths + '/js'))
	.pipe(browserSync.reload({ stream: true }))
});

// Images @x1 & @x2 + Compression
// Required graphicsmagick (For Mac : brew install graphicsmagick )(sudo apt update; sudo apt install graphicsmagick)
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

//Concatenates JS files
gulp.task('concatVendorScripts', function() {
  return gulp.src([
    paths + '/libs/js/**/*',
    paths + '/libs/**/*.js',
  ])
  .pipe(concat('all-libs.js'))
  .pipe(minifyJS())
  .pipe(gulp.dest(pathExports.js));
});

// Resize Image
gulp.task('img', gulp.parallel('img1x', 'img2x'));

//======================================================================


// Remove Export folder
gulp.task('cleanExport', function() { 
  return del(pathExport + '/**');
});

// Export Styles
gulp.task('exportStyles', function() {
	return gulp.src(paths + '/scss/**/*.scss')
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
	.pipe(gulp.dest(pathExports.css))
});

// Export JS
gulp.task('exportScripts', function() {
	return gulp.src(paths + '/js/common.js')
	.pipe(concat('scripts.min.js'))
	.pipe(gulp.dest(pathExports.js))
});

// Export
gulp.task('export', gulp.series(
  
  gulp.parallel('cleanExport', 'exportStyles', 'exportScripts', 'concatVendorScripts'), 
  function() {
    return gulp.src([paths + '/*.php', paths + '/**/*.php']).pipe(gulp.dest(pathExport)),
    gulp.src(paths + '/img/_src/**/*.*').pipe(gulp.dest(pathExports.img)),
    gulp.src(paths + '/fonts/**/*.*').pipe(gulp.dest(pathExports.fonts));
  }
)
);


// Watch
gulp.task('watch', function() {
  gulp.watch(paths + '/scss/**/*.scss', gulp.parallel('styles'));
  gulp.watch(paths + '/js/common.js', gulp.parallel('concatVendorScripts', 'scripts'));
  gulp.watch(paths + '/*.php', gulp.parallel('code'));
  gmWatch && gulp.watch(paths + '/img/_src/**/*', gulp.parallel('img')); // GraphicsMagick watching image sources if allowed.
});
gmWatch ? gulp.task('default', gulp.parallel('img', 'styles', 'scripts', 'concatVendorScripts', 'browser-sync', 'watch')) 
        : gulp.task('default', gulp.parallel('styles', 'scripts', 'concatVendorScripts', 'browser-sync', 'watch'));


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