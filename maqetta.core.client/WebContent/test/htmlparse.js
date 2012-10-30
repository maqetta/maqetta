dojo.provide("test.htmlparse");

dojo.require("davinci.html.HTMLModel");
dojo.require("test.utils");



function doHTMLParseTest(str,test,isFragment)
{
//	davinci.model.parser.defaultParseOptions.ignoreError=true;

 var htmlFile = isFragment ? new davinci.html.HTMLElement(): new davinci.html.HTMLFile();
 htmlFile.setText(str,true);
 if (htmlFile.errors.length>0)
 {
	throw new doh._AssertFailure("parse errors on: "+str+"\n\n");
 }
 var result=htmlFile.getText({indent:0});
 test.assertEqual(str,result);
}


function doHTMLErrorParseTest(str,errors,test)
{
//	davinci.model.parser.defaultParseOptions.ignoreError=true;

 var htmlFile = new davinci.html.HTMLFile();
 htmlFile.setText(str);
 if (htmlFile.errors.length !=errors.length)
 {
	throw new doh._AssertFailure("wrong number of parse errors on: "+str+"\n\n");
 }
 for (var i=0;i<htmlFile.errors.length;i++)
 {
	 if (htmlFile.errors[i].raw != errors[i])
			throw new doh._AssertFailure("expected error '"+errors[i]+"' on : "+str+"\n\n");
 }
 
}


tests.register("test.htmlparse", 
		[
			function test(t){
				doHTMLParseTest("<html><head></head><body class=\"a\"><div class=\"b\"><label class=\"c\">LABEL</label></div></body></html>",t);
				doHTMLParseTest("<html> <head>\n</head>\n <body></body></html>",t);
				doHTMLParseTest('<html><body> <script src="abc"/></body></html>',t);
				doHTMLParseTest('<html><body> <script src/></body></html>',t);
				doHTMLParseTest('<html><body>abc</body></html>',t);
				doHTMLParseTest('<html><body>abc\n  <div></div>\n  <div></div></body></html>',t);
				doHTMLParseTest('<html><body>abc\ndef</body></html>',t);
				doHTMLParseTest('<html><body><!--abc--></body></html>',t);
				doHTMLParseTest('<!--abc--><html><body></body></html>',t);
				doHTMLParseTest("<html><head><script>\nvar i = 1;\n<\/script></head></html>",t);
				doHTMLParseTest("<html><head><script><\/script></head></html>",t);
				doHTMLParseTest('<!-- <abc>  --><html><body></body></html>',t);
				doHTMLParseTest('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html> <head></head><body></body></html>',t);
				doHTMLParseTest('<html><body> &nbsp; </body></html>',t);
				doHTMLParseTest('<html><body>mm&lt;b\n&gt;cc&lt;/b&gt;kk </body></html>',t);
				doHTMLParseTest('<!DOCTYPE html>\n<html>\n</html>',t);
				doHTMLParseTest('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" \n "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html> <head></head><body></body></html>',t);
			},
			function testCSS(t){
				doHTMLParseTest("<html><head><style>table {\n    font-size : 100%;\n}\n</style></head></html>",t);
				doHTMLParseTest('<html>\n<head>\n<style type="text/css">\n@import \"Common.css\";\n@import \"Common.css\";\n</style>\n</head>\n</html>',t);
			},
			function testImport(t){
				doHTMLParseTest("<head><title>Sample1</title> <style type=\"text/css\"> @import \"themes/sketch/sketch.css\"; @import \"lib/dojo/dojo/resources/dojo.css\";</style></head><body></body>",t);
				
			},
			function testFragment(t){
				doHTMLParseTest('<div>abc</div>',t,true);
			},
			function testError(t){
				doHTMLErrorParseTest("<html dd=\"></html>",["Unclosed string."],t);
				doHTMLErrorParseTest("<span aa:",["Missing '>'.","Missing '>'."],t);

			}

]);