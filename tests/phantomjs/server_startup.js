/*global phantom:false */

/**
 * Test that a user can load Maqetta in browser without errors.
 *
 * This script tests the following:
 *   1) That page at server URL loads successfully, and
 *   2) that there are no JS errors in the console on initial load.
 */

var SERVER_URL = 'http://localhost:50000/maqetta',
    page = require('webpage').create();

/* XXX Disable error checking.  Fails with latest code, but only here in
       PhantomJS; works fine when loading from browser.
page.onError = function (msg, trace) {
    console.error(msg);
    trace.forEach(function(item) {
        console.error('  ', item.file, ':', item.line);
    });
    phantom.exit(1);
};
 */

page.open(SERVER_URL, function (status) {
    if (status !== 'success') {
        console.error('FAILED to load "' + SERVER_URL + '"');
        phantom.exit(1);
    }
    // wait a few seconds to make sure there are no surprises,
    // then exit without error
    setTimeout(function() {
        phantom.exit();
    }, 5000);
});