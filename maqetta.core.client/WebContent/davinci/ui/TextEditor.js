define(["dojo/_base/declare", "./Editor", "../Runtime"], function(declare, Editor, Runtime) {

return declare(Editor, {
	
	constructor: function (element, fileName) {
		this.subscriptions=[];
		this._handles=[];
	},
	
	isActiveEditor: function() {
		return Runtime.currentEditor == this;
	},

	supports: function (something) {
		return false;
	},
	
	handleChange: function (text) {
		if (this.editorContainer) {
			this.editorContainer.setDirty(true);
		}
		this.isDirty = true;
		this.lastModifiedTime = Date.now();
	},
	
	_onKey: function(e) {
		davinci.Workbench.currentContext = this.editorID;
		return davinci.Workbench.handleKey(e);
	},

	subscribe: function(topic,func) {
		this.subscriptions.push(dojo.subscribe(topic,this,func));
	},
	
	destroy: function () {
		this.inherited(arguments);
		this.subscriptions.forEach(dojo.unsubscribe);
		this._handles.forEach(dojo.disconnect);
	},
	
	getDefaultContent: function () {
		return null;
	},
	
	
	getErrors: function () {
		return [];
	},
	
	save: function (isWorkingCopy) {
		var text = this.getText();
		if (this.resourceFile) {
			this.resourceFile.clearMarkers();
			var errors=this.getErrors();
			for (var i=0;i<errors.length;i++)
			{
				var markerType;
				switch (errors[i].id) {
				case "(error)": markerType="error"; break;
				case "(warning)": markerType="warning"; break;
				}
				if (markerType) {
					this.resourceFile.addMarker(markerType,errors[i].line+1,errors[i].reason);
				}
			}
			this.resourceFile.setContents(text,isWorkingCopy);
			if (this.editorContainer) {
				this.editorContainer.setDirty(isWorkingCopy);
			}
			this.isDirty = false;
			this.lastModifiedTime = 0;
		}
	},
	
	
	supports: function(something) {
		return false;
	},
	
	_connect: function(widget,widgetFunction, thisFunction) {
		this._handles.push(dojo.connect(widget,widgetFunction,this,thisFunction));
	}
});
});
