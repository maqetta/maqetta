// *** Fricking Eolas.  This is here to get around the Eolas issue.  Sigh. ***************
dojox.embed.Flash.place = function(kwArgs, node){
	var o = dojox.embed.Flash.__ie_markup__(kwArgs);
	node=dojo.byId(node);

	if(!node){
		node=dojo.doc.createElement("div");
		node.id=o.id+"-container";
		dojo.body().appendChild(node);
	}
	
	if(o){
		node.innerHTML = o.markup;
		//return window[o.id];
		return o.id;
	}
	return null;
}
dojox.embed.Flash.onInitialize();
