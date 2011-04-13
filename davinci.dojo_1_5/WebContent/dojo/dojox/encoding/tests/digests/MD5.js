dojo.provide("dojox.encoding.tests.digests.MD5");
dojo.require("dojox.encoding.digests.MD5");

(function(){
	var message="The rain in Spain falls mainly on the plain.";
	var base64="OUhxbVZ1Mtmu4zx9LzS5cA==";
	var hex="3948716d567532d9aee33c7d2f34b970";
	var s="9HqmVu2\xD9\xAE\xE3<}/4\xB9p";
	var ded=dojox.encoding.digests;

	tests.register("dojox.encoding.tests.digests.MD5", [
		function testBase64Compute(t){
			t.assertEqual(base64, ded.MD5(message));
		},
		function testHexCompute(t){
			t.assertEqual(hex, ded.MD5(message, ded.outputTypes.Hex)); 
		},
		function testStringCompute(t){
			t.assertEqual(s, ded.MD5(message, ded.outputTypes.String)); 
		}
	]);
})();
