dojo.provide("davinci.html.ui.CSSEditor");
dojo.require("davinci.ui.ModelEditor");
dojo.require("davinci.html.CSSModel");
dojo.require("davinci.html.ui.CSSOutline");
dojo.require("davinci.model.Factory");


dojo.declare("davinci.html.ui.CSSEditor", davinci.ui.ModelEditor, {
	

	
	constructor : function (element) {
		this.cssFile=davinci.model.Factory.newCSS();
		this.model=this.cssFile;
	},
	destroy : function (){
		this.cssFile.close();
		this.inherited(arguments);
		
		
	},
	getOutline : function ()
	{
		if (!this.outline)
			this.outline=new davinci.html.ui.CSSOutline(this.model);
		return this.outline;
	},
	
	getDefaultContent : function ()
	{
		return	"";
	},
	
	getContext : function ()
	{
		if (!this.context)
			this.context=new davinci.html.CSSEditorContext(this);
		return this.context;
	}

});
dojo.declare("davinci.html.CSSEditorContext", null, {
	  constructor : function (editor) {
	this.editor=editor;
	this.connects=[];
	this.subscriptions=[];
	this.subscriptions.push(dojo.subscribe("/davinci/ui/selectionChanged",this,this._selection));

	},
	_selection : function (selection)
	{
		if (selection[0] && selection[0].model)
		{
			var model=selection[0].model;
			var cssModel;
			
			if (model.elementType.substring(0,3)=='CSS')
			{
				var rule=model.getCSSRule();
				var fire = rule !=this.selectedRule;
				if (rule)
				{
					this.selectedWidget=new davinci.html.CSSEditorWidget(this);
				}
				else
					this.selectedWidget=null;
				this.selectedRule=rule;
				if (fire )
				{
				 
				  this.onSelectionChange();
				}
			}
				

		}
	},
	getSelection : function()
	{
//		var model = this.editor.getSelection();
		if (this.selectedWidget)
		{
			return [this.selectedWidget];
		}
 	return [];
	},
	onSelectionChange : function()
	{
	}
});

dojo.declare("davinci.html.CSSEditorWidget", null, {
	  constructor : function (context) {
	this.context=context;
	},
	getValues : function ()
	{
		if (!this.values)
		{
			this.values={};
			var rule=this.context.selectedRule;
			for (var i=0; i<rule.properties.length; i++)
			{
				var property=rule.properties[i];
				this.values[property.name]=property.value;
			}
		}
		return this.values;
	}
});

