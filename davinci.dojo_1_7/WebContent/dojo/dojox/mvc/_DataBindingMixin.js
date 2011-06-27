/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mvc/_DataBindingMixin",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/array","dojo/_base/declare","dijit/_base/manager"],function(_1,_2,_3,_4,_5){
return _4("dojox.mvc._DataBindingMixin",null,{ref:null,isValid:function(){
return this.get("binding")?this.get("binding").get("valid"):true;
},_dbstartup:function(){
if(this._databound){
return;
}
this._unwatchArray(this._viewWatchHandles);
this._viewWatchHandles=[this.watch("ref",function(_6,_7,_8){
if(this._databound){
this._setupBinding();
}
}),this.watch("value",function(_9,_a,_b){
if(this._databound){
var _c=this.get("binding");
if(_c){
_c.set("value",_b);
}
}
})];
this._beingBound=true;
this._setupBinding();
delete this._beingBound;
this._databound=true;
},_setupBinding:function(_d){
if(!this.ref){
return;
}
var _e=this.ref,pw,pb,_f;
if(_e&&_2.isFunction(_e.toPlainObject)){
_f=_e;
}else{
if(/^\s*expr\s*:\s*/.test(_e)){
_e=_e.replace(/^\s*expr\s*:\s*/,"");
_f=_1.getObject(_e);
}else{
if(/^\s*rel\s*:\s*/.test(_e)){
_e=_e.replace(/^\s*rel\s*:\s*/,"");
_d=_d||this._getParentBindingFromDOM();
if(_d){
_f=_1.getObject(_e,false,_d);
}
}else{
if(/^\s*widget\s*:\s*/.test(_e)){
_e=_e.replace(/^\s*widget\s*:\s*/,"");
var _10=_e.split(".");
if(_10.length==1){
_f=_5.byId(_e).get("binding");
}else{
pb=_5.byId(_10.shift()).get("binding");
_f=_1.getObject(_10.join("."),false,pb);
}
}else{
_d=_d||this._getParentBindingFromDOM();
if(_d){
_f=_d.get(_e);
}else{
try{
_f=_1.getObject(_e);
}
catch(err){
if(_e.indexOf("${")==-1){
throw new Error("dojox.mvc._DataBindingMixin: '"+this.domNode+"' widget with illegal ref expression: '"+_e+"'");
}
}
}
}
}
}
}
if(_f){
if(_2.isFunction(_f.toPlainObject)){
this.binding=_f;
this._updateBinding("binding",null,_f);
}else{
throw new Error("dojox.mvc._DataBindingMixin: '"+this.domNode+"' widget with illegal ref not evaluating to a dojo.Stateful node: '"+_e+"'");
}
}
},_updateBinding:function(_11,old,_12){
this._unwatchArray(this._modelWatchHandles);
var _13=this.get("binding");
if(_13&&_2.isFunction(_13.watch)){
var _14=this;
this._modelWatchHandles=[_13.watch("value",function(_15,old,_16){
if(old===_16){
return;
}
_14.set("value",_16);
}),_13.watch("valid",function(_17,old,_18){
_14._updateProperty(_17,old,_18,true);
if(_18!==_14.get("binding").get(_17)){
if(_14.validate&&_2.isFunction(_14.validate)){
_14.validate(true);
}
}
}),_13.watch("required",function(_19,old,_1a){
_14._updateProperty(_19,old,_1a,false,_19,_1a);
}),_13.watch("readOnly",function(_1b,old,_1c){
_14._updateProperty(_1b,old,_1c,false,_1b,_1c);
}),_13.watch("relevant",function(_1d,old,_1e){
_14._updateProperty(_1d,old,_1e,false,"disabled",!_1e);
})];
var val=_13.get("value");
if(val!=null){
this.set("value",val);
}
}
this._updateChildBindings();
},_updateProperty:function(_1f,old,_20,_21,_22,_23){
if(old===_20){
return;
}
if(_20===null&&_21!==undefined){
_20=_21;
}
if(_20!==this.get("binding").get(_1f)){
this.get("binding").set(_1f,_20);
}
if(_22){
this.set(_22,_23);
}
},_updateChildBindings:function(){
var _24=this.get("binding");
if(_24&&!this._beingBound){
_3.forEach(_5.findWidgets(this.domNode),function(_25){
if(_25._setupBinding){
_25._setupBinding(_24);
}
});
}
},_getParentBindingFromDOM:function(){
var pn=this.domNode.parentNode,pw,pb;
while(pn){
pw=_5.getEnclosingWidget(pn);
if(pw){
pb=pw.get("binding");
if(pb&&_2.isFunction(pb.toPlainObject)){
break;
}
}
pn=pw?pw.domNode.parentNode:null;
}
return pb;
},_unwatchArray:function(_26){
_3.forEach(_26,function(h){
h.unwatch();
});
}});
});
