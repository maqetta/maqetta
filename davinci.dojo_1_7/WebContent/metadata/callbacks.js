(function() {
	
	function DojoMobileViewSceneManager(context) {
		debugger;
		this.context = context;
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
		var views = dj.query('.mblView');
		return views;
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
