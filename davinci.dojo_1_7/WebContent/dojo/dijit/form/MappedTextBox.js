/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/MappedTextBox",["dojo/_base/kernel","..","./ValidationTextBox","dojo/_base/declare","dojo/_base/html"],function(_1,_2){
_1.declare("dijit.form.MappedTextBox",_2.form.ValidationTextBox,{postMixInProperties:function(){
this.inherited(arguments);
this.nameAttrSetting="";
},_setNameAttr:null,serialize:function(_3,_4){
return _3.toString?_3.toString():"";
},toString:function(){
var _5=this.filter(this.get("value"));
return _5!=null?(typeof _5=="string"?_5:this.serialize(_5,this.constraints)):"";
},validate:function(){
this.valueNode.value=this.toString();
return this.inherited(arguments);
},buildRendering:function(){
this.inherited(arguments);
this.valueNode=_1.place("<input type='hidden'"+(this.name?" name='"+this.name.replace(/'/g,"&quot;")+"'":"")+"/>",this.textbox,"after");
},reset:function(){
this.valueNode.value="";
this.inherited(arguments);
}});
return _2.form.MappedTextBox;
});
