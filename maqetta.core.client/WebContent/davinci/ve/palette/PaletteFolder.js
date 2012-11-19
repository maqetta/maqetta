define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dojo/dom-class",
	"dojo/fx",
	"davinci/Runtime",
	"davinci/ve/metadata"
], function(declare, _WidgetBase, domClass, fx, Runtime, Metadata){

return declare("davinci.ve.palette.PaletteFolder", _WidgetBase, {

	icon: "",
	displayName: "",
	paletteId: "",
	palette: null,
	// pointer to preset to which this PaletteFolder belongs
	preset: null,
	// id of preset for which this PaletteFolder object will be included
	presetId: null,
	presetClassName: null,	// Only used for debugging purposes

	buildRendering: function(){
		this.palette = dijit.byId(this.paletteId);
		var div = this.domNode = this.palette.folderTemplate.cloneNode(true);
		if(this.presetClassName){	// Only used for debugging purposes
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
	 * within which the given paletteItem belongs.
	 * @param children {array} Array of children for current palette (mostly PaletteFolder and PaletteItem)
	 * @param startIndex {number} Index into children for first child within palette item group
	 * @returns { endIndex:{number}, selectedIndex:{number} } 
	 */
	_paletteItemGroupInfo: function(children, startIndex){
		var obj = {};
		var idx = startIndex;
		var child = children[idx];
		var paletteItemGroup = child._paletteItemGroup;
		do{
			//FIXME: temporarily pick the first one
			if(idx == startIndex){
				obj.selectedIndex = idx;
			}
			idx++;
			if(idx >= children.length){
				break;
			}
			child = children[idx];
		}while(child.declaredClass == "davinci.ve.palette.PaletteItem" && child._paletteItemGroup === paletteItemGroup);
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
		var presetClassName = comptype ? this.palette._presetClassNamePrefix + comptype : null;	// Only used for debugging purposes
		
		var children = this.palette.getChildren();
		for(var i = 0, len = children.length; i < len; ){
			var child = children[i];
			// If we have reached the current PaletteFolder...
			if(child == this){
				// Loop through subsequent children and process all PaletteItems
				// until reaching the next PaletteFolder (or end of list)
				for(var j = i + 1; j < len; ){
					child = children[j];
					if(child.declaredClass != "davinci.ve.palette.PaletteItem"){
						// Reached next PaletteFolder
						break;
					}
					var obj = this._paletteItemGroupInfo(children, j);
					for(var k=j; k <= obj.endIndex; k++){
						child = children[k];
						// Decide whether the given PaletteItem should be visible
						// given the current preset ('mobile', 'desktop', 'sketchhifi', or 'sketchlofi')
						var descriptor = Metadata.getWidgetDescriptorForType(child.type);
						var collectionId = descriptor && descriptor.collection;
						var show = false;
						if(child.preset && child.preset.collections){
							var collections = child.preset.collections;
							for(var co=0; co < collections.length; co++){
								var collection = collections[co];
								if(collection.id && collection.id === collectionId){
									show = collection.show;
									break;
								}
							}
						}
						if(k == obj.selectedIndex && show){
							// Toggle visibility depending on whether the PaletteFolder
							// is open or closed
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
				i = j + 1;
			}else{
				// Hide any PaletteItems outside of the current PaletteFolder are visible
				if(child.declaredClass == "davinci.ve.palette.PaletteItem" && dojo.style(child.domNode, "display") != "none"){
					fx.wipeOut({node: child.id, duration: 200}).play();
				}
				i++;
			}
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