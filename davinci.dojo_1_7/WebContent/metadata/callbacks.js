(function() {
	
	function ViewSceneManager() {}
	
	ViewSceneManager.prototype._stub = function(a, b, c){
		debugger;
	};
	
	ViewSceneManager.prototype.addScene = function(parent, child){ this._stub(parent, child); }
	ViewSceneManager.prototype.deleteScene = function(parent, child){ this._stub(child); }
	ViewSceneManager.prototype.selectScene = function(parent, child){ this._stub(parent, child); }
	ViewSceneManager.prototype.getSelectedScene = function(parent, child){ this._stub(parent); }
	ViewSceneManager.prototype.getSceneParent = function(parent, child){ this._stub(child); }
	ViewSceneManager.prototype.getSceneChildren = function(parent, child){ this._stub(parent); }

    return {
//        init: function(args) {
//        },
        
        onFirstAdd: function(type, context) {
        	debugger;
        	context.registerSceneManager('DojoMobileViews', new ViewSceneManager);
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
