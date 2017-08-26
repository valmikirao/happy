const commonConfigs = {
            // Enable sourcemaps for debugging webpack's output.
        devtool: "source-map",

        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: [".ts", ".tsx", ".js", ".json"]
        },

        module: {
            rules: [

                // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
                {test: /\.tsx?$/, loader: "awesome-typescript-loader",  },

                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
            ]
        },

}
module.exports = [
    Object.assign({}, commonConfigs, {
        entry: "./react/happy.tsx",
        output: {
            filename: "happy.js",
            path: __dirname + "/dist/react"
        },
    }),
    Object.assign({}, commonConfigs, {
        entry: "./react/happy-list.tsx",
        output: {
            filename: "happy-list.js",
            path: __dirname + "/dist/react"
        },
    }),
];
