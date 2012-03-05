define([
    "dojo/_base/declare",
	"../drawing/Surface",
	"../drawing/tools/CreateTool",
	"../drawing/tools/ExchangeTool",
	"../drawing/tools/HighlightTool",
	"../drawing/tools/SelectTool",
	"davinci/Runtime",
	"davinci/ve/Context"
], function(declare, Surface, CreateTool, ExchangeTool, HighlightTool, SelectTool, Runtime, Context) {
	
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
					var userDoc = (event && event.target && event.target.contentDocument);
					var dj = (userDoc && userDoc.defaultView && userDoc.defaultView.dojo);
					if (dj && dj.subscribe) {
						dj.subscribe("/davinci/scene/selectionChanged", this, function(SceneManager, sceneId) {
							if (!Runtime.currentEditor || Runtime.currentEditor.editorID != "davinci.review.CommentReviewEditor") { 
								return; 
							}
							if (this._commentView) {
								this._commentView.setCurrentScene(SceneManager, sceneId);
							}							
						});
					}
					//FIXME: Have to subscribe to the runtime States.js version of dojo pubsub
					//instead of using the real runtime version of dojo pubsub because States.js is
					//using its own mini copy of Dojo
					var statesDojo = (userDoc && userDoc.defaultView && userDoc.defaultView.davinci && userDoc.defaultView.davinci.dojo);
					if (statesDojo && statesDojo.subscribe) {
						statesDojo.subscribe("/davinci/states/state/changed", function(args) { 
							if (!args || !Runtime.currentEditor || Runtime.currentEditor.declaredClass != "davinci.review.editor.ReviewEditor") { 
								return; 
							}
							var state = args.newState || "Normal";
							var dv = (statesDojo.global && statesDojo.global.davinci);
							if(dv && dv.states && dv.states.setState){
								dv.states.setState(undefined, state);
								// Re-publish at the application level
								var newArgs = dojo.clone(args);
								newArgs.editorClass = "davinci.review.CommentReviewEditor";
								dojo.publish("/davinci/states/state/changed", [newArgs]);
							}
						});
					}
					this.rootNode = this.rootWidget = this.frame.contentDocument.body;
					this._initDrawing();
					dojo.publish("/davinci/review/context/loaded", 
							[
							 this,
							 this.fileName,
							 davinci.Runtime.commenting_commentId
							 ]);
					var deviceName = this.rootNode.getAttribute('data-maqetta-device');
					var svgfilename = (!deviceName || deviceName == 'none' || deviceName == 'desktop') 
							? null : "app/preview/images/" + deviceName + ".svg";
					this.containerEditor.silhouetteiframe.setSVGFilename(svgfilename);
					this._statesLoaded = true;
					dojo.publish('/davinci/ui/context/statesLoaded', [this]);
				})
			}), containerNode);
			dojo.subscribe("/davinci/states/state/changed", function(args) { 
				if (!args || !Runtime.currentEditor || Runtime.currentEditor.editorID != "davinci.review.CommentReviewEditor" ||
						!this.containerEditor || this.containerEditor != Runtime.currentEditor) { 
					return; 
				}
				// Push the state change down into the review document
				var userWin = (this.frame && this.frame.contentDocument && this.frame.contentDocument.defaultView);
				if(userWin && userWin.davinci && userWin.davinci.states && userWin.davinci.states.setState){
					userWin.davinci.states.setState(undefined, args.newState);
				}
			}.bind(this));
		}
	},

	getSelection: function() {
		return []; // Overridden for NOOP behavior
	},

	_initDrawing: function() {
		// summary:
		//        Create the canvas for annotations, and wait for the shape definition
		//        to add a shape. The shapes will be created one by one.
		//        Shapes with commentId, state and colorAlias(reviewer)
		var doc = this.frame.contentDocument, 
			surface;
		if (!doc.annotationSurface) {
			surface = doc.annotationSurface = new Surface(doc.body, doc);
			new CreateTool(surface, ["commentId"]);
			new SelectTool(surface, ["commentId"]).activate();
			new ExchangeTool(surface, ["commentId"]);
			new HighlightTool(surface).activate();
		} else {
			surface = doc.annotationSurface;
		}
		this._cxtConns = [
			 dojo.connect(surface.highlightTool, "onShapeMouseDown", function(shape) {
				 dojo.publish("/davinci/review/drawing/annotationSelected", [shape.commentId]);
			 }),
			 dojo.connect(this.getContainerNode(), "click", dojo.hitch(this, function(evt) {
				 if (!this.containerEditor.isDirty && evt.target === this.getContainerNode()) {
					 dojo.publish("/davinci/review/view/canvasFocused", [this]);
				 }
			 }))
			];
		this._cxtSubs = [
			 dojo.subscribe(this.fileName+"/davinci/review/drawing/addShape", function(shapeDef, clear, editor) {
				 surface.exchangeTool.importShapes(shapeDef, clear, dojo.hitch(Runtime, Runtime.getColor)); // FIXME: Unique surface is required
			 }),
			 dojo.subscribe(this.fileName+"/davinci/review/drawing/enableEditing", this, function(reviewer, commentId, pageState, viewScene) {
				 surface.activate();
				 surface.cached = surface.exchangeTool.exportShapesByAttribute();
				 surface.currentReviewer = reviewer;
				 surface.commentId = commentId;
				 surface.filterState = pageState;
				 surface.filterScene = viewScene;
				 surface.filterComments = [commentId];
				 this._refreshSurface(surface);
			 }),
			 dojo.subscribe(this.fileName+"/davinci/review/drawing/getShapesInEditing", dojo.hitch(this,function(obj, state, scene) {
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
			 dojo.subscribe(this.fileName+"/davinci/review/drawing/cancelEditing", dojo.hitch(this, function() {
				 // Restore the previous status
				 surface.exchangeTool.importShapes(surface.cached, true, dojo.hitch(Runtime, Runtime.getColor)); // FIXME: Unique surface is required
				 surface.deactivate();
				 this._refreshSurface(surface);
				 surface.commentId = ""; // Clear the filter so that no shapes can be selected
			 })),
			 dojo.subscribe(this.fileName+"/davinci/review/drawing/filter", dojo.hitch(this,function(/*Object*/ stateinfo, /*Array*/ commentIds) {
				 surface.filterScene = stateinfo.viewScene;
				 surface.filterState = stateinfo.pageState;
				 surface.filterComments = commentIds;
				 this._refreshSurface(surface);
			 })),
			 dojo.subscribe(this.fileName+"/davinci/review/drawing/setShownColorAliases", dojo.hitch(this,function(colorAliases) {
				 surface.filterColorAliases = colorAliases;
				 this._refreshSurface(surface);
			 })),
			 dojo.subscribe("/davinci/review/view/openComment", dojo.hitch(this, function() {
				 this.containerEditor.isDirty = true;
			 })),
			 dojo.subscribe("/davinci/review/view/closeComment", dojo.hitch(this, function() {
				 this.containerEditor.isDirty = false;
			 })),
			 dojo.subscribe("/davinci/ui/editorSelected", dojo.hitch(this, function(obj){
				 if (obj.oldEditor!=null && this === obj.oldEditor.getContext()) {
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
					if (shape.state != surface.filterState && shape.scene != surface.filterScene) {
						result = "hidden";
					}
				} else {
					if (shape.state == surface.filterState || shape.scene == surface.filterScene) {
						result = "visible";
					} else {
						result = "hidden";
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
		dojo.forEach(this._cxtConns, dojo.disconnect);
		dojo.forEach(this._cxtSubs, dojo.unsubscribe);
		doc && delete doc.annotationSureface;
	}

});
});
