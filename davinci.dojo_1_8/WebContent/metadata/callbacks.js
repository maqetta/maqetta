define(function() {
	/**
	 * API for SceneManager plugins to Maqetta plug
	 * 
	 * A SceneManager is a JavaScript class that can be instanced by a "new" command.
	 *
	 * This class must provide the following methods:
	 * 
	 * constructor(context)
	 *		Class constructor. Must set this.name to a localized string.
 	 *		This 'name' string appears in the Scenes palette.
	 *		@param {davinci.ve.Context} context  Maqetta context object corresponding to davinci.ve.VisualEditor
	 * 
//FIXME: Inconsistent APIs: sometimes we pass node, other times ID
	 * selectScene(params)
	 *		A particular scene has been selected in the Scenes palette.
	 *		NOTE: Called from both page editor (widget helpers available) and review editor (widget helpers not available).
	 *		@param {object} params  Has following properties
	 *			params.sceneContainerNode - Node which contains the node with the given sceneId
	 *			params.sceneId - Unique ID for the selected scene. (Unique ID created by this SceneManager)
	 *		@returns {boolean}	Return true is a scene was selected
	 * 
//FIXME: Returns a node!
	 * getCurrentScene(sceneContainerNode)
	 * 		@param {Element} sceneContainerNode  Scene container node into which we are looking for current scene
	 *		If there is a currently active scene, return its sceneId, else return null.
	 *		@returns {string} Unique ID for the selected active scene. (Unique ID created by this SceneManager)
	 * 
	 * getInitialScenes(sceneContainerNode)
	 * 		@param {Element} sceneContainerNode  Scene container node into which we are looking for current scene
	 *		Returns an array of nodes holding all scenes that are flagged as the initial sceneId.
	 *		@returns {array} Array of Elements
	 * 
	 * getAllSceneContainers()
	 *		Returns all Elements in document that are direct parents of any scene nodes.
	 *		@returns {[Element]} Returns an array of elements
	 * 
	 * isSceneContainer(node)
	 *		Returns true if the given node is a scene container (i.e., it has children that represent a scene)
	 *		@param {Element} node  A DOM node in document
	 *		@returns {boolean} 
	 * 
	 * getSceneChildren(node)
	 *      Returns an array that lists the node's child nodes that represent "scenes"
	 *		@param {Element} node  A DOM node in document. (Presumably, a scene container node)
	 *		@returns {array} 	Returns an array of Elements, empty array if no scene children.
	 * 
	 * getSceneContainerForNode(node)
	 *      Returns the scene container parent node for the given node.
	 *		@param {Element} node  A DOM node in document. (Presumably, a scene node)
	 *		@returns {Element|node} 	Returns the scene container Element, or null if there is no scene container parent.
	 *
	 * This class must provide the following properties on the SceneManager instance object:
	 * 
	 * id {string} - A unique ID for this SceneManager. Used as the index into Maqetta's list of SceneManagers
	 * name {string} - Localized string that is name of this SceneManager. This string appears in Scenes palette.
	 * category {string} - A string unique to this SceneManager that must be used as the 'type' property on each scene
	 * 
	 */
	var DojoMobileViewSceneManager = function(context) {
		this.context = context;
		//FIXME: How to do nls? Maybe need to convert callback.js to AMD and leverage AMD's I18N?
		this.name = 'Dojo Mobile Views'; //FIXME: Needs to be localized
	};

	var containsClass = function(node, className) {
		return (" " + node.className + " ").indexOf(" "+ className + " ") != -1;
	};

	DojoMobileViewSceneManager.prototype = {
		id: 'DojoMobileViews',
		category: 'DojoMobileView',
		
		_viewAdded: function(parent, child){
			dojo.publish("/davinci/scene/added", [this, parent, child]);
		},
		
		// View has been deleted from the given parent
		_viewDeleted: function(parent){
			dojo.publish("/davinci/scene/removed", [this, parent]);
		},
		_viewSelectionChanged: function(parent, child){
			if(child && child.id){
				dojo.publish("/davinci/scene/selectionChanged", [this, child.id]);
			}
		},
		_reviewEditorSceneChange: function(docContext){
			if(docContext == this.context && docContext.declaredClass == 'davinci.review.editor.Context'){
				var win = docContext.getGlobal();
				// NOTE: Right now, at this point (and various other places in this file)
				// we are testing for presence of win["require"] to ensure that the
				// current review file is a live HTML file.
				// Might be better to test for .html file extension or something else.
				if(win && win["require"]){
					win["require"](["dijit/registry", "dojo/topic"], function(innerRegistry, innerTopic) {
						var views = docContext.rootNode.querySelectorAll('.mblView');
						for(var i=0; i<views.length; i++){
							var view = views[i];
							if(view.id){
								var viewDijit = innerRegistry.byId(view.id);
								if(viewDijit){
									// Listen for View and ScrollableView change (probably from touch gesture)
									viewDijit.onAfterTransitionIn = function(sm, viewId, moveTo, dir, transition, context, method){
										dojo.publish("/davinci/scene/selectionChanged", [sm, viewId]);
									}.bind(this, this, view.id);
									// Listen for SwapView changes (probably from flick gesture)
									innerTopic.subscribe('/dojox/mobile/viewChanged', function(newView){
										// If this routine in in middle of forcing the view change, don't try to update anything
										if(this._swapViewChangeHandle){
											return;
										}
										if(newView && newView.id){
											dojo.publish("/davinci/scene/selectionChanged", [this, newView.id]);
										}
									}.bind(this));
								}
							}
						}
					}.bind(this));
				}
			}
		},
		selectScene: function(params){
			var sceneId = params.sceneId;
			var win = this.context.getGlobal();
			var n;
			if(!win || !win["require"]){
				return;
			}
			var domNode = this.context.getDocument().getElementById(sceneId);
			var sceneSelected = null;
			if(this.context.declaredClass == 'davinci.ve.Context'){
				if(domNode){
					var widget = domNode._dvWidget;
					if(widget){
						var helper = widget.getHelper();
						if(helper && helper._updateVisibility){
							helper._updateVisibility(domNode);
							sceneSelected = sceneId;
						}
					}
				}
			}else if(this.context.declaredClass == 'davinci.review.editor.Context'){
				if(domNode){
					var node = domNode;
					var pnode = node.parentNode;
					var viewsToUpdate = [];
					var innerRegistry = win["require"]("dijit/registry"),
						innerTopic = win["require"]("dojo/topic");
					// See if this View or any ancestor View is not currently visible
					while (node.tagName != 'BODY'){
						if(node.style.display == "none" || node.getAttribute("selected") != "true"){
							viewsToUpdate.splice(0, 0, node);
						}else{
							for(var i=0;i<pnode.childNodes.length;i++){
								n=pnode.childNodes[i];
								if(n.nodeType==1 && containsClass(n, "mblView")){	//nodeType==1 is Element
									if(n!=node && (n.style.display != "none" || n.getAttribute("selected") == "true")){
										viewsToUpdate.splice(0, 0, node);
										break;
									}
								}
							}
						}
						node = pnode;
						pnode = node.parentNode;
					}
					for(var v=0;v<viewsToUpdate.length;v++){
						var viewNode = viewsToUpdate[v];
						if(viewNode && viewNode.id){
							var newView = innerRegistry.byId(viewNode.id);
							if(newView){
								if(newView.declaredClass.replace(/\./g, "/") == 'dojox/mobile/SwapView'){
									// For SwapView, we have to slide one-by-one from current SwapView
									// to the newly select SwapView
									var showingView = newView.getShowingView();
									var showingViewIndex, newViewIndex;
									var nodes = showingView.domNode.parentNode.childNodes;
									var allSwapViews = true;
									for(var j = 0; j < nodes.length; j++){
										n = nodes[j];
										if(n.nodeType == 1 && n.getAttribute('data-dojo-type').replace(/\./g, "/") != 'dojox/mobile/SwapView'){
											allSwapViews = false;
										}
										if(n.id == showingView.id){
											showingViewIndex = j;
										}
										if(n.id == newView.id){
											newViewIndex = j;
										}
									}
									if(allSwapViews){
										if(this._swapViewChangeHandle){
											// Extra careful to make sure there is only one listener
											innerTopic.unsubscribe(this._swapViewChangeHandle);
											this._swapViewChangeHandle = null;
										}
										if(typeof showingViewIndex == 'number' && typeof newViewIndex == 'number' && showingViewIndex !== newViewIndex){
											var dir = (newViewIndex > showingViewIndex) ? 1 : -1;
											var cv = showingView;	// cv = current view
											this._swapViewChangeHandle = innerTopic.subscribe("/dojox/mobile/viewChanged",function(v){
												if(v && v.id && v.id != newView.id && v.id != cv.id){
													cv = v;
													cv.goTo(dir);
												}else{
													innerTopic.unsubscribe(this._swapViewChangeHandle);
													this._swapViewChangeHandle = null;
													dojo.publish("/davinci/scene/selectionChanged", [this, newView.id]);
												}
											}.bind(this));
											cv.goTo(dir);
										}
									}else{
										newView.show();
									}
								}else if(newView.show){
									// for View and ScrollableView, call show()
									newView.show();
								}
							}
						}
					}
					sceneSelected = viewsToUpdate.length ? sceneId : null;
				}
			}
			if(sceneSelected){
				dojo.publish("/davinci/scene/selectionChanged", [this, sceneSelected]);
			}
			return sceneSelected;
		},

		getCurrentScene: function(sceneContainerNode){
			if(!sceneContainerNode){
				return;
			}
			var currentScene, viewDijit;
			var win = this.context.getGlobal();
			if(!win || !win["require"]){
				return;
			}
			var innerRegistry = win["require"]("dijit/registry");
			var elems = sceneContainerNode.querySelectorAll('.mblView');
			for(var i=0; i<elems.length; i++){
				var elem = elems[i];
				if(elem.parentNode != sceneContainerNode){
					continue;
				}
				viewDijit = null;
				if(this.context.declaredClass == 'davinci.ve.Context'){
					viewDijit = (elem._dvWidget && elem._dvWidget.dijitWidget);
				}else if(this.context.declaredClass == 'davinci.review.editor.Context'){
					viewDijit = elem.id ? innerRegistry.byId(elem.id) : null;
				}
				if(viewDijit && viewDijit.getShowingView){
					var showingView = viewDijit.getShowingView();
					if(showingView && showingView.domNode && showingView.domNode.id){
						currentScene = showingView.domNode;
						break;
					}
				}
			}
			return currentScene;
		},
		getInitialScenes: function(sceneContainerNode){
			var arr = [];
			if(!sceneContainerNode){
				return arr;
			}
			var currentScene, viewDijit;
			var win = this.context.getGlobal();
			if(!win || !win["require"]){
				return;
			}
			var innerRegistry = win["require"]("dijit/registry");
			var elems = sceneContainerNode.querySelectorAll('.mblView');
			for(var i=0; i<elems.length; i++){
				var elem = elems[i];
				if(elem.parentNode != sceneContainerNode){
					continue;
				}
				viewDijit = null;
				if(this.context.declaredClass == 'davinci.ve.Context'){
					viewDijit = (elem._dvWidget && elem._dvWidget.dijitWidget);
				}else if(this.context.declaredClass == 'davinci.review.editor.Context'){
					viewDijit = elem.id ? innerRegistry.byId(elem.id) : null;
				}
				if(viewDijit && viewDijit.selected){
					arr.push(viewDijit.domNode);
				}
			}
			return arr;
		},
		getAllSceneContainers: function(){
			var allSceneContainers = [];
			if(!this.context || !this.context.rootNode){
				return allSceneContainers;
			}
 			var rootNode = this.context.rootNode;
			var allViews = rootNode.querySelectorAll('.mblView');
			for(var i=0; i<allViews.length; i++){
				var view = allViews[i];
				var pn = view.parentNode;
				if(pn && allSceneContainers.indexOf(pn) < 0){
					allSceneContainers.push(pn);
				}
			}
			return allSceneContainers;
		},
		isSceneContainer: function(node){
			if(!this.context || !node){
				return false;
			}
			var win = this.context.getGlobal();
			if(!win || !win["require"]){
				return false;
			}
			return dojo.some(node.childNodes, function(child) {
				return child.nodeType==1 && containsClass(child, "mblView");
			});
		},
		getSceneChildren: function(node){
			if(!this.context || !node){
				return [];
			}
			var win = this.context.getGlobal();
			if(!win || !win["require"]){
				return [];
			}
			return dojo.filter(node.childNodes, function(child) {
				return child.nodeType==1 && containsClass(child, "mblView");
			});
		},
		getSceneContainerForNode: function(node){
			if(!this.context || !node){
				return false;
			}
			return (node.tagName == 'BODY') ? null : node.parentNode;
		}
	};

    return {
//        init: function(args) {
//        },
		onDocInit: function(context){
	
			if(context.registerSceneManager){
				var sm = new DojoMobileViewSceneManager(context);
				context.registerSceneManager(sm);
				dojo.subscribe('/davinci/ui/context/statesLoaded', function(docContext){
					sm._reviewEditorSceneChange(docContext);
				});
			}
		},
		/**
		 * Checks if the event attribute is required for  widget to display poperly in the visual 
		 * designer.
		 * 
		 * For example, to support cross domain JSONP dojox/io/xhrScriptPlugin adds a hidden iframe
		 * to the document with a onload event handler that invokes the javascript to achive the 
		 * cross domain invocation of the service. If we remove the onload handler from the iframe 
		 * any widget that uses a data store that accesses a cross doain service will not display
		 * with the data in the desiger.
		 * 
		 * @param {DOM Node attribute object} 
		 * 
		 * @return {boolean}  true if the event is required for the node, false if not.
		 */
		requiredEventAttribute: function(attribute){

				if (attribute.nodeValue.indexOf('dojox.io.scriptFrame._loaded') > -1) {
					return true;
				} else {
					return false;
				}
		}
        
//        onFirstAdd: function(type, context) {
//        },
//        
//        onAdd: function(type, context) {
//        },
//        
//        onLastRemove: function(type, context) {
//        },
//        
//        onRemove: function(type, context) {
//        }
    };

});
