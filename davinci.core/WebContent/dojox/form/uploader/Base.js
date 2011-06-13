dojo.provide("dojox.form.uploader.Base");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("dojox.form.uploader.Base", [dijit._Widget, dijit._Templated], {
	//
	// Version: 1.6
	//
	// summary:
	// 		The Base class used for dojox.form.Uploader and dojox.form.uploader.FileList.
	//
	// 	description:
	// 		Should not be used as a standalone. To be mixed in with other classes.
	//

	getForm: function(){
		// summary:
		// 		Finds the parent form of the Uploader, if it exists.
		//
		if(!this.form){
			var n = this.domNode;
			while(n && n.tagName && n !== document.body){
				if(n.tagName.toLowerCase() == "form"){
					this.form = n;
					break;
				}
				n = n.parentNode;
			}
		}
		return this.form // Node;
	},

	getUrl: function(){
		// summary:
		// 		Finds the URL to upload to, whether it be the action in the parent form, this.url or
		// 		this.uploadUrl
		//
		if(this.uploadUrl) this.url = this.uploadUrl;
		if(this.url) return this.url;
		if(this.getForm()) this.url = this.form.action;
		return this.url; // String
	},


	connectForm: function(){
		//console.log("connectForm...", this.url, !!this.uploadUrl, !!this.getForm())

		this.url = this.getUrl();

		if(!this._fcon && !!this.getForm()){
			this._fcon = true;
			this.connect(this.form, "onsubmit", function(evt){
				dojo.stopEvent(evt);
				this.submit(dojo.formToObject(this.form));
			});
			//console.log("----------------form connected:", this.url)
		}
		//console.log("form:", this.form, this.url);
	},

	supports: function(what){
		//	summary:
		// 		Does feature testing for uploader capabilities. (No browser sniffing - yay)
		//
		if(!this._hascache){
			this._hascache = {
				testDiv: dojo.create("div"),
				testInput: dojo.create("input", {type:"file"}),
				xhr:!!window.XMLHttpRequest ? new XMLHttpRequest() : {}
			};
			dojo.style(this._hascache.testDiv, "opacity", .7);
		}
		switch(what){
			case "FormData":
				return !!window.FormData;
			case "sendAsBinary":
				return !!this._hascache.xhr.sendAsBinary;
			case "opacity":
				return dojo.style(this._hascache.testDiv, "opacity") == .7;
			case "multiple":
				if(this.force == "flash" || this.force == "iframe") return false;
				var res = dojo.attr(this._hascache.testInput, "multiple");
				return res===true || res===false; // IE will be undefined
		}
		return false; // Boolean
	},
	getMimeType: function(){
		//	summary:
		//		Returns the mime type that should be used in an HTML5 upload form. Return result
		//		may change as the current use is very generic.
		//
		return "application/octet-stream"; //image/gif
	},
	getFileType: function(/* String */name){
		// summary:
		// 		Gets the extension of a file
		return name.substring(name.lastIndexOf(".")+1).toUpperCase(); // String
	},
	convertBytes: function(bytes){
		// summary:
		// 		Converts bytes. Returns an object with all conversions. The "value" property is
		// 		considered the most likely desired result.
		//
		var kb = Math.round(bytes/1024*100000)/100000;
		var mb = Math.round(bytes/1048576*100000)/100000;
		var gb = Math.round(bytes/1073741824*100000)/100000;
		var value = bytes;
		if(kb>1) value = kb.toFixed(1)+" kb";
		if(mb>1) value = mb.toFixed(1)+" mb";
		if(gb>1) value = gb.toFixed(1)+" gb";
		return {
			kb:kb,
			mb:mb,
			gb:gb,
			bytes:bytes,
			value: value
		}; // Object
	}
});
