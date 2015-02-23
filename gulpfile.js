var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    es6ify = require('es6ify'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
    browserify = require('browserify'),

    $ = require('gulp-load-plugins')({
        pattern: ['gulp-*', 'main-bower-files'],
        rename: {
            'gulp-rev-all': 'revall',
        }
    });

require('colors');

/** Config variables **/
var path = require('path'),
    tmpDir = './.tmp',
    destDir = './dist',
    appDir = './app',
    bowerDir = appDir + '/bower_components';
    expressSrc = path.join(__dirname, destDir),
    port = 9000,
    lrPort = 4002,

// Allows gulp <target> --dev to be run for a non-minified output
    isDev = $.util.env.dev === true,
    isProduction = !isDev;

/**********************/


function log(error) {
    console.log([
        '',
        "----------ERROR MESSAGE START----------".bold.red.underline,
        ("[" + error.name + " in " + error.plugin + "]").red.bold.inverse,
        error.message,
        error.stack,
        "----------ERROR MESSAGE END----------".bold.red.underline,
        ''
    ].join('\n'));
    this.end();
}


/** express server & lr & watch **/
var tinylr;

gulp.task('express', function (cb) {
    var express = require('express');
    var app = express();
    console.log(('start express in ' + expressSrc).green);
    app.use(require('connect-livereload')({port: lrPort}));
    app.use(express.static(expressSrc, {
        setHeaders: function (res, path, stat) {
            res.set('cache-control', "no-cache")
        }
    }));
    app.listen(port);
    cb();
});

gulp.task('livereload', function (cb) {
    tinylr = require('tiny-lr')();
    tinylr.listen(lrPort);
    cb();
});

gulp.task('open',function(cb){
    var url = 'http://localhost:' + port + '/';
    console.log('Open ' +url.bold.green);
    require('opn')(url);
    cb();
});

gulp.task('watch', function (cb) {
    gulp.watch([expressSrc + '/**/*.*'], notifyLiveReload);
    gulp.watch([appDir + '/js/**'], ['js', 'html']);
    gulp.watch([appDir + '/tpl/**'], ['tpl']);
    cb();
});

function notifyLiveReload(event) {
    console.log('notifyLiveReload'.yellow);

    var fileName = require('path').relative(__dirname, event.path);
    tinylr.changed({
        body: {
            files: [fileName]
        }
    });
}

gulp.task('serve', function () {
    isDev = true;
    isProduction = false;
    runSequence('build',['express', 'livereload'],['watch', 'open']);
});
/**********************/


/** buid **/
var entryFile = path.resolve(appDir, 'js', 'main.js'),
    bundler;

gulp.task('browserify', function(cb){
    bundler = browserify({
        debug: isDev,
        entries: [entryFile]
    });

    if (isDev) {
        bundler = watchify(bundler,watchify.args);
        bundler.on('update', function(){
            console.log('Start watchify.update handler'.yellow);
            runSequence('bundle', 'html');
        });
    }
    bundler.transform(es6ify);
    cb();
});

gulp.task('js', function(){
    return gulp.src([appDir + '/js/**/*.js'])
        .pipe(gulp.dest(destDir+'/js/'))
});

gulp.task('bundle', function(){
    return bundler.bundle()
        .on('error', log)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(path.join(tmpDir, 'js')))
});

gulp.task('scripts', function (cb) {
    return runSequence('js', cb);
    //return runSequence('browserify', 'bundle', cb);
});

gulp.task('less',function(){
    return gulp.src(appDir + '/css/*.less')
        .pipe($.less({
            path: path.join(__dirname, 'less')
        }))
        .pipe(gulp.dest(tmpDir + '/css/'))
});

gulp.task('html', function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets = $.useref.assets({searchPath: ['{', tmpDir, ',', appDir, '}'].join('')});

    return gulp.src(appDir + '/*.html')
        .pipe(assets)

        .pipe(jsFilter)
        .pipe($.if(isProduction, $.ngmin()))
        //.pipe($.if(isProduction, $.uglify()))
        .pipe(jsFilter.restore())

        .pipe(cssFilter)
        .pipe($.if(isProduction, $.csso()))
        .pipe(cssFilter.restore())

        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest(destDir))
        .pipe($.size())
        .on('error', log);
});

gulp.task('static', ['css', 'fonts', 'userFonts', 'img', 'l10n', 'tpl', 'vendor']);

gulp.task('css', function(){
    return gulp.src([appDir + '/css/*.css'])
        .pipe(gulp.dest(destDir+'/css/'))
});

gulp.task('userFonts', function(){
    return gulp.src([appDir + '/fonts/**/*.*', bowerDir + '/components-font-awesome/fonts/**/*.*'])
        .pipe(gulp.dest(destDir+'/fonts/'))
});

gulp.task('fonts', function() {
    console.dir(appDir);
    return gulp.src($.mainBowerFiles(),{base:bowerDir})
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest(destDir+'/fonts'))
        .pipe($.size());
});

gulp.task('img', function(){
    return gulp.src([appDir + '/img/**/*.*'])
        .pipe(gulp.dest(destDir+'/img/'))
});

gulp.task('l10n', function(){
    return gulp.src([appDir + '/l10n/**/*.js'])
        .pipe(gulp.dest(destDir+'/l10n/'));
});

gulp.task('tpl', function(){
    return gulp.src(appDir + '/tpl/**/*.*')
        .pipe(gulp.dest(destDir+'/tpl/'));
});

gulp.task('vendor', function(){
    return gulp.src('./vendor/**/*.*')
        .pipe(gulp.dest(destDir+'/vendor/'))
        .pipe($.size());
});

gulp.task('rev', function () {
    return gulp.src(destDir + '/**/*.{js,css,png,jpg,jpeg,gif,ico,html,woff,ttf,eot,svg,swf}')
        .pipe($.if(isProduction, $.revall({
            transformFilename: function (file, hash) {
                var ext = path.extname(file.path);
                if (ext === '.html') {
                    return path.basename(file.path, ext) + ext;
                }
                return hash.substr(0, 8) + '.' + path.basename(file.path, ext) + ext;
            },
            prefix: ''
        })))
        .pipe(gulp.dest(destDir));
});

gulp.task('clean', require('del').bind(null, [tmpDir, destDir]));

gulp.task('afterBuild', function () {
    $.util.log('----------------'.green);
    $.util.log('Build finished:');
    $.util.log('IsDev:', isDev);
    $.util.log('isProduction:', isProduction);
    $.util.log('----------------'.green);
});

gulp.task('build', function (cb) {
    runSequence('clean', ['scripts', 'less', 'static'], 'html', 'rev', 'afterBuild', cb);
});
/**********************/



