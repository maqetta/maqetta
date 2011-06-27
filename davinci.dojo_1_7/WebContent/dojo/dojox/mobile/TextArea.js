/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/TextArea",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","./TextBox"],function(_1,_2,_3,_4){
return _1.declare("dojox.mobile.TextArea",dojox.mobile.TextBox,{baseClass:"mblTextArea",postMixInProperties:function(){
if(!this.value&&this.srcNodeRef){
this.value=this.srcNodeRef.value;
}
this.inherited(arguments);
},buildRendering:function(){
if(!this.srcNodeRef){
this.srcNodeRef=_1.create("textarea",{});
}
this.inherited(arguments);
}});
});
