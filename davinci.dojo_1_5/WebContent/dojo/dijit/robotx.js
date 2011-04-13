dojo.provide("dijit.robotx");
dojo.require("dijit.robot");
dojo.require("dojo.robotx");
dojo.experimental("dijit.robotx");
(function(){
var __updateDocument = doh.robot._updateDocument;

dojo.mixin(doh.robot,{
	_updateDocument: function(){
		__updateDocument();
		var win = dojo.global;
		if(win["dijit"]){
			dijit = win.dijit;
		}
	}
});

})();
