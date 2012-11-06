define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dojo/dom-class",
	"dojo/fx",
	"davinci/Runtime"
], function(declare, _WidgetBase, domClass, fx, Runtime){

return declare("davinci.ve.palette.PaletteFolder", _WidgetBase, {

	icon: "",
	displayName: "",
	paletteId: "",
	palette: null,
	// name of preset for which this PaletteFolder object will be included
	preset: null,
	// css class for the preset to which this item belongs (preset=desktop, mobile, sketchhifi, sketchlofi)
	// higher-level logic will hide all folders and items that don't belong to current preset
	presetClassName: null,

	buildRendering: function(){
		this.palette = dijit.byId(this.paletteId);
		var div = this.domNode = this.palette.folderTemplate.cloneNode(true);
		if(this.presetClassName){
			domClass.add(div, this.presetClassName);
		}
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

	addChild: function(node){
		var children = this.palette.getChildren();
		for(var i = 0, len = children.length; i < len; i++){
			var child = children[i];
			if(child != this){
				continue;
			}
			this.palette.addChild(node,i+1);
			
			return true;
		}
		return false;
	
	},
	
	/**
	 * Find the currently selected PaletteItem object with the palette item group
	 * within which the given palItem belongs.
	 * @param children {array} Array of children for current palette (mostly PaletteFolder and PaletteItem)
	 * @param startIndex {number} Index into children for first child within palette item group
	 * @returns { endIndex:{number}, selectedIndex:{number} } 
	 */
	_paletteItemGroupInfo: function(children, startIndex){
		var obj = {};
		var idx = startIndex;
		var child = children[idx];
		var paletteItemGroup = child.paletteItemGroup;
		do{
			//FIXME: temporary
			if(idx == startIndex){
				obj.selectedIndex = idx;
			}
			idx++;
			if(idx >= children.length){
				break;
			}
			child = children[idx];
		}while(child.declaredClass == "davinci.ve.palette.PaletteItem" && child.paletteItemGroup === paletteItemGroup);
		obj.endIndex = idx - 1;
		return obj;
	},
	
	folderClickHandler: function(evt){
		
		// Determine which preset applies to the current editor
		if(!Runtime.currentEditor || Runtime.currentEditor.declaredClass != "davinci.ve.PageEditor" ||
				!Runtime.currentEditor.getContext){
			return;
		}
		var context = Runtime.currentEditor.getContext();
		var comptype = context.getCompType();
		var presetClassName = comptype ? this.palette._presetClassNamePrefix + comptype : null;
		
		var children = this.palette.getChildren();
		for(var i = 0, len = children.length; i < len; i++){
			var child = children[i];
			if(child != this){
				continue;
			}
/*
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
*/
			for(var j = i + 1; j < len; ){
				child = children[j];
				if(child.declaredClass != "davinci.ve.palette.PaletteItem"){
					break;
				}
				var obj = this._paletteItemGroupInfo(children, j);
				for(var k=j; k <= obj.endIndex; k++){
					child = children[k];
					if(k == obj.selectedIndex){
						if(dojo.style(child.domNode, "display") == "none"){
							fx.wipeIn({node: child.id, duration: 200}).play();
						}else{
							fx.wipeOut({node: child.id, duration: 200}).play();
						}
					}else{
						dojo.style(child.domNode, "display", "none");
					}
				}
				j = k;
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