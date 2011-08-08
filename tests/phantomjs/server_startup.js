/**
 * Test that a user can load Maqetta in browser without errors.
 *
 * This script tests the following:
 *   1) That page at server URL loads successfully, and
 *   2) that there are no JS errors in the console on initial load.
 */

var SERVER_URL = 'http://localhost:50000/maqetta',

    page = new WebPage(),
    reErrorMsg = /(^[a-zA-Z]*Error:|\WException\W)/;


page.onConsoleMessage = function(msg, lineNum, sourceId) {
    // Exit if there is an error message
    if (reErrorMsg.test(msg)) {
        console.error(msg);
        console.error('\t' + sourceId + ' @ line ' + lineNum);
        phantom.exit(1);
    }
    console.log(msg);
};

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