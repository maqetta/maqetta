/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/Inline",["dojo/_base/kernel","dojo/_base/lang","./_base","dijit/_Widget"],function(_1,_2,dd,_3){
dd.Inline=_1.extend(function(_4,_5){
this.create(_4,_5);
},_3.prototype,{context:null,render:function(_6){
this.context=_6||this.context;
this.postMixInProperties();
_1.query("*",this.domNode).orphan();
this.domNode.innerHTML=this.template.render(this.context);
},declaredClass:"dojox.dtl.Inline",buildRendering:function(){
var _7=this.domNode=document.createElement("div");
var _8=this.srcNodeRef;
if(_8.parentNode){
_8.parentNode.replaceChild(_7,_8);
}
this.template=new dd.Template(_1.trim(_8.text),true);
this.render();
},postMixInProperties:function(){
this.context=(this.context.get===dd._Context.prototype.get)?this.context:new dd._Context(this.context);
}});
return dojox.dtl.Inline;
});
