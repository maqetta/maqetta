dojo.provide("davinci.ui.TextEditor");

dojo.require("davinci.ui.Editor");


dojo.declare("davinci.ui.TextEditor", davinci.ui.Editor, {
	
 constructor : function (element) {
	this.subscriptions=[];
	this._handles=[];

},

isActiveEditor : function(){
	
	return  davinci.Runtime.currentEditor == this;
	
},


supports : function (something)
{
	return false;
},

handleChange: function (text)
{
	
	if (this.editorContainer)
		this.editorContainer.setDirty(true);
	this.isDirty=true;
	this.lastModifiedTime=new Date().getTime();

},

_onKey : function(e)
{
	 davinci.Workbench.currentContext=this.editorID;
	return davinci.Workbench.handleKey(e);
},
subscribe : function(topic,func)
{
	this.subscriptions.push(dojo.subscribe(topic,this,func));
},

destroy : function ()
{
	this.inherited(arguments);
	dojo.forEach(this.subscriptions,
			function(each){dojo.unsubscribe(each);});
	dojo.forEach(this._handles,
			function(each){dojo.disconnect(each);});
},

getDefaultContent : function ()
{
	return null;
},


getErrors : function ()
{
	return [];
},

save : function ()
{
	var text= this.getText();
	if (this.resourceFile)
	{
		this.resourceFile.clearMarkers();
		var errors=this.getErrors();
		for (var i=0;i<errors.length;i++)
		{
			var markerType;
			switch (errors[i].id)
			{
			case "(error)": markerType="error"; break;
			case "(warning)": markerType="warning"; break;
				
			}
			if (markerType)
			{
				this.resourceFile.addMarker(markerType,errors[i].line+1,errors[i].reason);
			}
		}
		this.resourceFile.setContents(text);
		if (this.editorContainer)
			this.editorContainer.setDirty(false);
		this.isDirty=false;
		this.lastModifiedTime=0;
	}
},


supports : function(something){
	
	return false;
},
_connect : function(widget,widgetFunction, thisFunction)
{
	this._handles.push(dojo.connect(widget,widgetFunction,this,thisFunction));
}
});
