dojo.provide("davinci.ui.widgets.OpenFileDialog");
	
dojo.require("davinci.ui.Panel");
dojo.require("davinci.resource");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");

//
//  usage:
//var dialog=new davinci.ui.widgets.OpenFileDialog(
//		   {fileTypes:"html",onSelect:function(selectedResource){}});
//


dojo.declare("davinci.ui.widgets.OpenFileDialog",null,{
	
	constructor : function (parms)
	{
	      this.filter=new davinci.resource.FileTypeFilter(parms.fileTypes || "*");
	      dojo.mixin(this, parms);
	      davinci.ui.widgets.OpenFileDialog.filter=this.filter;
	},
	
	show : function(){
	
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
			var data={
					file  : null
					
			};
			davinci.ui.Panel.openDialog( {
					definition : [
					              {
					                  type: "tree",
//					                  label: "Select File",
					                  data: "file",
					                  model: davinci.resource,
					                  filters: "davinci.ui.widgets.OpenFileDialog.filter"
					                }						],
					data:data,
					buttonLabel : langObj.open,
					onOK:	dojo.hitch(this,function ()
					{
						debugger;
						this.onSelect(data.file);
					}),
					title:langObj.openFile
			});
		}
});