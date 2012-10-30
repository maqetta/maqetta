dojo.provide("test.module");

try{
	dojo.require("test.jsparse");
	dojo.require("test.format");
	dojo.require("test.htmlparse");
//	dojo.require("test.htmlModify");
	dojo.require("test.cssparse");
	dojo.require("test.cssQuery");
}catch(e){
	doh.debug(e);
}
