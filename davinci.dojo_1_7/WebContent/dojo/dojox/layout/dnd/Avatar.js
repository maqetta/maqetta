/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/dnd/Avatar",["dojo","dijit","dojox","dojo/dnd/Avatar","dojo/dnd/common"],function(_1,_2,_3){
_1.getObject("dojox.layout.dnd.Avatar",1);
_1.declare("dojox.layout.dnd.Avatar",_1.dnd.Avatar,{constructor:function(_4,_5){
this.opacity=_5||0.9;
},construct:function(){
var _6=this.manager.source,_7=_6.creator?_6._normalizedCreator(_6.getItem(this.manager.nodes[0].id).data,"avatar").node:this.manager.nodes[0].cloneNode(true);
_1.addClass(_7,"dojoDndAvatar");
_7.id=_1.dnd.getUniqueId();
_7.style.position="absolute";
_7.style.zIndex=1999;
_7.style.margin="0px";
_7.style.width=_1.marginBox(_6.node).w+"px";
_1.style(_7,"opacity",this.opacity);
this.node=_7;
},update:function(){
_1.toggleClass(this.node,"dojoDndAvatarCanDrop",this.manager.canDropFlag);
},_generateText:function(){
}});
return _1.getObject("dojox.layout.dnd.Avatar");
});
require(["dojox/layout/dnd/Avatar"]);
