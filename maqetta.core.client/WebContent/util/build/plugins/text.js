define(["dojo/json"], function(json){
	return {
		start:function(
			mid,
			referenceModule,
			bc
		){
			// mid may contain a pragma (e.g. "!strip"); remove
			mid = mid.split("!")[0];

			var textPlugin = bc.amdResources["dojo/text"],
			moduleInfo = bc.getSrcModuleInfo(mid, referenceModule, true),
			textResource = bc.resources[moduleInfo.url];

			if (!textPlugin){
				throw new Error("text! plugin missing");
			}
			if (!textResource){
				throw new Error("text resource (" + moduleInfo.url + ") missing");
			}

			var result = [textPlugin];
			if(bc.internStrings && !bc.internSkip(moduleInfo.mid, referenceModule)){
				result.push({
					module:textResource,
					pid:moduleInfo.pid,
					mid:moduleInfo.mid,
					deps:[],
					getText:function(){
						return json.stringify(this.module.text+"");
					},
					internStrings:function(){
						return ["url:" + this.mid, json.stringify(this.module.text+"")];
					}
				});
			}
			return result;
		}
	};
});
