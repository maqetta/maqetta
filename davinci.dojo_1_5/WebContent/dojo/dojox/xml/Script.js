dojo.provide("dojox.xml.Script");
dojo.require("dojo.parser");
dojo.require("dojox.xml.widgetParser");

dojo.declare("dojox.xml.Script", null, {
	constructor: function(props, node){
		dojo.parser.instantiate(
			dojox.xml.widgetParser._processScript(node)
		);
	}
});
