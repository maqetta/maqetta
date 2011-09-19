dojo.provide("dojox.encoding.tests.crypto.SimpleAES");
dojo.require("dojox.encoding.crypto.SimpleAES");

(function(){
	var message="The rain in Spain falls mainly on the plain.";
	var key="foo-bar-baz";
	var enc = null;
	var dxc=dojox.encoding.crypto;

	tests.register("dojox.encoding.crypto.tests.SimpleAES", [
		function testAES(t){
			var dt = new Date();
			enc = dxc.SimpleAES.encrypt(message, key);
			doh.debug("Encrypt: ", new Date()-dt, "ms.");
			var dt2 = new Date();
			t.assertEqual(message, dxc.SimpleAES.decrypt(enc, key));
			doh.debug("Decrypt: ", new Date()-dt2, "ms.");
		}
	]);
})();
