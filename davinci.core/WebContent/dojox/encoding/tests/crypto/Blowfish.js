dojo.provide("dojox.encoding.tests.crypto.Blowfish");
dojo.require("dojox.encoding.crypto.Blowfish");

(function(){
	var message="The rain in Spain falls mainly on the plain.";
	var key="foobar";
	var base64Encrypted="WI5J5BPPVBuiTniVcl7KlIyNMmCosmKTU6a/ueyQuoUXyC5dERzwwdzfFsiU4vBw";
	var dxc=dojox.encoding.crypto;

	tests.register("dojox.encoding.crypto.tests.Blowfish", [
		function testEncrypt(t){
			var dt=new Date();
			t.assertEqual(base64Encrypted, dxc.Blowfish.encrypt(message, key));
			doh.debug("testEncrypt: ", new Date()-dt, "ms.");
		},
		function testDecrypt(t){
			var dt=new Date();
			t.assertEqual(message, dxc.Blowfish.decrypt(base64Encrypted, key));
			doh.debug("testDecrypt: ", new Date()-dt, "ms.");
		},
		function testShortMessage(t){
			var msg="pass";
			var pwd="foobar";
			var dt=new Date();
			var enc=dxc.Blowfish.encrypt(msg, pwd);
			var dec=dxc.Blowfish.decrypt(enc, pwd);
			t.assertEqual(dec, msg);
			doh.debug("testShortMessage: ", new Date()-dt, "ms.");
		}
	]);
})();
