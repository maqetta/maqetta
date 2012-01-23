define([
	"dojo/_base/declare",
	"davinci/workbench/ViewPart",
	"davinci/ve/palette/Palette"
], function(declare, ViewPart, Palette){

return declare("davinci.ve.palette.HtmlWidgets", davinci.workbench.ViewPart, {

	constructor: function(params, srcNodeRef){
		dojo.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, this._editorSelected));
	},
	_editorSelected : function (editorChange){
		
		if( editorChange.editor &&  editorChange.editor.supports("palette")){
			this.setContext( [ editorChange.editor.getContext()]);	
			dojo.removeClass(this.palette.domNode, "dijitHidden");
		}else{
			dojo.addClass(this.palette.domNode, "dijitHidden");
		}
			
	},
	postCreate: function(){
		this.inherited(arguments);
		this.palette = new davinci.ve.palette.Palette();
		this.palette.descriptors = "dijit,dojox,html,OpenAjax"; // FIXME: parameterize this in plugin data?
		this.setContent(this.palette);
		
		this.palette._loadPalette();
		dojo.addClass(this.palette.domNode, "dijitHidden");
		
	},

	setContext: function(context){
	
		
		this.palette.setContext(context[0]);
		var children = this.palette.getChildren();
		
		/* make all folders closed when context changes */
		for (var i = 0; i < children.length; i++) {
			if (children[i] && children[i].declaredClass == "davinci.ve.palette.PaletteItem") {
				dojo.fx.wipeOut({
					node: children[i].id,
					duration: 10
				}).play();
			}
		}
	}
});
});

