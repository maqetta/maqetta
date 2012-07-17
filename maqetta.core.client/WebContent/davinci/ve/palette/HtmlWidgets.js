define([
	"dojo/_base/declare",
	"davinci/workbench/ViewPart",
	"davinci/ve/palette/Palette"
], function(declare, ViewPart, Palette){

return declare("davinci.ve.palette.HtmlWidgets", ViewPart, {
	constructor: function(params, srcNodeRef){
		dojo.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, this._editorSelected));
	},

	_editorSelected : function (editorChange){
		if( editorChange.editor &&  editorChange.editor.supports("palette")){
			this.setContext( [ editorChange.editor.getContext()]);	
			dojo.removeClass(this.palette.domNode, "dijitHidden");
		}else{
			// scroll back to the top of the palette before hiding
			this.palette.domNode.scrollTop = 0;
			dojo.addClass(this.palette.domNode, "dijitHidden");
		}
	},

	postCreate: function(){
		this.inherited(arguments);
		this.palette = new Palette();
		this.palette.descriptors = "dijit,dojox,html,OpenAjax"; // FIXME: parameterize this in plugin data?
		this.setContent(this.palette);
		
		this.palette._loadPalette();
		dojo.addClass(this.palette.domNode, "dijitHidden");
		
	},

	setContext: function(context){		
		this.palette.setContext(context[0]);
	}
});
});

