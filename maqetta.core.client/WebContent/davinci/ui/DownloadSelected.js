define(["dojo/_base/declare",
        "./Download",
        "./Resource",
        "dojo/i18n!./nls/ui"
],function(declare, Download, ResourceUI, uiNLS){

	return declare([Download], {
		buildRendering: function(){
			this.inherited(arguments);
			this._files = ResourceUI.getSelectedResources();
			var uiArray = ["<div class='downloadSelectedHeader'>" + uiNLS.selectedFiles + "</div>",
			               "<div class='downloadSelectedList'>"];
			if(!this._files){
				uiArray.push("<b>" + uiNLS.noFilesSelected + "</b>");
				this._files = [];
				dojo.attr(this._okButton, "disabled", "true");
			}
				
			for(var i=0;i<this._files.length;i++){
				uiArray.push(this._files[i].getPath() + "<br>");
			}
			uiArray.push("</div><br><br>");
			var html = uiArray.join("");
			dojo.place(html, this._selectionDiv);
		},

		_getResources: function(){
			return {
				userFiles: this._files.map(function(item){ return item.getPath();}),
				userLibs: this._getLibs()
			};
		}
	});
});