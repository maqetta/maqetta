dojo.provide("davinci.workbench.ViewLite");
 
dojo.require("davinci.workbench._ToolbaredContainer"); //FIXME: should not be required here?
dojo.require("davinci.ve.States");
dojo.require("davinci.workbench.WidgetLite");

dojo.declare("davinci.workbench.ViewLite", [davinci.workbench.WidgetLite], {
	/* selected editor */
	_editor : null,
	/* selected widget */
	_widget : null,
	/* selected sub widget */
	_subWidget : null,

	constructor: function(params, srcNodeRef){
    	this.viewExt=params.view;
    	this.subscriptions=[];
    	this.publishing={};
    	
    	dojo.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, this._editorSelected));
		dojo.subscribe("/davinci/ui/widgetSelected", dojo.hitch(this, this._widgetSelectionChanged));
		//dojo.subscribe("/davinci/ui/selectionPropertiesChange", dojo.hitch(this, this._selectionChanged));
	},
	

	
	_selectionChanged : function (changeEvent){
		if(	!this._editor )
			return;
		this._setWidgetAttr(changeEvent)
		//if(this._setWidgetAttr(changeEvent)) need this for undo redo
			if(this.onWidgetSelectionChange)
				this.onWidgetSelectionChange(changeEvent);
	},
	_widgetSelectionChanged : function (changeEvent){
		if(	!this._editor )
			return;
		var widget=changeEvent[0];
		if(this._widget == widget && this._subwidget==widget.subwidget)
			return false;
		this._widget = widget;
		this._subwidget = widget && widget.subwidget;
		if(this.onWidgetSelectionChange)
				this.onWidgetSelectionChange();
	},
	_editorSelected : function(editorChange){
		
		this._editor = editorChange.editor;
		
		if(this.onEditorSelected)
			this.onEditorSelected(this._editor);
	 },	
	
	_setWidgetAttr : function(widget){
		if(this._widget == widget.widget && this._subwidget==widget.subwidget)
			return false;
		this._widget = widget.widget;
		this._subwidget = widget.subwidget;
		return true;
		
	},
	subscribe: function(topic,func){
		var isStatesSubscription = topic.indexOf("/davinci/states") == 0;
		var subscription = isStatesSubscription ? davinci.states.subscribe(topic,this,func) : dojo.subscribe(topic,this,func);
		this.subscriptions.push(subscription);
	},
	
	
	publish: function (topic,data){
		this.publishing[topic]=true;
		try {
			dojo.publish(topic,data);
		} catch(e) {
			console.error(e);
		}
		delete this.publishing[topic];
		
	},
	
	destroy: function(){
		dojo.forEach(this.subscriptions, function(item) {
			var topic = item[0];
			var isStatesSubscription = topic.indexOf("/davinci/states") == 0;
			if (isStatesSubscription) {
				davinci.states.unsubscribe(item);
			} else {
				dojo.unsubscribe(item);
			}
		});
		delete this.subscriptions;
	},
	
	_getViewActions : function(){
		var viewID=this.toolbarID || this.viewExt.id;
		
		var viewActions=[];
		var extensions = davinci.Runtime.getExtensions('davinci.viewActions', function(ext){
			if (viewID==ext.viewContribution.targetID)
			{
				viewActions.push(ext.viewContribution);
				return true;
			}
				
		});
		return viewActions;
        
	}
});
