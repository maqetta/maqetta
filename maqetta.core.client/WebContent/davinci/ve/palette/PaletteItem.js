define([
	"dojo/_base/declare",
	"dijit/_Widget",
	"dijit/Tooltip",
	"dojo/fx",
	"davinci/ve/tools/CreateTool",
	"davinci/ui/dnd/DragManager"
], function(declare, _Widget, Tooltip, fx, CreateTool, DragManager){

return declare("davinci.ve.palette.PaletteItem", dijit._Widget,{

	icon: "",
	displayName: "",
	name: "",
	paletteId: "",
	type: "",
	data: null,
	tool: "",
	palette: null,
	category: "",

	buildRendering: function(){
		this.palette = dijit.byId(this.paletteId);
		var div = this.domNode = this.palette.itemTemplate.cloneNode(true);
		var a = div.firstChild;
		dojo.attr(a, "tabIndex", "0");
		a.onclick = this.palette.nop; // to avoid firing the onbeforeunload event (dojo.event.connect doesn't work for this purpose)
		var img = a.firstChild;

// XXX Sprited images not supported. Use base64 instead.
//		var offsetX = 0;
//		var offsetY = 0;
//		if(this.icon.indexOf(",") != -1){
//			var arr = this.icon.split(",");
//			this.icon = arr[0];
//			offsetX = arr[1] - 0;
//			offsetY = arr[2] - 0;
//		}

		img.src = this.icon;
		a.appendChild(dojo.doc.createTextNode(this.displayName));
		dojo.create('span',
		        {
		            className: 'maqWidgetsCategory',
		            innerHTML: this.category
		        },
		        a
		);

		this.domNode.componentClassName = this.name; // ex. "davinci.ve.widget.Hello"
		dojo.setSelectable(this.domNode, false);
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

	deselect: function(){
		this.flat(this.domNode);
		this.palette.selectedItem = null;
	},

	itemMouseOverHandler: function(e){
		var div = this.domNode;
		if(this.palette.selectedItem == this){
			;
		}else{
			this.raised(div);
		}
	},

	itemMouseOutHandler: function(e){
		var div = this.domNode;
		if(this.palette.selectedItem == this){
			this.sunken(div);
		}else{
			this.flat(div);
		}
		if(this.tooltip){
			this.tooltip.close();
		}
	},

	itemMouseDownHandler: function(e){
		var div = this.domNode;
		this.focus();
		this.sunken(div);
		if(this.palette.selectedItem && this.palette.selectedItem != this){
			this.flat(this.palette.selectedItem.domNode);
			this.palette.selectedItem = null;
		}
		this.palette.pushedItem = this;
		davinci.ui.dnd.dragManager.document = this.palette._context.getDocument();
		var frameNode = this.palette._context.frameNode;
		if(frameNode){
			var coords = dojo.coords(frameNode);
			var containerNode = this.palette._context.getContainerNode();
			davinci.ui.dnd.dragManager.documentX = coords.x - containerNode.scrollLeft;
			davinci.ui.dnd.dragManager.documentY = coords.y - containerNode.scrollTop
		}
	},

	itemMouseUpHandler: function(e){
		if(this.palette.pushedItem != this){
			this.palette.pushedItem = null;
			var div = this.domNode;
			this.raised(div);
			return;
		}
		if(this.palette.selectedItem == this){
			var div = this.domNode;
			this.raised(div);
			this.palette.selectedItem = null;
			this.palette._context.setActiveTool(null);
			return;
		}
		this.palette.selectedItem = this;
		this.palette.pushedItem = null;
		var tool = undefined;
		var dataCopy = dojo.clone(this.data);
		if(this.tool){
			// prime the metadata cache to make sure the loader is set up properly
			davinci.ve.metadata.query(this.type);
			dojo["require"](this.tool);
//            dojo._loadUri(system.resource.findResource(
//                    './' + this.tool.replace(/\./g, "/") + ".js").getURL());
			var ctor = dojo.getObject(this.tool);
			tool = new ctor(dataCopy);
		}else{
			tool = new davinci.ve.tools.CreateTool(dataCopy);
		}
		this.palette._context.setActiveTool(tool);
		this.connect(this.palette._context, "onMouseUp", function(e){
			this.palette.selectedItem = null;
			this.flat(this.domNode);
		});
	},
	
	itemKeyDownHandler: function(e){
		if(e.keyCode != dojo.keys.ENTER){return;}
		if(this.palette.selectedItem){
			this.flat(this.palette.selectedItem.domNode);
			this.palette.selectedItem = null;
		}
		var context = this.palette._context;
		var tool = undefined;
		var dataCopy = dojo.clone(this.data);
		if(this.tool){
			// prime the metadata cache to make sure the loader is set up properly
			davinci.ve.metadata.query(this.type);
//			dojo["require"](this.tool);
            dojo._loadUri(system.resource.findResource(
                    './' + this.tool.replace(/\./g, "/") + ".js").getURL());
			var ctor = dojo.getObject(this.tool);
			tool = new ctor(dataCopy);
		}else{
			tool = new davinci.ve.tools.CreateTool(dataCopy);
		}
		context.setActiveTool(tool);
		tool.create({target: context.getSelection()[0], position: {x:50, y:50}});
		context.setActiveTool(null);
		context.getContainerNode().focus();  // to enable moving with arrow keys immediately
	},

	flat: function(div){
		dojo.removeClass(div, "dojoyPaletteItemRaised");
		dojo.removeClass(div, "dojoyPaletteItemSunken");
		dojo.addClass(div, "dojoyPaletteItemFlat");
	},

	raised: function(div){
		dojo.removeClass(div, "dojoyPaletteItemFlat");
		dojo.removeClass(div, "dojoyPaletteItemSunken");
		dojo.addClass(div, "dojoyPaletteItemRaised");
	},

	sunken: function(div){
		dojo.removeClass(div, "dojoyPaletteItemFlat");
		dojo.removeClass(div, "dojoyPaletteItemRaised");
		dojo.addClass(div, "dojoyPaletteItemSunken");
	}
});
});
