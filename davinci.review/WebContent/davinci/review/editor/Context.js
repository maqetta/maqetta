dojo.provide("davinci.review.editor.Context");

dojo.require("davinci.commands.CommandStack");
dojo.require("davinci.ve.tools.SelectTool");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.util");
dojo.require("davinci.ve.Focus");

dojo.declare("davinci.review.editor.Context", null, {

	_contentStyleSheet: "" + dojo.moduleUrl("davinci.ve", "resources/content.css"),
	// comma-separated list of modules to load in the iframe
	_bootstrapModules: "dijit.dijit",

	constructor: function(args){
		this._id = "_edit_context_" + davinci.ve._contextCount++;
		
		dojo.mixin(this, args);

		if(dojo.isString(this.containerNode)){
			this.containerNode = dijit.byId(this.containerNode);
		}

	},
	
	setSource: function(){
//		dojo.withDoc(this.getDocument(), "_setSource", this, []);
		var containerNode = this.containerNode;
		var versionInfo = this.resourceFile.parent;
		if(!versionInfo.width)
			containerNode.style.overflowX = "hidden";
		if(!versionInfo.height)
			containerNode.style.overflowY = "hidden";
		if(!this.frame){
			this.frame = dojo.create("iframe", {
				style: {
					border: "0",
					width: versionInfo.width&&versionInfo.height?versionInfo.width+"px":"100%",
					height: versionInfo.width&&versionInfo.height?versionInfo.height+"px":"100%"
				},
				src: this.baseURL,
				onload: dojo.hitch(this,function(){
					this._initDrawing();
					dojo.publish("/davinci/review/context/loaded", [
						this,
						this.fileName,
//						this.version,
						davinci.Runtime.commenting_commentId
					]);
					this.parseHyperlink();
				})
			}, containerNode);
		}
//		else{
//			this._initDrawing();
//			dojo.publish("/davinci/review/context/loaded", [
//				this,
//				this.fileName,
//				davinci.Runtime.commenting_commentId
//			]);
//			this.parseHyperlink();
//		}
	},
	
	setURL:function(URL){
		this.baseURL = URL;
		this.frame.src=URL;
	},
	
	getDocument: function(){
		var container = this.getContainerNode();
		return container && container.ownerDocument;
	},

	getGlobal: function(){
		if(!this.getDocument()) return null;
		return dijit.getDocumentWindow(this.getDocument());
	},

	getDojo: function(){
		var win = this.getGlobal();
		return (win.dojo || dojo);
	},

	getDijit: function(){
		var win = this.getGlobal();
		return (win && win.dijit || dijit);
	},
	
	getFrameNode: function(){
		return this._frameNode;
	},

	getContainerNode: function(){
		return this.frame.contentDocument.body||this.frame.contentWindow.document.body;
	},
	getSelection: function(){
		return null;
	},

	_initDrawing: function(){
		// summary:
		//		Create the canvas for annotations, and wait for the shape definition
		//		to add a shape. The shapes will be created one by one.
		//		Shapes with commentId, state and colorAlias(reviewer)
		var doc = this.getDocument(), surface;
		if(!doc.annotationSurface){
			surface = doc.annotationSurface = new davinci.review.drawing.Surface(doc.body, doc);
			new davinci.review.drawing.tools.CreateTool(surface, ["commentId"]);
			new davinci.review.drawing.tools.SelectTool(surface, ["commentId"]).activate();
			new davinci.review.drawing.tools.ExchangeTool(surface, ["commentId"]);
			new davinci.review.drawing.tools.HighlightTool(surface).activate();
		}
		this._cxtConns = [
			dojo.connect(surface.highlightTool, "onShapeMouseDown", function(shape){
				dojo.publish("/davinci/review/drawing/annotationSelected", [shape.commentId]);
			}),
			dojo.connect(this.getContainerNode(), "click", dojo.hitch(this, function(evt){
				if(!this.containerEditor.isDirty && evt.target === this.getContainerNode()){
					dojo.publish("/davinci/review/view/canvasFocused", [this]);
				}
			}))
		];
		this._cxtSubs = [
			dojo.subscribe(this.fileName+"/davinci/review/drawing/addShape", function(shapeDef, clear, editor){
				surface.exchangeTool.importShapes(shapeDef, clear, dojo.hitch(davinci.review.Runtime, davinci.review.Runtime.getColor)); // FIXME: Unique surface is required
			}),
			dojo.subscribe(this.fileName+"/davinci/review/drawing/enableEditing", this, function(reviewer, commentId, pageState){
				surface.activate();
				surface.cached = surface.exchangeTool.exportShapesByAttribute();
				surface.currentReviewer = reviewer;
				surface.commentId = commentId;
				
				surface.filterState = pageState;
				surface.filterComments = [commentId];				
				this._refreshSurface(surface);
			}),
			dojo.subscribe(this.fileName+"/davinci/review/drawing/getShapesInEditing", dojo.hitch(this,function(obj, state){
				if(obj._currentPage!=this.fileName) return;
				surface.selectTool.deselectShape();
				surface.setValueByAttribute("commentId", surface.commentId, "state", state);
				obj.drawingJson = surface.exchangeTool.exportShapesByAttribute("commentId", [surface.commentId]);
				surface.deactivate();
				surface.commentId = "";
			})),
			dojo.subscribe(this.fileName+"/davinci/review/drawing/cancelEditing", dojo.hitch(this, function(){
				// Restore the previous status
				surface.exchangeTool.importShapes(surface.cached, true, dojo.hitch(davinci.review.Runtime, davinci.review.Runtime.getColor)); // FIXME: Unique surface is required
				surface.deactivate();
				this._refreshSurface(surface);
				surface.commentId = ""; // Clear the filter so that no shapes can be selected
			})),
			dojo.subscribe(this.fileName+"/davinci/review/drawing/filter", dojo.hitch(this,function(pageState, /*Array*/commentIds){
				surface.filterState = pageState;
				surface.filterComments = commentIds;				
				this._refreshSurface(surface);
			})),
			dojo.subscribe(this.fileName+"/davinci/review/drawing/setShownColorAliases", dojo.hitch(this,function(colorAliases){
				surface.filterColorAliases = colorAliases;
				this._refreshSurface(surface);
			})),
			dojo.subscribe("/davinci/review/view/openComment", dojo.hitch(this, function(){
				this.containerEditor.isDirty = true;
			})),
			dojo.subscribe("/davinci/review/view/closeComment", dojo.hitch(this, function(){
				this.containerEditor.isDirty = false;
			})),
			dojo.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, function(obj){
				if(this === obj.oldEditor.getContext()){
					// Determine if the editor is closed, if the editor is closed then
					// getDocument() will throw an exception
					try {
						this.getDocument();
					}catch(err){
						// The editor is closed now
						this._destroyDrawing();
					}
				}
			}))
		];
	},
	
	_refreshSurface: function(surface){
		var shapes = surface.shapes, result;
		
		dojo.forEach(shapes, function(shape){
			result = "hidden";
			if(dojo.some(surface.filterColorAliases, function(colorAlias){ return shape.colorAlias == colorAlias; })){
				if(surface.filterComments && surface.filterComments.length > 0){
					if(dojo.some(surface.filterComments, function(commentId){ 
						return shape.commentId == commentId;
						})){
						result = "visible";
						surface.highlightTool && (surface.highlightTool.shape = shape);
					}else{
						result = "partial";
					}
					if(shape.state != surface.filterState){
						result = "hidden";
					}
				}else{
					if(shape.state == surface.filterState){
						result = "visible";
					}else{
						result = "hidden";
					}
				}
			}
			if(shape.commentId == surface.commentId){
				// Keep the shapes in editing
				result = "visible";
			}
			shape.setVisible(result);
		});
	},
	
	_destroyDrawing: function(){
		try{
			var doc = this.getDocument(), surface = (doc && doc.annotationSurface);
			if(surface)	surface.destroy();
		}catch(err){ /*Do nothing*/ }
		dojo.forEach(this._cxtConns, dojo.disconnect);
		dojo.forEach(this._cxtSubs, dojo.unsubscribe);
		doc && delete doc.annotationSureface;
	},
	
	parseHyperlink: function(){
		this._cxtConns.push(
			dojo.connect(this.getContainerNode(), "click", dojo.hitch(this, function(evt){
				var langObj = dojo.i18n.getLocalization("davinci.review.widgets", "widgets");
//				var linkList = dojo.query('a', this.getContainerNode());
				var basePath= new davinci.model.Path(this.fileName);
				if(evt.target.tagName == 'a' || evt.target.tagName == 'A'){
					item = (evt.target.nodeType == 3) ? evt.target.parentNode : evt.target;
					var linkAttr = dojo.attr(item, "href");
					if (linkAttr.indexOf("http") != -1){
						//console.log("it's an external link");
						dojo.attr(item, "target", "new");
					}else{
						targetAttr = dojo.attr(item, "target");
						var linkFileName = linkAttr;
						var linkFilePath = basePath.getParentPath() + "/" + linkAttr;
						var result = davinci.Runtime.serverJSONRequest({
							url: "./cmd/detectLinkedFile",
							sync: true,
							content:{
								'fileName': linkFilePath
							}
						});
						console.log("file exists: " + result);
						
						if (result == true ){
							if (targetAttr && (targetAttr.indexOf("new")!=-1)){
								//console.log("it's an internal link opened in new target");
								dojo.attr(item, "href", "#");
								dojo.attr(item, "target", "");
								var originalFileName = this.resourceFile.name;
								var node = new Object(this.resourceFile);
								var pathArray = linkFilePath.split('/');
								node.name =  "./" + pathArray[pathArray.length-2] + "/" + pathArray[pathArray.length-1];
								davinci.Workbench.openEditor({
									fileName: node,
									content: node.getText()
								});
								this.resourceFile.name = originalFileName;
							}else{
								//console.log("it's an internal link opened here");
								var tab = dijit.byId(davinci.Workbench._filename2id(this.fileName));
								tab.onClose();
								if(tab){
									dojo.attr(tab, "title", linkFileName);
									this.baseURL = item.href.substr(0, item.href.lastIndexOf('/')+1) + linkFileName;
									this.fileName = linkFilePath;
									this.setURL(this.baseURL);
									this.setSource();
								}
							}
						}else{
							dojo.attr(item, "href", "#");
							if(!this.warningDialog){
			            		this.warningDialog = new dijit.Dialog({
			            			title: langObj.warning,
			            			content: langObj.pageMissed
			            		});
			            		this.warningDialog.show();
			            		;
			            	}else{
			            		this.warningDialog.show();
			            	}
						}
					}
				}
			}))
		);
	}
});

davinci.ve._contextCount = 0;
