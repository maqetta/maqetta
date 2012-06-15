define([
    "dojo/_base/declare",
    "dojo/_base/connect", 
    "../drawing/Surface",
	"../drawing/tools/CreateTool",
	"../drawing/tools/ExchangeTool",
	"../drawing/tools/HighlightTool",
	"../drawing/tools/SelectTool",
	"davinci/Runtime",
	"davinci/UserActivityMonitor",
	"davinci/review/Review",
	"davinci/ve/Context",
	'preview/silhouetteiframe'
], function(declare, connect, Surface, CreateTool, ExchangeTool, HighlightTool, SelectTool, Runtime, UserActivityMonitor, Review, Context, Silhouette) {
	
return declare("davinci.review.editor.Context", [Context], {

	setSource: function(){
				
		var containerNode = this.containerNode; 
		var versionInfo = this.resourceFile.parent;
		if (!versionInfo.width)
			containerNode.style.overflowX = "hidden";
		if (!versionInfo.height)
			containerNode.style.overflowY = "hidden";
		if (!this.frame) {
			this.frame = dojo.create("iframe", dojo.mixin(this.iframeattrs, {
				style: {
					border: "0",
					width: versionInfo.width && versionInfo.height ? versionInfo.width + "px" : "100%",
					height: versionInfo.width && versionInfo.height ? versionInfo.height + "px" : "100%"
				},
				src: this.baseURL,
				onload: dojo.hitch(this,function(event){
					this._domIsReady = true;
					var userDoc = event && event.target && event.target.contentDocument;
					var dj = userDoc && userDoc.defaultView && userDoc.defaultView.dojo;
					var deviceName = this.frame.contentDocument.body.getAttribute(MOBILE_DEV_ATTR);
					var svgfilename = (!deviceName || deviceName == 'none' || deviceName == 'desktop') 
							? null : "app/preview/images/" + deviceName + ".svg";
					if (svgfilename) {
						var theme = Silhouette.getMobileTheme(svgfilename);
						dj.ready(function(){
							var dm = dj.getObject("dojox.mobile", true);
							dm.loadDeviceTheme(theme);
						});
					}
//					if (dj && dj.subscribe) {
						connect.subscribe("/davinci/scene/selectionChanged", this, function(SceneManager, sceneId) {
							if (!Runtime.currentEditor || Runtime.currentEditor.editorID != "davinci.review.CommentReviewEditor") { 
								return; 
							}
							if (this._commentView) {
								this._commentView.setCurrentScene(SceneManager, sceneId);
							}							
						});
//					}

					var userWindow = userDoc && userDoc.defaultView && userDoc.defaultView.window;
					if (userWindow.require) {
						userWindow.require("dojo/_base/connect").subscribe("/davinci/states/state/changed", function(args) {
							if (!args || !Runtime.currentEditor || Runtime.currentEditor.declaredClass != "davinci.review.editor.ReviewEditor") { 
								return; 
							}
							var state = args.newState || "Normal";
							var dv = userWindow.davinci;
							if(dv && dv.states && dv.states.setState){
								dv.states.setState(undefined, state);
								// Re-publish at the application level
								var newArgs = dojo.clone(args);
								newArgs.editorClass = "davinci.review.editor.ReviewEditor";
								connect.publish("/davinci/states/state/changed", [newArgs]);
							}
						});
					}

					this.rootNode = this.rootWidget = this.frame.contentDocument.body;
					this._initDrawing();
					connect.publish("/davinci/review/context/loaded", [this, this.fileName]);
					
					var newCons = [];
					// add the user activity monitoring to the document and add the connects to be 
					// disconnected latter
					newCons = newCons.concat(this._cxtConns, UserActivityMonitor.addInActivityMonitor(this.frame.contentDocument));
					this._cxtConns = newCons;
					this.containerEditor.silhouetteiframe.setSVGFilename(svgfilename);
					this._statesLoaded = true;
					connect.publish('/davinci/ui/context/statesLoaded', [this]);
					var doc = this.getDocument(), surface = (doc && doc.annotationSurface);
					if(surface){
						this._refreshSurface(surface);
					}
				})
			}), containerNode);
			connect.subscribe("/davinci/states/state/changed", function(args) { 
				if (!args || !Runtime.currentEditor || Runtime.currentEditor.editorID != "davinci.review.CommentReviewEditor" ||
						!this.containerEditor || this.containerEditor != Runtime.currentEditor) { 
					return; 
				}
				// Push the state change down into the review document
				var userWin = this.frame && this.frame.contentDocument && this.frame.contentDocument.defaultView;
				if(userWin && userWin.davinci && userWin.davinci.states && userWin.davinci.states.setState){
					userWin.davinci.states.setState(undefined, args.newState);
				}
			}.bind(this));
		}
	},

	getSelection: function() {
		return []; // Overridden for NOOP behavior
	},

	select: function(){
		// Overridden for NOOP behavior
	},

	_initDrawing: function() {
		// summary:
		//        Create the canvas for annotations, and wait for the shape definition
		//        to add a shape. The shapes will be created one by one.
		//        Shapes with commentId, state and colorAlias(reviewer)
		var doc = this.frame.contentDocument, 
			surface;
		if (!doc.annotationSurface) {
			surface = doc.annotationSurface = new Surface(doc.body, doc, this);
			new CreateTool(surface, ["commentId"]);
			new SelectTool(surface, ["commentId"]).activate();
			new ExchangeTool(surface, ["commentId"]);
			new HighlightTool(surface).activate();
		} else {
			surface = doc.annotationSurface;
		}
		this._cxtConns = [
			 connect.connect(surface.highlightTool, "onShapeMouseDown", function(shape) {
				 connect.publish("/davinci/review/drawing/annotationSelected", [shape.commentId]);
			 }),
			 connect.connect(this.getContainerNode(), "click", dojo.hitch(this, function(evt) {
				 if (!this.containerEditor.isDirty && evt.target === this.getContainerNode()) {
					 connect.publish("/davinci/review/view/canvasFocused", [this]);
				 }
			 }))
			];
		this._cxtSubs = [
			 connect.subscribe(this.fileName+"/davinci/review/drawing/addShape", function(shapeDef, clear, editor) {
				 surface.exchangeTool.importShapes(shapeDef, clear, dojo.hitch(Review, Review.getColor)); // FIXME: Unique surface is required
			 }),
			 connect.subscribe(this.fileName+"/davinci/review/drawing/enableEditing", this, function(reviewer, commentId, pageState, viewScene) {
				 surface.activate();
				 surface.cached = surface.exchangeTool.exportShapesByAttribute();
				 surface.currentReviewer = reviewer;
				 surface.commentId = commentId;
				 surface.filterState = pageState;
				 surface.filterScene = viewScene;
				 surface.filterComments = [commentId];
				 this._refreshSurface(surface);
			 }),
			 connect.subscribe(this.fileName+"/davinci/review/drawing/getShapesInEditing", dojo.hitch(this,function(obj, state, scene) {
				 if (obj._currentPage != this.fileName) {
					 return;
				 }
				 surface.selectTool.deselectShape();
				 surface.setValueByAttribute("commentId", surface.commentId, "state", state);
				 surface.setValueByAttribute("commentId", surface.commentId, "scene", scene);
				 obj.drawingJson = surface.exchangeTool.exportShapesByAttribute("commentId", [surface.commentId]);
				 surface.deactivate();
				 surface.commentId = "";
			 })),
			 connect.subscribe(this.fileName+"/davinci/review/drawing/cancelEditing", dojo.hitch(this, function() {
				 // Restore the previous status
				 surface.exchangeTool.importShapes(surface.cached, true, dojo.hitch(Review, Review.getColor)); // FIXME: Unique surface is required
				 surface.deactivate();
				 this._refreshSurface(surface);
				 surface.commentId = ""; // Clear the filter so that no shapes can be selected
			 })),
			 connect.subscribe(this.fileName+"/davinci/review/drawing/filter", dojo.hitch(this,function(/*Object*/ stateinfo, /*Array*/ commentIds) {
				 surface.filterScene = stateinfo.viewScene;
				 surface.filterState = stateinfo.pageState;
				 surface.filterComments = commentIds;
				 this._refreshSurface(surface);
			 })),
			 connect.subscribe(this.fileName+"/davinci/review/drawing/setShownColorAliases", dojo.hitch(this,function(colorAliases) {
				 surface.filterColorAliases = colorAliases;
				 this._refreshSurface(surface);
			 })),
			 connect.subscribe("/davinci/review/view/openComment", dojo.hitch(this, function() {
	            if (Runtime.currentEditor === this.containerEditor) {
	            	this.containerEditor.isDirty = true;
	            	//Also, tell our container we're dirty
	            	if (this.containerEditor.editorContainer) {
	            		this.containerEditor.editorContainer.setDirty(true);
	    			}
	            }
			 })),
			 connect.subscribe("/davinci/review/view/closeComment", dojo.hitch(this, function() {
				 if (Runtime.currentEditor === this.containerEditor) {
					 this.containerEditor.isDirty = false;
					 //Also, tell our container we're no longer dirty
		            	if (this.containerEditor.editorContainer) {
		            		this.containerEditor.editorContainer.setDirty(false);
		    			}
				 }
			 })),
			 connect.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, function(obj){
				 if (obj.oldEditor!=null && this === obj.oldEditor.getContext && this === obj.oldEditor.getContext()) { // not all editors have a context eg textView
					 // Determine if the editor is closed, if the editor is closed then
					 // getDocument() will throw an exception
					 try {
						 this.getDocument();
					 } catch(err) {
						 // The editor is closed now
						 this._destroyDrawing();
					 }
				 }
			 }))
		];
	},

	_refreshSurface: function(surface) {
		if(!this._domIsReady){
			return;
		}
		
		// Return true if shape and surface have different values for state or scene
		function differentStateScene(Shape, Surface){
			if(!Shape || !Surface){
				return false;
			}
			if(Shape.state && Surface.filterState && Shape.state != Surface.filterState){
				return true;	// there is a difference
			}
			if(Shape.scene && Surface.filterScene && Shape.scene != Surface.filterScene){
				return true;	// there is a difference
			}
			return false;
		}

		var shapes = surface.shapes, result;

		dojo.forEach(shapes, function(shape) {
			result = "hidden";
			if (dojo.some(surface.filterColorAliases, function(colorAlias) {
				//FIXME: Hack to fix #1486 just before Preview 4 release
				// Old code - quick check - covers case where server uses same string for username and email
				if (shape.colorAlias == colorAlias) {
					return true;
				} else if (davinci && davinci.review && dojo.isArray(Runtime.reviewers)) {
					// New code hack - see if colorAlias matches either username or email corresponding to shape.colorAlias
					var reviewers = Runtime.reviewers;
					var found = false;
					for (var i=0; i<reviewers.length; i++) {
						if (colorAlias == reviewers[i].name || colorAlias == reviewers[i].email) {
							found = true;
							break;
						}
					}
					if (found) {
						if (shape.colorAlias == reviewers[i].name || shape.colorAlias == reviewers[i].email) {
							return true;
						}
					}
					return false;
				}
			})) {
				if (surface.filterComments && surface.filterComments.length > 0) {
					if (dojo.some(surface.filterComments, function(commentId) { 
						return shape.commentId == commentId;
					})){
						result = "visible";
						surface.highlightTool && (surface.highlightTool.shape = shape);
					} else {
						result = "partial";
					}
					if (differentStateScene(shape, surface)) {
						result = "hidden";
					}
				} else {
					if (differentStateScene(shape, surface)){
						result = "hidden";
					} else {
						result = "visible";
					}
				}
			}
			if (shape.commentId == surface.commentId) {
				// Keep the shapes in editing
				result = "visible";
			}
			shape.setVisible(result);
		});
	},

	_destroyDrawing: function() {
		try {
			var doc = this.getDocument(), surface = (doc && doc.annotationSurface);
			if (surface) {
				surface.destroy();
			}
		} catch(err) { /*Do nothing*/ }
		dojo.forEach(this._cxtConns, connect.disconnect);
		dojo.forEach(this._cxtSubs, connect.unsubscribe);
		if (doc) {
			delete doc.annotationSureface;
		}
	}

});
});