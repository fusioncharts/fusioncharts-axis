(function() {

    var color = Mocha.reporters.Base.color;

    function log() {

        var args = Array.apply(null, arguments);

        if (window.callPhantom) {
            window.callPhantom({ message: args.join(" ") });
        } else {
            console.log( args.join(" ") );
        }

    }

    var Reporter = function(runner){

        Mocha.reporters.Base.call(this, runner);

        var out = [];
        var stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 }

        runner.on('start', function() {
            stats.start = new Date;
            out.push([ "Testing",  window.location.href, "\n"]);
        });

        runner.on('suite', function(suite) {
            stats.suites++;
            out.push([suite.title, "\n"]);
        });

        runner.on('test', function(suite) {
            stats.tests++;
        });

        runner.on("pass", function(test) {
            stats.passes++;
            if ('fast' == test.speed) {
                out.push([ color('checkmark', '  ✓ '), test.title, "\n" ]);
            } else {
                out.push([
                    color('checkmark', '  ✓ '),
                    test.title,
                    color(test.speed, test.duration + "ms"),
                    '\n'
                ]);
            }

        });

        runner.on('fail', function(test, err) {
            stats.failures++;
            out.push([ color('fail', '  × '), color('fail', test.title), ":\n    ", err ,"\n"]);
        });

        runner.on("end", function() {

            out.push(['ending']);

            stats.end = new Date;
            stats.duration = new Date - stats.start;

            out.push([stats.tests, "tests ran in", stats.duration, "ms"]);
            out.push([ color('checkmark', stats.passes), "passed and", color('fail', stats.failures), "failed"]);

            while (out.length) {
                log.apply(null, out.shift());
            }

            if (window.callPhantom) {
                window.callPhantom({ exit: true });
            }

        });

    };

    mocha.setup({
        ui: 'bdd',
        ignoreLeaks: true,
        reporter: Reporter
    });

}());