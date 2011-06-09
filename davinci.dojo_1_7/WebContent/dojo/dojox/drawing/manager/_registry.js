define(["dojo","../../drawing"],function(dojo){
	
	// TODOC: pubilc APIs
	
	dojo.getObject("drawing.stencil", true, dojox);
	var _registered = {
		tool:{},
		stencil:{},
		drawing:{},
		plugin:{},
		button:{}
	};
	dojox.drawing.register = function(item, type){
		if(type=="drawing"){
			_registered.drawing[item.id] = item;
		}else if(type=="tool"){
			_registered.tool[item.name] = item;
		}else if(type=="stencil"){
			_registered.stencil[item.name] = item;
		}else if(type=="plugin"){
			_registered.plugin[item.name] = item;
		}else if(type=="button"){
			_registered.button[item.toolType] = item;
		}
	};
	
	dojox.drawing.getRegistered = function(type, id){
		return id ? _registered[type][id] : _registered[type];
	}
	
});