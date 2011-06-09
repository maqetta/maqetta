define(["dojo","dojox/mvc/StatefulModel"], function(dojo){
	return function(config, parent){
                //load models here. create dojox.newStatefulModel 
                //using the configuration data for models
	        var loadedModels = {};
	        if(parent){
	            dojo.mixin(loadedModels, parent);
	        }
	        if(config){
                    for(var item in config){
                        if(item.charAt(0)!=="_"){
                            var params = config[item].params ? config[item].params:{};
                            var options = {
                                "store": params.store.store,
                                "query": params.store.query ? params.store.query : {}
                            };
                            
                            //TODO improve performance of loading at here
                            // do not wait for the models to be created.
                            loadedModels[item] = dojo.when(dojox.mvc.newStatefulModel(options), function(model){return model});
                        }
                    }
	        }
                return loadedModels;
	}
});
