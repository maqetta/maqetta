(function() {
	
	function DojoMobileViewSceneManager(context) {
		debugger;
		this.context = context;
		//FIXME: How to do nls? Maybe need to convert callback.js to AMD and leverage AMD's I18N?
		this.name = 'Dojo Mobile Views'; //FIXME: Needs to be localized
		this.category = 'DojoMobileView';
	}
	
	DojoMobileViewSceneManager.prototype.id = 'DojoMobileViews';
	DojoMobileViewSceneManager.prototype.title = 'Dojo Mobile Views';	//FIXME: Need to be globalized
		
	DojoMobileViewSceneManager.prototype.viewAdded = function(parent, child){
		dojo.publish("/davinci/scene/added", [DojoMobileViewSceneManager, parent, child]);
	};
	// View has been deleted from the given parent
	DojoMobileViewSceneManager.prototype.viewDeleted = function(parent){
		dojo.publish("/davinci/scene/removed", [DojoMobileViewSceneManager, parent, child]);
	};
	DojoMobileViewSceneManager.prototype.viewSelectionChanged = function(parent, child){
		dojo.publish("/davinci/scene/selectionChanged", [DojoMobileViewSceneManager, parent, child]);
	};
	DojoMobileViewSceneManager.prototype.getAllScenes = function(){
		debugger;
		var dj = this.context.getDojo();
		var scenes = [];
		var views = dj.query('.mblView');
		views.forEach(function(view){
			if(view.id){
				scenes.push({ name:view.id, type:'DojoMobileView'});
			}
		});
		return scenes;
	};

    return {
//        init: function(args) {
//        },
        
        onFirstAdd: function(type, context) {
        	debugger;
        	//FIXME: How to do nls? Maybe need to convert callback.js to AMD and leverage AMD's I18N?
        	context.registerSceneManager(new DojoMobileViewSceneManager(context));
            return;
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
