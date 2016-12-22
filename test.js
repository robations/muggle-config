var Jasmine = require("jasmine");
var jas = new Jasmine();

/* jshint -W106 */
jas.loadConfig({
    spec_dir: "dist/tests/",
    spec_files: [
        "**/*.spec.js"
    ],
    helpers: []
});

jas.execute();

