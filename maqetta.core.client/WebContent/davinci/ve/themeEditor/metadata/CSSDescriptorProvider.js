// XXX This doesn't seem to be used anywhere

define(["dojo/_base/declare"], function(declare) {

	return declare("davinci.ve.themeEditor.metadata.CSSDescriptorProvider", null, {

		module: "davinci.libs",
		path: "css3/css.json",
		
		constructor: function(args){
			dojo.mixin(this, args);
		},

		getDescriptor: function(){
			if(!this._descriptor){
				var descriptor = undefined;
				dojo.xhrGet({
					url: "" + dojo.moduleUrl(this.module, this.path),
					handleAs: "json",
					sync: true,
					load: function(result){descriptor = result;}
				});
				this._descriptor = descriptor;
			}
			return this._descriptor;
		}

	});

});