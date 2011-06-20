dojo.provide("davinci.ui.DownloadSelected");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.MenuItem");
dojo.require("dijit.Menu");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ComboBox");

dojo.require("davinci.ui.Download");

dojo.declare("davinci.ui.DownloadSelected",   [davinci.ui.Download], {
	
	buildRendering : function(){
		this.inherited(arguments);
		this._files=davinci.ui.Resource.getSelectedResources();
		var uiArray = ["<div class='downloadSelectedHeader'>Selected Files</div>"];
		uiArray.push("<div class='downloadSelectedList'>");
		if(!this._files){
			uiArray.push("<b>No files selected!</b>");
			this._files = [];
			dojo.attr(this._okButton, "disabled", "true");
			
		}
			
		for(var i=0;i<this._files.length;i++){
			uiArray.push(this._files[i].getPath() + "<br>");
			
		}
		uiArray.push("</div><br><br>");
		var html =  uiArray.join("");
		dojo.place(html, this._selectionDiv);
	
		
	},
	_getResources : function(){
		var list = [];
		
		for(var i=0;i<this._files.length;i++){
			list.push(this._files[i].getPath());
			
		}
		var nodeList = dojo.query("[libItemCheck]", this.domNode );
		for(var i =0;i<nodeList.length;i++){
			var element = parseInt(dojo.attr(nodeList[i], "libItemCheck"));
			var value = dojo.attr(nodeList[i], "checked");
			if(value){
				var lib = this._userLibs[element];
				var root = this._getLibRoot(lib['id'], lib['version']);
				for(var i=0;i<list.length;i++){
					// ensure we dont add duplicate if the user selected a library
					if(list[i]==root) continue;
					
				}
				list.push(root);
			}
		}
		
		return list;
	}
	

});