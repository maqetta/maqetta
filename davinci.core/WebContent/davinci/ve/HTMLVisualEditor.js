dojo.provide("davinci.ve.HTMLVisualEditor");
 
dojo.require("dijit.layout.TabContainer");
dojo.require("davinci.html.ui.HTMLEditor");
dojo.require("davinci.ve.VisualEditor");
dojo.require("davinci.workbench._ToolbaredContainer");
dojo.require("davinci.commands.CommandStack");
//dojo.require("davinci.ve.utils.URLResolver");
//dojo.require("davinci.ve.utils.URLRewrite")
//dojo.require("davinci.ve.commands.StyleCommand");

dojo.declare("davinci.ve.HTMLVisualEditor", davinci.ui.ModelEditor, {
	   
      _handles : [],


	  constructor: function (element) {
			this._commandStack = new davinci.commands.CommandStack(this);
		
				var tabs = new dijit.layout.TabContainer( {
					region: 'center',
					controllerWidget: "dijit.layout.TabController" // Avoid default ScrollingTabController because of strange drawing behavior on initialization
				}, element);
				this.domNode = tabs.domNode;
						
				var tab = new davinci.workbench._ToolbaredContainer( {
					title: "Design",
					closable: false
				});
		    
				var cp = new dijit.layout.ContentPane({});
				tab.setContent(cp);
		
				tabs.addChild(tab);
		
				tab.editor=this.visualEditor=new davinci.ve.VisualEditor(cp.domNode);
				this.currentEditor=this.visualEditor;
				this.currentEditor._commandStack=this._commandStack;
				
				tab = new dijit.layout.ContentPane( {
					title : "Source",
					closable : false,
					"class": "dvHTMLVisualEditorSourcePane"
				});
		
				tabs.addChild(tab);
		
				tab.editor=this.htmlEditor=new davinci.html.ui.HTMLEditor(tab.domNode);
				this.model=this.htmlEditor.model;
		
				tabs.startup();
				tabs.resize(); // kludge: forces primary tab to display	
		
				/*this.handle =*/ dojo.connect(tabs,"selectChild",this,function(child){
					var newEditor = child.editor;
					if (newEditor){
						var oldEditor = davinci.Runtime.currentEditor;
						davinci.Runtime.currentEditor = this.currentEditor = newEditor;
						dojo.publish("/davinci/ui/editorSelected",[{editor:newEditor, oldEditor:oldEditor}]);
						if (newEditor==this.htmlEditor)
						{
		//FIXME: this.fileName begins with '/'?
		//if(this.fileName.charAt(0)=="/") this.fileName = this.fileName.substring(1);
							this.htmlEditor.setContent(
								this.fileName,
								this.visualEditor.context.getSource());
						}else{
							this.visualEditor.setContent(this.fileName, this.htmlEditor.model);
						}			
					}
					focus();
				});	
				
				this._connect(this.visualEditor,"onContentChange", "_srcChanged");
				this._connect(this.htmlEditor,"handleChange", "_srcChanged");
				dojo.subscribe("/davinci/ui/styleValuesChange", dojo.hitch(this, this._stylePropertiesChange));
				dojo.subscribe("/davinci/ui/widgetPropertiesChanges",  dojo.hitch(this, this._objectPropertiesChange));
	},
	_stylePropertiesChange : function(event){
		
		
		
	},
	supports : function (something){
		return (something == "palette" || something =="properties" || something =="style" || something == "states" || something=="inline-style" || something=="MultiPropTarget");
	},

	
	focus : function(){
		
		if(this.currentEditor==this.visualEditor)
			this.visualEditor.onContentChange();
		
	},
	
	_objectPropertiesChange : function (event){
		if(!this.isActiveEditor() && (davinci.Runtime.currentEditor!=this.visualEditor))
			return;
		var context = this.getContext();
		var command = event.command;	
		command.setContext(context);
		context.getCommandStack().execute(command);
		
		if(command._newId){
			var widget = davinci.ve.widget.byId(command._newId, context.getDocument());
			context.select(widget);
		}else{
			var selection = context.getSelection();
			var widget = (selection.length > 0 ? selection[selection.length - 1] : undefined);
			if(selection.length > 1){
				context.select(widget);
			}
		}
		this._srcChanged();
	},
	
	
	_srcChanged : function(){
		this.isDirty=true;
		this.lastModifiedTime=new Date().getTime();
		if (this.editorContainer)
			this.editorContainer.setDirty(true);
	},
	
	getContext : function(){
		
		return this.visualEditor.context;
	},
	
	
	
	getOutline : function (){
		return this.currentEditor.getOutline();
	},
	
	getPropertiesView : function ()
	{
		return this.currentEditor.getPropertiesView();
	},
	
	
	setContent : function (filename, content) {
		this.fileName=filename;
		this.htmlEditor.setContent(filename,content);
		this.visualEditor.setContent(filename,this.htmlEditor.model);
	},
	
	getDefaultContent : function ()
	{
		return this.visualEditor.getDefaultContent();
	},

	selectModel : function (selection){
		
		if(!this.currentEditor)
			return;
		
		if (this.currentEditor==this.htmlEditor)
		{
			if (selection && selection.length>0)
			this.currentEditor.selectModel(selection[0]);
		}
		else if (this.currentEditor==this.visualEditor)
		{
			if (selection && selection.length>0)
			{
				var widget=selection[0].model;
//TODO: should be a better check for if this is actually a widget				
				if (widget && typeof widget.dojoAttachPoint != "undefined")
					this.visualEditor.context.select(widget);
			}
		}
	},
	save : function ()
	{
		this.inherited(arguments);
		this.visualEditor.saved();
	},
	
	destroy : function (){
		
		this.inherited(arguments);
		this.visualEditor.destroy();
		this.htmlEditor.destroy();
	},
	
	getText : function () {
		if (this.currentEditor===this.htmlEditor)
			return this.htmlEditor.getText();
		return this.visualEditor.context.getSource();
	}/*,
	destroy : function () {
		this.inherited(arguments);
		dojo.disconnect(this.handle);
		delete this.handle;
		delete this.domNode;
	}
*/
});
