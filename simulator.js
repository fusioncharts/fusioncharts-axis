var page = require("webpage").create(),
    args = require('system').args,
    //pass in the name of the file that contains your tests
    testFile = "./dist/alltest.js",
    //all extensions in src folder
    srcFiles = "./dist/src.js",
    //pass in the url you are testing
    pageAddress = 'about:blank';

if (typeof testFile === 'undefined' || typeof srcFiles === 'undefined') { 
    console.error("Test Files or src files are not specified");
    phantom.exit();
}

page.open(pageAddress, function(status) {  
    if (status !== 'success') {
        console.error("Failed to open", page.frameUrl);
        phantom.exit();
    }

    var expectedContent = '<html><head><title>unittest-for-fusioncharts-axis</title>'+
    '</head><body><div></div></body></html>';
    page.setContent(expectedContent,pageAddress);

    //Inject mocha and chai                               
    page.injectJs("./node_modules/mocha/mocha.js");
    page.injectJs("./node_modules/chai/chai.js");
    //Inject Fusioncharts modules
    //page.injectJs("./node_modules/fusioncharts/fusioncharts.js");
    page.injectJs("./dist/fc.js");
    page.injectJs(srcFiles);

    //inject your test reporter
    page.injectJs("reporter.js");

    //inject your tests
    page.injectJs(testFile);

    page.evaluate(function() {
        if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
        else { mocha.run(); }
    });
});

page.onCallback = function(data) {  
    data.message && console.log(data.message);
    data.exit && phantom.exit(+data.error);
};

page.onConsoleMessage = function(msg) {
    console.log(msg);
};