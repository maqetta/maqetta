define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dojo/fx",
], function(declare, _WidgetBase, fx){

return declare("davinci.ve.palette.PaletteFolder", _WidgetBase, {

	icon: "",
	displayName: "",
	paletteId: "",
	palette: null,

	buildRendering: function(){
		this.palette = dijit.byId(this.paletteId);
		var div = this.domNode = this.palette.folderTemplate.cloneNode(true);
		var a = div.firstChild;
		dojo.attr(a, "tabIndex", "0");
		a.onclick = this.palette.nop; // to avoid firing the onbeforeunload event (dojo.event.connect doesn't work for this purpose)
		var img = a.firstChild;
		img.src = this.icon;
		a.appendChild(dojo.doc.createTextNode(this.displayName));
//		dojo.setSelectable(this.domNode, false);
	},

	postCreate: function(){
		this.connect(this.domNode, "onmouseover", "folderMouseOverHandler");
		this.connect(this.domNode, "onmouseout", "folderMouseOutHandler");
		this.connect(this.domNode, "onclick", "folderClickHandler");
	},
	
	startup: function(){
	},
	
	isFocusable: function(){
		return true;
	},
	
	focus: function(){
		dijit.focus(this.domNode);
	},

	folderClickHandler: function(evt){
		var children = this.palette.getChildren();
		for(var i = 0, len = children.length; i < len; i++){
			var child = children[i];
			if(child != this){
				continue;
			}
			for(var j = i + 1; j < len; j++){
				child = children[j];
				if(child.declaredClass != "davinci.ve.palette.PaletteItem"){
					break;
				}
				if(dojo.style(child.domNode, "display") == "none"){
					fx.wipeIn({node: child.id, duration: 200}).play();
				}else{
					fx.wipeOut({node: child.id, duration: 200}).play();
				}
			}
			break;
		}
		return false;
	},

	folderMouseOverHandler: function(evt){
		dojo.removeClass(this.domNode, "dojoyPaletteFolderLow");
		dojo.addClass(this.domNode, "dojoyPaletteFolderHi");
	},

	folderMouseOutHandler: function(evt){
		dojo.removeClass(this.domNode, "dojoyPaletteFolderHi");
		dojo.addClass(this.domNode, "dojoyPaletteFolderLow");
	}
	
});
});