define([
    	"dojo/_base/declare",
    	"dojo/Deferred",
    	"../../commands/CommandStack",
    	"../widget",
    	"./SelectTool",
    	"../Context",
    	"../../library",
    	"../metadata"
], function(declare, Deferred, CommandStack, Widget, SelectTool, Context, Library, Metadata){


return declare([Context], {
	
	// comma-separated list of modules to load in the iframe
	_bootstrapModules: "dijit/dijit,dijit/dijit-all", // dijit-all hangs FF4 and does not seem to be needed.

	constructor: function(args){
		this._id = "_edit_context_" + this._contextCount++;
		dojo.mixin(this, args);
		if(dojo.isString(this.containerNode)){
			this.containerNode = dijit.byId(this.containerNode);
		}
		this._commandStack = CommandStack(this);
		this._defaultTool = new SelectTool();
		this._widgetIds = [];
		this._objectIds = [];
		this._widgets=[];
		this._selectionCssRules = [];
	},
	
	_setSourceData: function(data){
		
		// Create phony Dialog and Tooltip widgets with the appearance (template) of the Dijit widgets, but without the behavior.
		//.We need to do this because the stock widgets don't appear when placed on the page without user interaction, and they have
		// side effects which would interfere with operation of the Theme Editor.

		// Hard-code widget replacements for styling.  Need to factor creation out somehow to be data-driven.
		var mixins = [this.getDijit()._WidgetBase, this.getDijit()._TemplatedMixin];
		this.getDojo().declare("dijit.davinci.themeEditor.Dialog", mixins, {
			buttonCancel: "cancel", //TODO: i18n
			onCancel: function(){},
			title: "title",
			templateString: dojo.cache("dijit", "templates/Dialog.html"),
			// Map widget attributes to DOMNode attributes.
			attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
				title: [
					{ node: "titleNode", type: "innerHTML" },
					{ node: "titleBar", type: "attribute" }
				],
				"aria-describedby":""
			})
,			_setTitleAttr: [
				{ node: "titleNode", type: "innerHTML" },
				{ node: "titleBar", type: "attribute" }
			]
		});

		this.getDojo().declare("dijit.davinci.themeEditor.Tooltip", mixins, {
			templateString: dojo.cache("dijit", "templates/Tooltip.html")
		});
		this.setHeader({
			title: data.title,
			metas: data.metas,
			scripts: data.scripts,
			modules: data.modules,
			styleSheets: data.styleSheets,
			theme: data.theme,
			bodyClasses: data.bodyClasses,
			style: data.style
		});
		content = data.content || "";
		var containerNode = this.getContainerNode();
		var active = this.isActive();
		if(active){
			this.select(null);
			dojo.forEach(this.getTopWidgets(), this.detach, this);
		}
		var escapees = [],
			scripts = {},
			dvAttributes = {},
			promise = new Deferred();
		dojo.forEach(this.getTopWidgets(), function(w){
			if(w.getContext()){
				w.destroyWidget();
			}
		});
		containerNode.innerHTML = content;
		dojo.forEach(dojo.query("*", containerNode), function(n){
			var type =  n.getAttribute("data-dojo-type") || n.getAttribute("dojoType") || /*n.getAttribute("oawidget") ||*/ n.getAttribute("dvwidget");
			this.loadRequires(type, false/*doUpdateModel*/, true/*doUpdateModelDojoRequires*/); //TODO: use Deferred?
			//this.loadRequires(n.getAttribute("dojoType"));
		}, this);
		this.getGlobal()["require"]("dojo/ready")(function(){
			try {
				this.getGlobal()["require"]("dojo/parser").parse(containerNode);
				promise.resolve();
			} catch(e) {
				// When loading large files on FF 3.6 if the editor is not the active editor (this can happen at start up
				// the dojo parser will throw an exception trying to compute style on hidden containers
				// so to fix this we catch the exception here and add a subscription to be notified when this editor is seleected by the user
				// then we will reprocess the content when we have focus -- wdr
				
				// remove all registered widgets, some may be partly constructed.
				var localDijit = this.getDijit();
				localDijit.registry.forEach(function(w){
					  w.destroy();
				});
				this._editorSelectConnection = dojo.subscribe("/davinci/ui/editorSelected",  dojo.hitch(this, this._editorSelectionChange));

				promise.reject();
				throw e;
			}
		}.bind(this));
		if(active){
			dojo.query("> *", this.rootNode).map(davinci.ve.widget.getWidget).forEach(this.attach, this);
		}
		// remove the styles from all widgets and subwidgets that supported the state
		dojo.query('.dvThemeWidget').forEach(this.theme.removeWidgetStyleValues);
			// set the style on all widgets and subwidgets that support the state
			//this._themeEditor._theme.setWidgetStyleValues(widgets[i],this._currentState);
		return promise;
	},
	
	attach: function(widget){
		this.inherited(arguments);
		if(!widget || widget.internal || !widget._srcElement){
			return;
		}
		var isThemeWidget = false;
		var classes = widget.getClassNames();
		if (classes && classes.indexOf('dvThemeWidget') > -1){
			isThemeWidget = true;
		}

		widget.dvAttributes = {
			isThemeWidget: isThemeWidget
		};
		if (isThemeWidget) {
            if (this._widgets.indexOf(widget) === -1) {
            	this._widgets.push(widget);
            }
		}
	},
	
	getThemeMeta: function(){
		if(!this._themeMetaCache) {
			this._themeMetaCache = Library.getThemeMetadata(this.theme);
		}

		return this._themeMetaCache;
	},

	select: function(widget, add){
	
		if(!widget  || widget==this.rootWidget){
			this._selectedWidget = null;
			if(!add){
				this.deselect(); // deselect all
			}
			return;
		}
		this._selectedWidget = widget;

		var selection = undefined;
		var index = undefined; 
		if(add && this._selection){
			index = this._selection.length;
			selection = this._selection;
			selection.push(widget);
		}else{
			selection = [widget];
		}
		var selectionChanged = false;
		if(!this._selection || this._selection.length > 1 || selection.length > 1 ||
				selection[0] != this._selection[0]){
			this._selection = selection;
			selectionChanged = true;
		}
		
		var box = undefined;
		var op = undefined;
		if (!Metadata.queryDescriptor(widget.type, "isInvisible")) {
			var node = widget.getStyleNode();
			box = this.getDojo().position(node, true);
			box.l = box.x;
			box.t = box.y;
			op = {move: false};
			op.resizeWidth = false;
			op.resizeHeight = false;
		}
		this.focus({box: box, op: op}, index);
		this._focuses[0].showContext(this, widget);

		if(selectionChanged){
			this.onSelectionChange(this.getSelection());
		}
	},
	
	onSelectionChange: function(selection){
		this.visualEditor._themeEditor._selectedSubWidget = null;
		this.inherited(arguments);
	},
	
	getStyleAttributeValues: function(widget){
		/* no style attributes for theme editor */
		return [];
	},
	
	_restoreStates: function(){
	    
	},

	_configDojoxMobile: function() {
	     // override base

	},
	 
	/*
	* @returns the path to the file being edited
	*/
	getPath: function(){
	    
	    /*
	     * FIXME:
	     * We dont set the path along with the content in the context class, so
	     * have to pull the resource path from the model.  
	     * 
	     * I would rather see the path passed in, rather than assume the model has the proper URL,
	     * but using the model for now.
	     * 
	     */
	    /*theme editor sets the file name to DEFAULT_PAGE
	     * so use the path theme file to find the html
	     *
	     */  
	    var path = this.theme.file.getPath();
	    path = path.substring(0, path.lastIndexOf('/'));
	    path = path + '/' + this.theme.themeEditorHtmls[0];
	    return path;
	},

	getFullResourcePath: function() {
		return this.visualEditor.basePath;
	},
	
	widgetAddedOrDeleted : function(){}
	
});
});

