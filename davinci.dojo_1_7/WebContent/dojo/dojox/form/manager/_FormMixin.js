/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/manager/_FormMixin",["dojo","dijit","dojox","dojox/form/manager/_Mixin"],function(_1,_2,_3){
_1.getObject("dojox.form.manager._FormMixin",1);
(function(){
var fm=_3.form.manager,aa=fm.actionAdapter;
_1.declare("dojox.form.manager._FormMixin",null,{name:"",action:"",method:"",encType:"","accept-charset":"",accept:"",target:"",startup:function(){
this.isForm=this.domNode.tagName.toLowerCase()=="form";
if(this.isForm){
this.connect(this.domNode,"onreset","_onReset");
this.connect(this.domNode,"onsubmit","_onSubmit");
}
this.inherited(arguments);
},_onReset:function(_4){
var _5={returnValue:true,preventDefault:function(){
this.returnValue=false;
},stopPropagation:function(){
},currentTarget:_4.currentTarget,target:_4.target};
if(!(this.onReset(_5)===false)&&_5.returnValue){
this.reset();
}
_1.stopEvent(_4);
return false;
},onReset:function(){
return true;
},reset:function(){
this.inspectFormWidgets(aa(function(_6,_7){
if(_7.reset){
_7.reset();
}
}));
if(this.isForm){
this.domNode.reset();
}
return this;
},_onSubmit:function(_8){
if(this.onSubmit(_8)===false){
_1.stopEvent(_8);
}
},onSubmit:function(){
return this.isValid();
},submit:function(){
if(this.isForm){
if(!(this.onSubmit()===false)){
this.domNode.submit();
}
}
},isValid:function(){
for(var _9 in this.formWidgets){
var _a=false;
aa(function(_b,_c){
if(!_c.get("disabled")&&_c.isValid&&!_c.isValid()){
_a=true;
}
}).call(this,null,this.formWidgets[_9].widget);
if(_a){
return false;
}
}
return true;
},validate:function(){
var _d=true,_e=this.formWidgets,_f=false,_10;
for(_10 in _e){
aa(function(_11,_12){
_12._hasBeenBlurred=true;
var _13=_12.disabled||!_12.validate||_12.validate();
if(!_13&&!_f){
_1.window.scrollIntoView(_12.containerNode||_12.domNode);
_12.focus();
_f=true;
}
_d=_d&&_13;
}).call(this,null,_e[_10].widget);
}
return _d;
}});
})();
return _1.getObject("dojox.form.manager._FormMixin");
});
require(["dojox/form/manager/_FormMixin"]);
