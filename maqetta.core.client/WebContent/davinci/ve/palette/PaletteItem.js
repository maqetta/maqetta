define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/event",
	"dojo/query",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dijit/focus",
	"dijit/_WidgetBase",
	"dojo/dom-class",
	"dijit/popup",
	"dijit/Tooltip",
	"dijit/TooltipDialog",
	"davinci/ve/tools/CreateTool",
	"davinci/ui/dnd/DragManager",
	"davinci/ve/utils/GeomUtils",
	"davinci/ve/metadata",
	"dojo/i18n!davinci/ve/nls/common"
], function(
	declare,
	On,
	Event,
	Query,
	domConstruct,
	domGeom,
	FocusUtils,
	_WidgetBase,
	domClass,
	Popup,
	Tooltip,
	TooltipDialog,
	CreateTool,
	DragManager,
	GeomUtils,
	Metadata,
	commonNls
){

return declare("davinci.ve.palette.PaletteItem", _WidgetBase,{

	icon: "",
	displayName: "",
	name: "",
	paletteId: "",
	type: "",
	data: null,
	tool: "",
	palette: null,
	category: "",
	template: '<a href="javascript:void(0)">'+
					'<span class="paletteItemSelectionContainer"></span>'+
					'<span class="paletteItemNormalContainer">'+
						'<span class="paletteItemImageContainer">'+
							'<img class="paletteItemImage" border="0"/>'+
						'</span>'+
						'<span class="paletteItemLabelContainer">'+
							'<span class="paletteItemLabel"></span>'+
						'</span>'+
					'</span>'+
				'</a>',
	selectedWidgetTemplate: '<span class="paletteItemSelectionContent">'+
					'<span class="paletteItemSelectedStrip paletteItemSelectedStripV paletteItemSelectedStripL"></span>'+
					'<span class="paletteItemSelectedStrip paletteItemSelectedStripV paletteItemSelectedStripR"></span>'+
					'<span class="paletteItemSelectedStrip paletteItemSelectedStripH paletteItemSelectedStripT"></span>'+
					'<span class="paletteItemSelectedStrip paletteItemSelectedStripH paletteItemSelectedStripB"></span>'+
					'<span class="paletteItemSelectedIcon paletteItemSelectedMoreIcon"></span>'+
					'<span class="paletteItemSelectedIcon paletteItemSelectedHelpIcon"></span>'+
				'</span>',
	// pointer to preset to which this PaletteItem belongs
	preset: null,
	// id of preset for which this PaletteItem object will be included
	presetId: null,
	presetClassName:null,	// Only used for debugging purposes
	// All palette items with the same paletteItemGroup will be mutually exclusive in that
	// only one of these palette items will appear in the widget palette at any time.
	// (There is UI where the user can switch among the various palette items with a group.)
	_paletteItemGroup:null,
	// Display name for widget collection for this widget
	_collectionName:null,
	//FIXME: Consolidate?
	_paletteItemMoreConnects:[],
	_paletteItemHelpConnects:[],
	
	buildRendering: function(){
		this.palette = dijit.byId(this.paletteId);
		var div = this.domNode = dojo.create('div', { className: 'dojoyPaletteCommon dojoyPaletteItem' });
		div.innerHTML = this.template;
		div._paletteItem = this;
		if(this.presetClassName){	// Only used for debugging purposes
			domClass.add(div, this.presetClassName);
		}
		var a = div.firstChild;
		dojo.attr(a, "tabIndex", "0");
		a.onclick = this.palette.nop; // to avoid firing the onbeforeunload event (dojo.event.connect doesn't work for this purpose)
		var img = a.querySelector('img');

		img.src = this.icon;
		var labelContainer = a.querySelector('.paletteItemLabelContainer');
		var label = a.querySelector('.paletteItemLabel');
		label.appendChild(dojo.doc.createTextNode(this.displayName));
/*
		a.title = this.displayName + ' (category: ' + this.category + ')';
*/
		this.domNode.componentClassName = this.name; // ex. "davinci.ve.widget.Hello"
		dojo.setSelectable(this.domNode, false);
		/*
		this._hovering = false;
		this._tooltipShowing = false;
		var hoverHandler = function(currentTarget){
			if(this._hovering && !this._tooltipShowing){
				this._tooltipShowing = true;
				this._tooltipDialog = new TooltipDialog({
					style: "width: 300px;",
					content: "<p>I have a mouse leave event handler that will close the dialog."
				});
				Popup.open({
					popup: this._tooltipDialog,
					around: this.domNode
				});
			}else if(!this._hovering && this._tooltipShowing){
				this._tooltipShowing = false;
				Popup.close(this._tooltipDialog);
			}
		}.bind(this);
		On(a, 'mouseover', function(e){
			this._hovering = true;
			setTimeout(function(){
				hoverHandler(e.currentTarget);
			}, 750);
		}.bind(this));
		On(a, 'mouseout', function(e){
			this._hovering = false;
			setTimeout(function(){
				hoverHandler(e.currentTarget);
			}, 10);
		}.bind(this));
		*/
	},

	postCreate: function(){
		this.connect(this.domNode, "onmouseover", "itemMouseOverHandler");
		this.connect(this.domNode, "onmouseout", "itemMouseOutHandler");
		this.connect(this.domNode, "onmousedown", "itemMouseDownHandler");
		this.connect(this.domNode, "onmouseup", "itemMouseUpHandler");
		this.connect(this.domNode, "onkeydown", "itemKeyDownHandler");
	},
	
	startup: function(){
	},
	
	isFocusable: function(){
		return dojo.style(this.domNode, "display") != "none";
	},
	
	focus: function(){
		dijit.focus(this.domNode);
	},

	itemMouseOverHandler: function(e){
		this._mouseover = true;
		var div = this.domNode;
		if(this.palette.selectedItem == this){
			;
		}else{
			this.raised(div);
		}
		setTimeout(function(){
			//FIXME: Need to put up different tooltips if hovering over the ^ or ? icons
			if(this._mouseover){
				if(this._tooltipNode == this.domNode){
					return;
				}else if(this._tooltipNode){
					dijit.hideTooltip(this._tooltipPos);
				}
				this._tooltipNode = this.domNode;
				this._tooltipPos = domGeom.position(this.domNode, true);
				var s = '<div class="paletteTooltip">';
				s += '<div class="paletteTooltipCurrent"><span class="paletteTooltipCurrentWidget">' + this.displayName + '</span> <span class="paletteTooltipCurrentLibrary">(' + this._collectionName + ')</span></div>';
				var paletteItemsSameGroup = this.palette.getPaletteItemsSameGroup(this);
				if(paletteItemsSameGroup.length > 1){
					s += '<div class="paletteTooltipAlternates">' + '<span class="paletteTooltipAlternatesLabel">'+commonNls.alternates+': </span><span class="paletteTooltipAlternatesLibraries">';
					var firstAlternateAlready = false;
					for(var i=0; i<paletteItemsSameGroup.length; i++){
						var paletteItemAlternate = paletteItemsSameGroup[i];
						if(paletteItemAlternate != this){
							if(firstAlternateAlready){
								s += ', ';
							}
							s += paletteItemAlternate._collectionName;
							firstAlternateAlready = true;
						}
					}
					s += '</div>';
					s += '<div class="paletteTooltipNote">'+commonNls.howToChooseAlternate+'</div>';
					s += '</div>';
				}
				dijit.showTooltip(s, this._tooltipPos);
				setTimeout(function(){
					dijit.hideTooltip(this._tooltipPos);
					this._tooltipNode = null;
					this._tooltipPos = null;
				}.bind(this), 5000);
			}
		}.bind(this),750);

	},

	itemMouseOutHandler: function(e){
		this._mouseover = false;
		if(this._tooltipPos){
			dijit.hideTooltip(this._tooltipPos);
			this._tooltipPos = null;
		}
		var div = this.domNode;
		if(this.palette.selectedItem == this){
			this.sunken(div);
		}else{
			this.flat(div);
		}/*
		if(this.tooltip){
			this.tooltip.close();
		}*/
	},

	itemMouseDownHandler: function(e){
		var div = this.domNode;
		this.focus();
		this.sunken(div);
		if(this.palette.selectedItem && this.palette.selectedItem != this){
			this.palette.removeSelectionAll();
			this.flat(this.palette.selectedItem.domNode);
			this.palette.selectedItem = null;
		}
		DragManager.document = this.palette._context.getDocument();
		var frameNode = this.palette._context.frameNode;
		if(frameNode){
			var coords = dojo.coords(frameNode);
			var containerNode = this.palette._context.getContainerNode();
			DragManager.documentX = coords.x - GeomUtils.getScrollLeft(containerNode);
			DragManager.documentY = coords.y - GeomUtils.getScrollTop(containerNode);
		}

		// pre-fetch helper to warm the cache
		Metadata.getHelper(this.type, 'helper');
	},

	/**
	 * Invoked when user clicks on a widget entry (but not to perform drag/drop).
	 * @param {Event} e
	 */
	itemMouseUpHandler: function(e){
		var div= this.domNode;
		if(this.palette.selectedItem == this){
			// User has clicked a second time on same widget.
			// This toggles the widget into "inactive"
			this.palette.removeSelectionAll();
			this.palette.selectedItem.flat(this.palette.selectedItem.domNode);		//FIXME: Trying this out
			this.palette.selectedItem = null;
			this.palette.sunkenItem = null;
			this.palette.flattenAll();
			this.palette._context.setActiveTool(null);
			if(FocusUtils.curNode && FocusUtils.curNode == div && FocusUtils.curNode.blur){
				FocusUtils.curNode.blur();
			}

			return;
		}else if(this.palette.selectedItem && this.palette.selectedItem != this){
			this.palette.removeSelectionAll();
			this.flat(this.palette.selectedItem.domNode);
			this.palette.selectedItem = null;
		}
		this.palette.selectedItem = this;
		this.sunken(div);		//FIXME: Trying this out

		Metadata.getHelper(this.type, 'tool').then(function(ToolCtor) {
			var tool = new (ToolCtor || CreateTool)(dojo.clone(this.data));
			this.palette._context.setActiveTool(tool);
		}.bind(this));

		var clearItem = function(){
			if(this.palette._contextMouseUpHandler){
				this.disconnect(this.palette._contextMouseUpHandler);
				this.palette._contextMouseUpHandler = null;
			}
			if(this.palette._docMouseUpHandler){
				dojo.disconnect(this.palette._docMouseUpHandler);
				this.palette._docMouseUpHandler = null;
			}
			this.palette.removeSelectionAll();
			this.palette.selectedItem = null;
			this.flat(this.domNode);
			this.palette._context.dragMoveCleanup();
		}.bind(this);
		
		// Register mouseup handler on user's doc
		this.palette._contextMouseUpHandler = this.connect(this.palette._context, "onMouseUp", function(e){
			clearItem();
		}.bind(this));
		
		// Register mouseup handler on entire Maqetta application
		// Put the doc-level mouseUp handler in setTimeout so that
		// the current mouseup event (this routine) doesn't trigger
		// the doc-level mouseup handler on the very same event.
		setTimeout(function(){
			// If currentItem has a value and user clicked anywhere in Maq app,
			// then turn off everything registered to happen on currentItem.
			this.palette._docMouseUpHandler = dojo.connect(document, "onmouseup", function(e){
				// See if e.target has this.palette.currentItem.domNode as an ancestor
				var ancestor = false;
				if(this.palette.selectedItem){
					var selectedItemNode = this.palette.selectedItem.domNode;
					var node = e.target;
					while(node && node.tagName != 'BODY'){
						if(node == selectedItemNode){
							ancestor = true;
							break;
						}
						node = node.parentNode;
					}
				}
				if(this.palette.selectedItem && !ancestor){
					clearItem();
					this.palette._context.setActiveTool(null);
				}
			}.bind(this));
		}.bind(this), 0);
	},
	
	/**
	 * Invoked when travelling widget list using arrow keys.
	 * @param {Event} e
	 */
	itemKeyDownHandler: function(e){
		if(e.keyCode != dojo.keys.ENTER){return;}
		if(this.palette.selectedItem){
			this.flat(this.palette.selectedItem.domNode);
			this.palette.selectedItem = null;
		}
		Metadata.getHelper(this.type, 'tool').then(function(ToolCtor) {
			var tool = new (ToolCtor || CreateTool)(dojo.clone(this.data)),
				context = this.palette._context;
			context.setActiveTool(tool);
			tool.create({target: context.getSelection()[0], position: {x:50, y:50}});
			context.setActiveTool(null);			
			context.getContainerNode().focus();  // to enable moving with arrow keys immediately
		});

		// pre-fetch helper
		Metadata.getHelper(this.type, 'helper');
	},

	// sunken => styling for selected items
	// raised => styling for items under mouse but not selected
	// flat => items which are both not selected and not under mouse
	flat: function(div){
		dojo.removeClass(div, "dojoyPaletteItemRaised");
		dojo.removeClass(div, "dojoyPaletteItemSunken");
		dojo.addClass(div, "dojoyPaletteItemFlat");
	},

	raised: function(div){
		dojo.removeClass(div, "dojoyPaletteItemFlat");
		dojo.removeClass(div, "dojoyPaletteItemSunken");
		dojo.addClass(div, "dojoyPaletteItemRaised");
		this.palette.raisedItems.push(this); // Palette.js will "un-raised" in onDragEnd
	},

	sunken: function(div){
		dojo.removeClass(div, "dojoyPaletteItemFlat");
		dojo.removeClass(div, "dojoyPaletteItemRaised");
		dojo.addClass(div, "dojoyPaletteItemSunken");
		this.palette.sunkenItems.push(this); // Palette.js will "un-sunken" in onDragEnd
		this._selectionShowing = true;
		var paletteItemSelectionContainer = Query('.paletteItemSelectionContainer', this.domNode)[0];
		paletteItemSelectionContainer.innerHTML = this.selectedWidgetTemplate;
		var paletteItemSelectedMoreIcon = Query('.paletteItemSelectedMoreIcon', div)[0];
		var paletteItemsSameGroup = this.palette.getPaletteItemsSameGroup(this);
		if(paletteItemsSameGroup.length > 1){
			paletteItemSelectedMoreIcon.style.display = 'inline-block';
			// FIXME: Any leakages here?
			On(paletteItemSelectedMoreIcon, 'mousedown, mouseup', function(e){
				Event.stop(e);	// Prevents mousedown, mouseup from closing selection
			});
			On(paletteItemSelectedMoreIcon, 'click', function(e){
				Event.stop(e);
				var paletteItemMoreContent = domConstruct.create("div", {className:"paletteItemMoreContent"});
				var paletteItemMoreCloseBox = domConstruct.create("span", 
						{className:"paletteItemMoreCloseBox"},
						paletteItemMoreContent);
				//FIXME: localization
				var paletteItemAlternatesLabel = domConstruct.create("div", 
						{className:"paletteItemAlternatesLabel", innerHTML:'Alternate widgets:'},
						paletteItemMoreContent);
				this._paletteItemMoreConnects.push(On(paletteItemMoreCloseBox, 'mousedown, mouseup', function(e){
					Event.stop(e);	// Prevents mousedown, mouseup from closing selection
				}.bind(this)));
				this._paletteItemMoreConnects.push(On(paletteItemMoreCloseBox, 'click', function(e){
					Event.stop(e);
					this.paletteItemMoreCloseCleanup();
				}.bind(this)));
				var paletteItemAlternatesContainer = domConstruct.create("div", 
						{className:"paletteItemAlternatesContainer"},
						paletteItemMoreContent);
				var paletteItemAlternates = [];
				for(var i=0; i<paletteItemsSameGroup.length; i++){
					var paletteItemOuter = paletteItemsSameGroup[i];
					var className = (paletteItemOuter.domNode.style.display == 'none') ? 'paletteItemMoreUnselected' : 'paletteItemMoreSelected';
					var collectionName = paletteItemOuter._collectionName;
					var paletteItemAlternate = domConstruct.create("button", 
							{className:"paletteItemAlternate "+className, innerHTML:collectionName},
							paletteItemAlternatesContainer);
					paletteItemAlternates.push(paletteItemAlternate);
					this._paletteItemMoreConnects.push(On(paletteItemAlternate, 'mousedown, mouseup', function(e){
						Event.stop(e);	// Prevents mousedown, mouseup from closing selection
					}.bind(this)));
					this._paletteItemMoreConnects.push(On(paletteItemAlternate, 'click', function(collectionName, e){
						Event.stop(e);
						var newPaletteItem;
						for(var j=0; j<paletteItemsSameGroup.length; j++){
							var paletteItemInner = paletteItemsSameGroup[j];
							if(paletteItemInner._collectionName == collectionName){
								newPaletteItem = paletteItemInner;
								break;
							}
						}
						if(newPaletteItem){
							for(var j=0; j<paletteItemsSameGroup.length; j++){
								var paletteItemInner = paletteItemsSameGroup[j];
								paletteItemInner.domNode.style.display = (paletteItemInner == newPaletteItem) ? this.palette._displayShowValue : 'none';
							}
							newPaletteItem.sunken(newPaletteItem.domNode);
						}
						this.paletteItemMoreCloseCleanup();
					}.bind(this, collectionName)));
				}
				this._tooltipDialog = new TooltipDialog({
					className: "paletteItemMorePopup",
					style: "width: auto; ",
					content: paletteItemMoreContent,
					onShow: function(e){
						// Drop down 12px to make it closer to button that launched the TooltipDialog
						var parentNode = this._tooltipDialog.domNode.parentNode;
						if(parentNode){
							var oldTop = parseFloat(parentNode.style.top);
							if(!isNaN(oldTop)){
								parentNode.style.top = (oldTop+12)+'px';
							}
						}
					}.bind(this)
				});
				Popup.open({
					popup: this._tooltipDialog,
					around: paletteItemSelectedMoreIcon,
					orient:["above-centered"]
				});
				/*
				setTimeout(function(){
					Popup.close(this._tooltipDialog);
				}, 2000);
				*/
			}.bind(this));
		}else{
			paletteItemSelectedMoreIcon.style.display = 'none';
		}
		var paletteItemSelectedHelpIcon = Query('.paletteItemSelectedHelpIcon', div)[0];
		// FIXME: Any leakages here?
		On(paletteItemSelectedHelpIcon, 'mousedown, mouseup', function(e){
			Event.stop(e);	// Prevents mousedown, mouseup from closing selection
		}.bind(this));
		On(paletteItemSelectedHelpIcon, 'click', function(e){
			Event.stop(e);
			var paletteItemHelpContent = domConstruct.create("div", {className:"paletteItemHelpContent"});
			var paletteItemHelpCloseBox = domConstruct.create("span", 
					{className:"paletteItemHelpCloseBox"},
					paletteItemHelpContent);
			var paletteItemHelpDescription = domConstruct.create("div", 
					{className:"paletteItemHelpDescription", innerHTML:'some text content'},
					paletteItemHelpContent);
			this._paletteItemHelpConnects.push(On(paletteItemHelpCloseBox, 'mousedown, mouseup', function(e){
				Event.stop(e);	// Prevents mousedown, mouseup from closing selection
			}.bind(this)));
			this._paletteItemHelpConnects.push(On(paletteItemHelpCloseBox, 'click', function(e){
				Event.stop(e);
				this.paletteItemHelpCloseCleanup();
			}.bind(this)));
			this._tooltipDialog = new TooltipDialog({
				className: "paletteItemHelpPopup",
				style: "width: auto; ",
				content: paletteItemHelpContent,
				onShow: function(e){
					// Move up 12px to make it closer to button that launched the TooltipDialog
					var parentNode = this._tooltipDialog.domNode.parentNode;
					if(parentNode){
						var oldTop = parseFloat(parentNode.style.top);
						if(!isNaN(oldTop)){
							parentNode.style.top = (oldTop-12)+'px';
						}
					}
				}.bind(this)
			});
			Popup.open({
				popup: this._tooltipDialog,
				around: paletteItemSelectedHelpIcon,
				orient:["below-centered"]
			});
		}.bind(this));
	},
	
	paletteItemMoreCloseCleanup: function(){
		// FIXME: Move into separate routine
		for(var j=0; j<this._paletteItemMoreConnects.length; j++){
			this._paletteItemMoreConnects[j].remove();
		};
		this._paletteItemMoreConnects = [];
		Popup.close(this._tooltipDialog);
		this._tooltipDialog.destroyRecursive();
		this._tooltipDialog = null;
	},
	
	paletteItemHelpCloseCleanup: function(){
		// FIXME: Move into separate routine
		for(var j=0; j<this._paletteItemHelpConnects.length; j++){
			this._paletteItemHelpConnects[j].remove();
		};
		this._paletteItemHelpConnects = [];
		Popup.close(this._tooltipDialog);
		this._tooltipDialog.destroyRecursive();
		this._tooltipDialog = null;
	}
});
});
