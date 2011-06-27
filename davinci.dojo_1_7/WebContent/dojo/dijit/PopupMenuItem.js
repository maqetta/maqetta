/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/PopupMenuItem",["dojo/_base/kernel",".","./MenuItem","./hccss","dojo/_base/declare","dojo/_base/html","dojo/_base/window","dojo/query"],function(_1,_2){
_1.declare("dijit.PopupMenuItem",_2.MenuItem,{_fillContent:function(){
if(this.srcNodeRef){
var _3=_1.query("*",this.srcNodeRef);
_2.PopupMenuItem.superclass._fillContent.call(this,_3[0]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(!this.popup){
var _4=_1.query("[widgetId]",this.dropDownContainer)[0];
this.popup=_2.byNode(_4);
}
_1.body().appendChild(this.popup.domNode);
this.popup.startup();
this.popup.domNode.style.display="none";
if(this.arrowWrapper){
_1.style(this.arrowWrapper,"visibility","");
}
this.focusNode.setAttribute("aria-haspopup","true");
},destroyDescendants:function(){
if(this.popup){
if(!this.popup._destroyed){
this.popup.destroyRecursive();
}
delete this.popup;
}
this.inherited(arguments);
}});
return _2.PopupMenuItem;
});
