
dojo.declare("system.resource.FileTypeFilter",null,{
    constructor: function(types)
    {
	system.resource.types=types.split(",");
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
				for (var j=0;j<system.resource.types.length;j++)
				{
					if (resource.getExtension()==system.resource.types[j] || system.resource.types[j]=="*")
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