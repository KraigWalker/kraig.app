const gulp = require('gulp');
const spawn = require('child_process').spawn;
const hugoBin = require('hugo-bin');
const log = require('fancy-log');
const pluginError = require('plugin-error');
const flatten = require('gulp-flatten');
const postcss = require('gulp-postcss');
const htmlmin = require('gulp-htmlmin');
const cssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');
const BrowserSync = require('browser-sync');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const minify = require('html-minifier').minify;
const fs = require('fs');

function minifyHtmlAsync() {
  fs.readFile('dist/index.html', 'utf-8', function(err, data){
    if (err) throw err;

    var newValue = minify(data, {        
        collapseWhitespace: true,
        minifyCSS: false,
        minifyJs: false,
        removeComments: true,
        removeScriptTypeAttributes: true,
        sortAttributes: true,
        sortClassName: true,
        removeStyleLinkTypeAttributes: true
    });

    fs.writeFile('dist/index.html', newValue, 'utf-8', function (err) {
      if (err) throw err;
      console.log('filelistAsync complete');
    });
  });
}

const browserSync = BrowserSync.create();


gulp.task('htmlminify', () => {
   gulp.src('dist/*.html')
    .pipe(htmlmin({ 
        collapseWhitespace: true,
        minifyCSS: false,
        minifyJs: false,
        removeComments: true,
        removeScriptTypeAttributes: true,
        sortAttributes: true,
        sortClassName: true,
        removeStyleLinkTypeAttributes: true
    }))
    .pipe(gulp.dest('dist'));
});

// Hugo arguments
const hugoArgsDefault = ['-d', '../dist', '-s', 'site', '-v'];
const hugoArgsPreview = ['--buildDrafts', '--buildFuture'];


// Build/production tasks
gulp.task('build', ['css', 'js', 'fonts'], (cb) => buildSite(cb, [], 'production'), 'htmlminify');
gulp.task('build-preview', ['css', 'js', 'fonts'], (cb) => buildSite(cb, hugoArgsPreview, 'production'), 'htmlminify');

// Compile CSS with PostCSS
gulp.task('css', () => (
    gulp.src('./src/css/*.css')
    .pipe(postcss([cssImport({from: './src/css/main.css'}), postcssPresetEnv()]))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream())
));

// Compile JavaScript
gulp.task('js', (cb) => {
    const swConfig = Object.assign({}, webpackConfig[0]);
    const myConfig = Object.assign({}, webpackConfig[1]);

    webpack(swConfig, (err, stats) => {
        if (err) {
            throw new pluginError('webpack', err);
        }
        log(`[webpack] ${stats.toString({
            colors: true,
            progress: true
        })}`);
    })

    webpack(myConfig, (err, stats) => {
        if (err) {
            throw new pluginError('webpack', err);
        }
        log(`[webpack] ${stats.toString({
            colors: true,
            progress: true
        })}`);
        browserSync.reload();
        cb();
    })
});

// Move all fonts in a flattened directory
gulp.task('fonts', () => (
    gulp.src('./src/fonts/**/*')
    .pipe(flatten())
    .pipe(gulp.dest('./dist/fonts'))
    .pipe(browserSync.stream())
));

// Development server with BrowserSync
function runServer(cb, hugoTask = 'hugo') {
    browserSync.init({
        https: {
            key: "./https/server.key",
            cert: "./https/server.crt"
        },
        server: {
            baseDir: './dist',
        }
    });
    gulp.watch('./src/js/**/*.js', ['js']);
    gulp.watch('.src/css/**/*.css', ['css']);
    gulp.watch('./src/fonts/**/*', ['fonts']);
    gulp.watch('./site/**/*', [hugoTask]);
}

/**
 * Run hugo and build the site
 * @param {Function} cb callback function
 * @param {*} options 
 * @param {*} environment 
 */
function buildSite(cb, options, environment = 'development') {
    const args = options ? hugoArgsDefault.concat(options) : hugoArgsDefault;

    process.env.NODE_ENV = environment;

    return spawn(hugoBin, args, {stdio: 'inherit'}).on('close', (code) => {
        if (code === 0) {
            browserSync.reload();
            minifyHtmlAsync();
            cb();
        } else {
            browserSync.notify('Hugo build faild :(');
            cb('Hugo build faild');
        }
    });
}

// Development tasks
gulp.task('hugo', (cb) => buildSite(cb));
gulp.task('hugo-preview', (cb) => buildSite(cb, hugoArgsPreview));

// Run server tasks
gulp.task('server', ['css', 'js', 'fonts', 'hugo'], (cb) => runServer(cb));
gulp.task('server-preview', ['css', 'js', 'fonts', 'hugo-preview'], (cb) => runServer(cb, 'hugo-preview'));
