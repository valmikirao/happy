'use strict';

var Browerify = require('browserify');
var FileStream = require('fs');
var tsify = require('tsify');

var fileIn = process.argv[2];

if (fileIn === process.argv[1]) {
    throw('You can\'t build yourself!!!');
}

var fileOut = fileIn.replace(/[.][jt]sx$/, '.js');

if (fileIn === fileOut) {
    fileOut = fileIn.replace(/[.][jt]s$/, '.dist.js');

    if (fileIn === fileOut) {
        throw('Wrong file extensions');
    }    
}

if (_inClientDir(fileIn)) {
    console.log('Browerifying ' + fileIn + ' ...');

    var browserify = Browerify([fileIn], {debug : true});
    // browserify.plugin(tsify, {
    //     allowJs : true,
    //     noImplicitAny : false,
    //     target : 'es6',
    //     extensions : [ 'ts', 'tsx' ]
    // });
    browserify.transform('babelify', {
        presets : [
            'react',
            'es2016',
            'latest',
            'stage-3'
        ]
        // extensions : [
        //     'js',
        //     'jsx'
        //     // 'ts',
        //     // 'tsx'
        // ]
    });
    var bundleStream = browserify.bundle();
    var fileOutStream = FileStream.createWriteStream(fileOut);
    bundleStream.pipe(fileOutStream);
    fileOutStream.on('finish', (err) => {
        console.log('... done, in ' + fileOut);

        if (err) {
            console.log(err);
            return;
        }

        if (fileOut.match(/-test[.]dist[.]js$/)) {
            // run test files
            try {
                require(fileOut);
            }
            catch (err) {
                console.error(err.stack);
            }

            var debugHtmlFile = fileOut.replace(/[.]js$/, '.html');
            var fileSrc = fileOut.replace(/^.*\\/, '');
            var debugHtmlText = '<script type="text/javascript" src="' + fileSrc + '"></script>';
            FileStream.writeFile(debugHtmlFile, debugHtmlText, (err) => {
                if (err) {
                    console.log(err);
                    return;
                }

                console.log('Wrote ' + debugHtmlFile + ' ' + debugHtmlText);            
            })
        }
    });
}
else {
        if (fileOut.match(/-test[.]dist[.]js$/)) {
            // run test files
            try {
                require(fileIn);
            }
            catch (err) {
                console.error(err.stack);
            }
        }
}

// TODO: I don't think I need this anymore, I'm
// not building anything server-side
function _inClientDir(fileName) {
    if (fileName.match(/\\lib\\/)) {
        return true;
    }
    else if (fileName.match(/\\server-lib\\/)) {
        return false;
    }
    else {
        // there are some files I should move to the client directory
        return true;
    }
} 