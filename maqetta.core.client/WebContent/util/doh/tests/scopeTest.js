// to run this test and see it pass, try either of (note sandbox parameter)
//	 * path/to/dojotoolkit/util/doh/runner.html?test=doh/tests/scopeTest&sandbox
//	 * path/to/dojotoolkit/util/doh/runner.html?test=doh/tests/scopeTest&sandbox&async
//
// to run this test and see it faile, try either of (note no sandbox parameter)
//	 * path/to/dojotoolkit/util/doh/runner.html?test=doh/tests/scopeTest
//	 * path/to/dojotoolkit/util/doh/runner.html?test=doh/tests/scopeTest&async

define(["doh/runner"], function(doh) {
	var global= this;
	doh.register("scope", function(t){
		t.is(global.dojo, undefined);
		t.is(global.dohDojo, undefined);
		t.isNot(require("dohDojo"), undefined);
	});
});
