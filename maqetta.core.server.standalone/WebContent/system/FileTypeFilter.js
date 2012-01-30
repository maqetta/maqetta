define(["dojo/_base/declare",
        "system/resource"
        

],function(declare, Resource){


	return declare("system.resource.FileTypeFilter",null,{
	    constructor: function(types){
	    	Resource.types=types.split(",");
	    },
	    filterList: function(list)
	    {
			var newList=[];
			for (var i=0;i<list.length;i++)
			{
				var resource=list[i];
				if (resource.elementType!="File"){
					newList.push(resource);
				}
				else
				{
					for (var j=0;j<Resource.types.length;j++)
					{
						if (resource.getExtension()==Resource.types[j] || Resource.types[j]=="*")
						{
							newList.push(resource);
							break;
						}
					}
				}
			}
			return newList;
	    }
	});
});