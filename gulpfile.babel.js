const gulp = require('gulp');
const spawn = require('child_process').spawn;
const hugoBin = require('hugo-bin');
const log = require('fancy-log');
const pluginError = require('plugin-error');
const flatten = require('gulp-flatten');
const postcss = require('gulp-postcss');
const cssImport = require('postcss-import');
const postcssPresetEnv = require('postcss-preset-env');
const BrowserSync = require('browser-sync');
const http2 = require('http2');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

const browserSync = BrowserSync.create();

// Hugo arguments
const hugoArgsDefault = ['-d', '../dist', '-s', 'site', '-v'];
const hugoArgsPreview = ['--buildDrafts', '--buildFuture'];

// Development tasks
gulp.task('hugo', (cb) => buildSite(cb));
gulp.task('hugo-preview', (cb) => buildSite(cb, hugoArgsPreview));

// Run server tasks
gulp.task('server', ['hugo', 'css', 'js', 'fonts'], (cb) => runServer(cb));
gulp.task('server-preview', ['hugo-preview', 'css', 'js', 'fonts'], (cb) => runServer(cb, 'hugo-preview'));

// Build/production tasks
gulp.task('build', ['css', 'js', 'fonts'], (cb) => buildSite(cb, [], 'production'));
gulp.task('build-preview', ['css', 'js', 'fonts'], (cb) => buildSite(cb, hugoArgsPreview, 'production'));

// Compile CSS with PostCSS
gulp.task('css', () => (
    gulp.src('./src/css/*.css')
    .pipe(postcss([cssImport({from: './src/css/main.css'}), postcssPresetEnv()]))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream())
));

// Compile JavaScript
gulp.task('js', (cb) => {
    const myConfig = Object.assign({}, webpackConfig);

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
            key: "./server.key",
            cert: "./server.crt"
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
            cb();
        } else {
            browserSync.notify('Hugo build faild :(');
            cb('Hugo build faild');
        }
    });
}
