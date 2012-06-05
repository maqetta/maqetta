define(["dojo/_base/declare",
        "./Download",
        "./Resource",
        "dojo/i18n!./nls/ui",
        "dojo/i18n!dijit/nls/common"
   ],function(declare,  Download, ResourceUI, uiNLS, commonNLS){
return declare("davinci.ui.DownloadSelected", [Download], {
		buildRendering: function(){
			var langObj = uiNLS;
			this.inherited(arguments);
			this._files = ResourceUI.getSelectedResources();
			var uiArray = ["<div class='downloadSelectedHeader'>"+langObj.selectedFiles+"</div>",
			               "<div class='downloadSelectedList'>"];
			if(!this._files){
				uiArray.push("<b>"+langObj.noFilesSelected+"</b>");
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
			var list = [];
			for(var i=0;i<this._files.length;i++){
				list.push(this._files[i].getPath());
			}
			return {userFiles: list, userLibs: this._getLibs()};
		}
	});
});