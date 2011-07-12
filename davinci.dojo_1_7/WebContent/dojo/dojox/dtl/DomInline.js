/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/DomInline",["dojo/_base/kernel","dojo/_base/lang","./dom","dijit/_Widget"],function(_1,_2,_3,_4){
dojox.dtl.DomInline=_1.extend(function(_5,_6){
this.create(_5,_6);
},_4.prototype,{context:null,render:function(_7){
this.context=_7||this.context;
this.postMixInProperties();
var _8=this.template.render(this.context).getRootNode();
if(_8!=this.containerNode){
this.containerNode.parentNode.replaceChild(_8,this.containerNode);
this.containerNode=_8;
}
},declaredClass:"dojox.dtl.Inline",buildRendering:function(){
var _9=this.domNode=document.createElement("div");
this.containerNode=_9.appendChild(document.createElement("div"));
var _a=this.srcNodeRef;
if(_a.parentNode){
_a.parentNode.replaceChild(_9,_a);
}
this.template=new dojox.dtl.DomTemplate(_1.trim(_a.text),true);
this.render();
},postMixInProperties:function(){
this.context=(this.context.get===dojox.dtl._Context.prototype.get)?this.context:new dojox.dtl.Context(this.context);
}});
return dojox.dtl.DomInline;
});
