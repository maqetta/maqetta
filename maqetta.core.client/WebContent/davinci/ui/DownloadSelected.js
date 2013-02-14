define(["dojo/_base/declare",
        "./Download",
        "./Resource",
        "dojo/i18n!./nls/ui",
        "dojo/text!./templates/downloadSelected.html"
],function(declare, Download, ResourceUI, uiNLS, templateString){

	return declare([Download], {
		templateString: templateString,

		_buildUITable: function(){
			this._files = ResourceUI.getSelectedResources();
			var uiArray = ["<div class='downloadSelectedHeader'>" + uiNLS.selectedFiles + "</div>",
			               "<div class='downloadSelectedList'>"];
			if(!this._files){
				uiArray.push("<b>" + uiNLS.noFilesSelected + "</b>");
				this._files = [];
				dojo.attr(this._okButton, "disabled", "true");
			}

			uiArray = uiArray.concat(this._files.map(function(file) {
				return file.getPath() + "<br>";
			}));
			uiArray.push("</div><br><br>");
			dojo.place(uiArray.join(""), this._selectionDiv);
		},

		_getResources: function(){
			return this._files.map(function(item){ return item.getPath();});
		},

		_getLibs: function(){
			return [];
		}
	});
});