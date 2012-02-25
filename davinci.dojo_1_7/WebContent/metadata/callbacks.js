(function() {
	
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
	 * selectScene(params)
	 *		A particular scene has been selected in the Scenes palette.
	 *		@param {object} params  Has following properties
	 *			params.sceneId - Unique ID for the selected scene. (Unique ID created by this SceneManager)
	 * 
	 * getCurrentScene()
	 *		If there is a currently active scene, return its sceneId, else return null.
	 *		@returns {string} Unique ID for the selected active scene. (Unique ID created by this SceneManager)
	 * 
	 * getAllScenes()
	 *		Returns a potentially nested array of all current scenes managed by this SceneManager.
	 *		@returns {[object]} retArray  Array of top-level scenes, where each scene is described
	 *					by an object with these properties
	 *			sceneId {string} - a document-unique ID for this scene
	 *			name {string} - the string for this scene that will appear in Scenes palette
	 *			type {string} - must be set to the "category" property for this SceneManager (see properties below)
	 *			parentSceneId {string}- if this scene is not top-level, then this must be the sceneId of its parent scene
	 *			children {[object]} - array of children scenes
	 * 
	 * hideAppStates()
	 *		Returns true if the app should not show "application states". 
	 *		Usually, library returns true only if it offers an alternate notion of scenes.
	 *		@returns {boolean} 
	 *
	 * This class must provide the following properties on the SceneManager instance object:
	 * 
	 * id {string} - A unique ID for this SceneManager. Used as the index into Maqetta's list of SceneManagers
	 * name {string} - Localized string that is name of this SceneManager. This string appears in Scenes palette.
	 * category {string} - A string unique to this SceneManager that must be used as the 'type' property on each scene
	 * 
	 */
	function DojoMobileViewSceneManager(context) {
		this.context = context;
		//FIXME: How to do nls? Maybe need to convert callback.js to AMD and leverage AMD's I18N?
		this.name = 'Dojo Mobile Views'; //FIXME: Needs to be localized
	}
	
	DojoMobileViewSceneManager.prototype.id = 'DojoMobileViews';
	DojoMobileViewSceneManager.prototype.category = 'DojoMobileView';
		
	DojoMobileViewSceneManager.prototype._viewAdded = function(parent, child){
		dojo.publish("/davinci/scene/added", [this, parent, child]);
	};
	// View has been deleted from the given parent
	DojoMobileViewSceneManager.prototype._viewDeleted = function(parent){
		dojo.publish("/davinci/scene/removed", [this, parent]);
	};
	DojoMobileViewSceneManager.prototype._viewSelectionChanged = function(parent, child){
		if(child && child.id){
			dojo.publish("/davinci/scene/selectionChanged", [this, child.id]);
		}
	};
	DojoMobileViewSceneManager.prototype.selectScene = function(params){
		var sceneId = params.sceneId;
		var dj = this.context.getDojo();
		var node = dj.byId(sceneId);
		if(node){
			var widget = node._dvWidget;
			if(widget){
				var helper = widget.getHelper();
				if(helper && helper._updateVisibility){
					helper._updateVisibility(node);
				}
			}
		}
		var dj = this.context.select(widget);
	};
	DojoMobileViewSceneManager.prototype.getCurrentScene = function(){
		var doc = this.context.getDocument();
		var elems = doc.querySelectorAll('.mblView');
		for(var i=0; i<elems.length; i++){
			var elem = elems[i];
			var viewDijit = (elem._dvWidget && elem._dvWidget.dijitWidget);
			if(viewDijit && viewDijit.getShowingView){
				var showingView = viewDijit.getShowingView();
				if(showingView && showingView.domNode && showingView.domNode.id){
					return showingView.domNode.id;
				}
			}
		}
		return null;
	};
	DojoMobileViewSceneManager.prototype.getAllScenes = function(){
		var dj = this.context.getDojo();
		var scenes = [];
		var flattenedScenes = [];
		var views = dj.query('.mblView');
		for(var i=0; i<views.length; i++){
			var view = views[i];
			var o = { sceneId:view.id, name:view.id, type:this.category };
			if(dojo.hasClass(view.parentNode, 'mblView')){
				o.parentNodeId = view.parentNode.id;		// temporary property, removed below
			}
			scenes.push(o);
			flattenedScenes.push(o);
		}
		// The fetch operation above delivers a simple array of Views.
		// We need to return a data structure that reflects the hierarchy of Views,
		// so massage the scenes array so that nested Views are moved under the correct parent View.
		var idx = 0;
		while(idx < scenes.length){
			var scene = scenes[idx];
			parentNodeId = scene.parentNodeId;
			if(parentNodeId){
				delete scene.parentNodeId;	// remove temporary property
				var spliced = false;
				for(var j=0; j<flattenedScenes.length; j++){
					if(flattenedScenes[j].name === parentNodeId){
						if(!flattenedScenes[j].children){
							flattenedScenes[j].children = [];
						}
						scene.parentSceneId = flattenedScenes[j].sceneId;
						flattenedScenes[j].children.push(scene);
						scenes.splice(idx, 1);
						spliced = true;
						break;
					}
				}
				if(!spliced){
					console.error('could not find parentNodeId='+parentNodeId);
					idx++;
				}
			}else{
				idx++;
			}
		}
		return scenes;
	};
	DojoMobileViewSceneManager.prototype.hideAppStates = function(){
		var device = (this.context && this.context._visualEditor && this.context._visualEditor.getDevice) ?
				this.context._visualEditor.getDevice() : "";
		return (!device || device === '' || device === 'none') ? false : true;
	};

    return {
//        init: function(args) {
//        },
		onDocInit: function(context){
			context.registerSceneManager(new DojoMobileViewSceneManager(context));
//		},
        
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
        }
    };

})();
