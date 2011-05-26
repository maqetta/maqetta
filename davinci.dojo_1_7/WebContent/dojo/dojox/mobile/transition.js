define(["dojo/_base/array","dojo/_base/html","dojo/DeferredList"], function(darray, dhtml,DeferredList){
	return function(from, to, options){
		var rev = (options && options.reverse) ? " mblReverse" : "";
		if(!options || !options.transition){
			dojo.style(from,"display","none");
			dojo.style(to, "display", "");
		}else{
			var defs=[];
			dojo.style(from, "display", ""); 
			dojo.style(to, "display", "");
			if (from){
				var fromDef = new dojo.Deferred();
				var fromHandle = dojo.connect(from, "webkitAnimationEnd", function(){
					dojo.style(from,"display","none");
					//remove the animation classes in the node
					dojo.forEach([options.transition,"mblIn","mblOut","mblReverse"], function(item){
						dojo.removeClass(from, item);
					});
					
					dojo.disconnect(fromHandle);		
					fromDef.resolve(from);
				}); 
				defs.push(fromDef);
			}
			
			var toDef = new dojo.Deferred();
			var toHandle= dojo.connect(to, "webkitAnimationEnd", function(){
				//remove the animation classes in the node
				dojo.forEach([options.transition,"mblIn","mblOut","mblReverse"], function(item){
					dojo.removeClass(to, item);
				});
				
				dojo.disconnect(toHandle);		
				toDef.resolve(to);
			}); 

			defs.push(toDef);
			options.transition = "mbl"+(options.transition.charAt(0).toUpperCase() + options.transition.substring(1));

			dojo.addClass(from, options.transition + " mblOut" + rev);
			dojo.addClass(to, options.transition + " mblIn" + rev);

			return new dojo.DeferredList(defs);
			
		}
	}
});
