/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/Form",["dojo/_base/kernel","..","../_Widget","../_TemplatedMixin","./_FormMixin","../layout/_ContentPaneResizeMixin","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/sniff"],function(_1,_2){
_1.declare("dijit.form.Form",[_2._Widget,_2._TemplatedMixin,_2.form._FormMixin,_2.layout._ContentPaneResizeMixin],{name:"",action:"",method:"",encType:"","accept-charset":"",accept:"",target:"",templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit' ${!nameAttrSetting}></form>",postMixInProperties:function(){
this.nameAttrSetting=this.name?("name='"+this.name+"'"):"";
this.inherited(arguments);
},execute:function(_3){
},onExecute:function(){
},_setEncTypeAttr:function(_4){
this.encType=_4;
_1.attr(this.domNode,"encType",_4);
if(_1.isIE){
this.domNode.encoding=_4;
}
},reset:function(e){
var _5={returnValue:true,preventDefault:function(){
this.returnValue=false;
},stopPropagation:function(){
},currentTarget:e?e.target:this.domNode,target:e?e.target:this.domNode};
if(!(this.onReset(_5)===false)&&_5.returnValue){
this.inherited(arguments,[]);
}
},onReset:function(e){
return true;
},_onReset:function(e){
this.reset(e);
_1.stopEvent(e);
return false;
},_onSubmit:function(e){
var fp=_2.form.Form.prototype;
if(this.execute!=fp.execute||this.onExecute!=fp.onExecute){
_1.deprecated("dijit.form.Form:execute()/onExecute() are deprecated. Use onSubmit() instead.","","2.0");
this.onExecute();
this.execute(this.getValues());
}
if(this.onSubmit(e)===false){
_1.stopEvent(e);
}
},onSubmit:function(e){
return this.isValid();
},submit:function(){
if(!(this.onSubmit()===false)){
this.containerNode.submit();
}
}});
return _2.form.Form;
});
