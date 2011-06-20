dojo.provide("davinci.review.actions.ViewFileAction");

dojo.require("davinci.actions.Action");

dojo.declare("davinci.review.actions.ViewFileAction",davinci.actions.Action,{
	run: function(context){
		var selection = davinci.Runtime.getSelection();
		if(!selection) return;
		var item = selection[0].resource;
		if(davinci.review.Runtime.getMode()=="reviewPage"){
			davinci.Workbench.openEditor({
				fileName: item,
				content: item.getContents()
			});
		}
		else if(davinci.review.Runtime.getMode()=="designPage"){
			window.open(location.href+"review/"+davinci.Runtime.userName+"/"+item.parent.timeStamp+"/"
					+item.name+"/default");
		}
	},

	shouldShow: function(context){
		return true;
	},
	
	isEnabled: function(context){
		var selection = davinci.Runtime.getSelection();
		if(!selection || selection.length == 0) return false;
		var item = selection[0].resource;
		return item.elementType=="ReviewFile";
	
	}
});