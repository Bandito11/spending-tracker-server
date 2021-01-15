
const { series, src, dest, parallel } = require('gulp');
const ts = require('gulp-typescript');
const nodemon = require('gulp-nodemon');
const del = require('del');

function clean() {
    return del(['dist']);
}
/**
 * Build for the server side.
 */
function buildServer() {
    const tsProject = ts.createProject('src/tsconfig.json');
    return tsProject
        .src()
        .pipe(tsProject())
        .js
        .pipe(dest('dist'));
}

// function watch() {
//     gulp.watch(paths.server.src, buildServer);
// }


/**
 *Start the node app
 */
async function debug() {
    return nodemon({
        script: 'dist/server.js',
        ext: 'ts',
        watch: 'src/**/*',
        tasks: ['build']
    });
}

exports.build = series(clean, parallel( buildServer));
exports.default = series(clean, parallel( buildServer), debug);