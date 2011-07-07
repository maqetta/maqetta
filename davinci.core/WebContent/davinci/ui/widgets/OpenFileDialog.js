dojo.provide("davinci.ui.widgets.OpenFileDialog");
	
dojo.require("davinci.ui.Panel");
dojo.require("davinci.resource");

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
	
			var data={
					file  : null
					
			};
			davinci.ui.Panel.openDialog( {
					definition : [
					              {
					                  type: "tree",
//					                  label: "Select File",
					                  data: "file",
					                  model: "davinci.ui.widgets.ResourceTreeModel",
					                  filters: "davinci.ui.widgets.OpenFileDialog.filter"
					                }						],
					data:data,
					buttonLabel : 'Open',
					onOK:	dojo.hitch(this,function ()
					{
						debugger;
						this.onSelect(data.file);
					}),
					title:"Open File"
			});
		}
});