'use strict';

var fileIn = process.argv[2];
var fileOut = fileIn.replace(/\.jsx$/, '.js');

console.log('Browerifying ' + fileIn + ' ...');

var Browerify = require('browserify');
var FileStream = require('fs');

var browserify = Browerify([fileIn]);
browserify.transform('babelify', {presets : [
    'react',
    'es2016',
    'latest',
    'stage-3'
]});
var bundleStream = browserify.bundle();
var fileOutStream = FileStream.createWriteStream(fileOut);
bundleStream.pipe(fileOutStream);
bundleStream.on('end', () => {
    console.log('... done, in ' + fileOut);
});
