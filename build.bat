echo Building ...
node_modules\.bin\browserify --debug -t [ babelify --presets [ react es2016 latest stage-3 ] --extensions .jsx,.js ] happy.jsx -o happy.js
echo done.