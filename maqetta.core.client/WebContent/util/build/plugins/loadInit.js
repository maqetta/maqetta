define(function() {
	return {
		start:function(
			mid,
			referenceModule,
			bc
		){
			return bc.amdResources[bc.getSrcModuleInfo(mid, referenceModule).mid];
		}
	};
});
