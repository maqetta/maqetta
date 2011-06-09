define(["dojo","dijit","dojox", "dojo/cache","dojo/fx","dojox/json/ref","dojo/parser","./scene","dojox/mobile/transition","dojo/on"],function(dojo,dijit,dijox,cache,fx,jsonRef,parser,sceneCtor,transition,listen){
	var Application = dojo.declare([sceneCtor], {
		constructor: function(params){
			this.scenes={};
			if(params.stores){
			    //create stores in the configuration.
			    for (var item in params.stores){
			        if(item.charAt(0)!=="_"){//skip the private properties
			            var type = params.stores[item].type? params.stores[item].type : "dojo.store.Memory";
			            var config = {};
			            if(params.stores[item].params){
			                dojo.mixin(config, params.stores[item].params);
			            }
			            var storeCtor = dojo.getObject(type);
			            if(config.data && dojo.isString(config.data)){
			                //get the object specified by string value of data property
			                //cannot assign object literal or reference to data property
			                //because json.ref will generate __parent to point to its parent
			                //and will cause infinitive loop when creating StatefulModel.
			                config.data = dojo.getObject(config.data);
			            }
			            params.stores[item].store = new storeCtor(config);
			        }
			    }
			}

		},
		templateString: "<div></div>",
		selectedChild: null,
		baseClass: "application mblView",
		defaultViewType: sceneCtor,
		buildRendering: function(){
			if (this.srcNodeRef===dojo.body()){
				this.srcNodeRef = dojo.create("DIV",{},dojo.body());
			}
			this.inherited(arguments);
		}
	});
	
	function generateApp(config,node,appSchema,validate){

		//console.log("config.modules: ", config.modules);
		var modules = config.modules.concat(config.dependencies);

		if (config.template){
			//console.log("config.template: ", config.template);
			modules.push("dojo/text!" + "app/" + config.template);
		}
		//console.log("modules: ", modules);	

		require(modules, function(){
			var modules=[Application];
			for(var i=0;i<config.modules.length;i++){
				modules.push(arguments[i]);
			}

			if (config.template){
				var ext = {
					templateString: arguments[arguments.length-1] 
				}	
			}
			App = dojo.declare(modules,ext);

			dojo.ready(function(){
				app = App(config,node || dojo.body());
				app.startup();
			});
		});
	}


	return function(config,node){
		if (!config){
			throw Error("App Config Missing");
		}

		
		if (config.validate){
			require(["dojox/json/schema","dojox/json/ref","dojo/text!dojox/application/schema/application.json"],function(schema,appSchema){
				schema = dojox.json.ref.resolveJson(schema);	
				if (schema.validate(config,appSchema)){
					generateApp(config,node);
				}	
			});
		

		}else{
			generateApp(config,node);
		}
	}
});
