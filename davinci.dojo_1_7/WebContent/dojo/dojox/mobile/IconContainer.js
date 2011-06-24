/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dojox/mobile/IconContainer",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","./common","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./View","./Heading","./_ItemBase","./IconItem"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a){
return _1.declare("dojox.mobile.IconContainer",[dijit._WidgetBase,dijit._Container,dijit._Contained],{defaultIcon:"",transition:"below",pressedIconOpacity:0.4,iconBase:"",iconPos:"",back:"Home",label:"My Application",single:false,buildRendering:function(){
this.domNode=this.containerNode=this.srcNodeRef||_1.doc.createElement("UL");
this.domNode.className="mblIconContainer";
var t=this._terminator=_1.create("LI");
t.className="mblIconItemTerminator";
t.innerHTML="&nbsp;";
this.domNode.appendChild(t);
},_setupSubNodes:function(ul){
_1.forEach(this.getChildren(),function(w){
if(this.single){
w.subNode.firstChild.style.display="none";
}
ul.appendChild(w.subNode);
});
},startup:function(){
if(this._started){
return;
}
if(this.transition==="below"){
this._setupSubNodes(this.domNode);
}else{
var _b=new dojox.mobile.View({id:this.id+"_mblApplView"});
var _c=this;
_b.onAfterTransitionIn=function(_d,_e,_f,_10,_11){
_c._opening._open_1();
};
_b.domNode.style.visibility="hidden";
var _12=_b._heading=new dojox.mobile.Heading({back:this._cv(this.back),label:this._cv(this.label),moveTo:this.domNode.parentNode.id,transition:this.transition});
_b.addChild(_12);
var ul=_1.doc.createElement("UL");
ul.className="mblIconContainer";
ul.style.marginTop="0px";
this._setupSubNodes(ul);
_b.domNode.appendChild(ul);
_1.doc.body.appendChild(_b.domNode);
_12.startup();
}
this.inherited(arguments);
},closeAll:function(){
var len=this.domNode.childNodes.length,_13,w;
for(var i=0;i<len;i++){
var _13=this.domNode.childNodes[i];
if(_13.nodeType!==1){
continue;
}
if(_13===this._terminator){
break;
}
var w=dijit.byNode(_13);
w.containerNode.parentNode.style.display="none";
_1.style(w.iconNode,"opacity",1);
}
},addChild:function(_14){
this.domNode.insertBefore(_14.domNode,this._terminator);
_14.transition=this.transition;
if(this.transition==="below"){
this.domNode.appendChild(_14.subNode);
}
_14.inheritParams();
_14._setIconAttr(_14.icon);
}});
});
