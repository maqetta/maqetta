/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/parser",["./_base/kernel","./_base/lang","./_base/array","./_base/html","./_base/window","./_base/url","./_base/json","./aspect","./date/stamp","./query"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a){
new Date("X");
var _b={"dom-attributes-explicit":document.createElement("div").attributes.length<40};
function _c(_d){
return _b[_d];
};
_1.parser=new function(){
var _e={};
function _f(_10){
var map={};
for(var _11 in _10){
if(_11.charAt(0)=="_"){
continue;
}
map[_11.toLowerCase()]=_11;
}
return map;
};
_8.after(_2,"extend",function(){
_e={};
},true);
var _12={};
this._functionFromScript=function(_13,_14){
var _15="";
var _16="";
var _17=(_13.getAttribute(_14+"args")||_13.getAttribute("args"));
if(_17){
_3.forEach(_17.split(/\s*,\s*/),function(_18,idx){
_15+="var "+_18+" = arguments["+idx+"]; ";
});
}
var _19=_13.getAttribute("with");
if(_19&&_19.length){
_3.forEach(_19.split(/\s*,\s*/),function(_1a){
_15+="with("+_1a+"){";
_16+="}";
});
}
return new Function(_15+_13.innerHTML+_16);
};
this.instantiate=function(_1b,_1c,_1d){
var _1e=[],_1c=_1c||{};
_1d=_1d||{};
var _1f=(_1d.scope||_1._scopeName)+"Type",_20="data-"+(_1d.scope||_1._scopeName)+"-",_21=_20+"type",_22=_20+"props",_23=_20+"attach-point",_24=_20+"attach-event",_25=_20+"id";
var _26={};
_3.forEach([_22,_21,_1f,_25,"jsId",_23,_24,"dojoAttachPoint","dojoAttachEvent","class","style"],function(_27){
_26[_27.toLowerCase()]=_27.replace(_1d.scope,"dojo");
});
_3.forEach(_1b,function(obj){
if(!obj){
return;
}
var _28=obj.node||obj,_29=_1f in _1c?_1c[_1f]:obj.node?obj.type:(_28.getAttribute(_21)||_28.getAttribute(_1f)),_2a=_12[_29]||(_12[_29]=_1.getObject(_29)),_2b=_2a&&_2a.prototype;
if(!_2a){
throw new Error("Could not load class '"+_29);
}
var _2c={};
if(_1d.defaults){
_1._mixin(_2c,_1d.defaults);
}
if(obj.inherited){
_1._mixin(_2c,obj.inherited);
}
var _2d;
if(_c("dom-attributes-explicit")){
_2d=_28.attributes;
}else{
var _2e=/^input$|^img$/i.test(_28.nodeName)?_28:_28.cloneNode(false),_2f=_2e.outerHTML.replace(/=[^\s"']+|="[^"]*"|='[^']*'/g,"").replace(/^\s*<[a-zA-Z0-9]*/,"").replace(/>.*$/,"");
_2d=_3.map(_2f.split(/\s+/),function(_30){
var _31=_30.toLowerCase();
return {name:_30,value:(_28.nodeName=="LI"&&_30=="value")||_31=="enctype"?_28.getAttribute(_31):_28.getAttributeNode(_31).value,specified:true};
});
}
var i=0,_32;
while(_32=_2d[i++]){
if(!_32||!_32.specified){
continue;
}
var _33=_32.name,_34=_33.toLowerCase(),_35=_32.value;
if(_34 in _26){
switch(_26[_34]){
case "data-dojo-props":
var _36=_35;
break;
case "data-dojo-id":
case "jsId":
var _37=_35;
break;
case "data-dojo-attach-point":
case "dojoAttachPoint":
_2c.dojoAttachPoint=_35;
break;
case "data-dojo-attach-event":
case "dojoAttachEvent":
_2c.dojoAttachEvent=_35;
break;
case "class":
_2c["class"]=_28.className;
break;
case "style":
_2c["style"]=_28.style&&_28.style.cssText;
break;
}
}else{
if(!(_33 in _2b)){
var map=(_e[_29]||(_e[_29]=_f(_2b)));
_33=map[_34]||_33;
}
if(_33 in _2b){
switch(typeof _2b[_33]){
case "string":
_2c[_33]=_35;
break;
case "number":
_2c[_33]=_35.length?Number(_35):NaN;
break;
case "boolean":
_2c[_33]=_35.toLowerCase()!="false";
break;
case "function":
if(_35===""||_35.search(/[^\w\.]+/i)!=-1){
_2c[_33]=new Function(_35);
}else{
_2c[_33]=_1.getObject(_35,false)||new Function(_35);
}
break;
default:
var _38=_2b[_33];
_2c[_33]=(_38&&"length" in _38)?(_35?_35.split(/\s*,\s*/):[]):(_38 instanceof Date)?(_35==""?new Date(""):_35=="now"?new Date():_9.fromISOString(_35)):(_38 instanceof _1._Url)?(_1.baseUrl+_35):_7.fromJson(_35);
}
}else{
_2c[_33]=_35;
}
}
}
if(_36){
try{
_36=_7.fromJson.call(_1d.propsThis,"{"+_36+"}");
_1._mixin(_2c,_36);
}
catch(e){
throw new Error(e.toString()+" in data-dojo-props='"+_36+"'");
}
}
_1._mixin(_2c,_1c);
var _39=obj.node?obj.scripts:(_2a&&(_2a._noScript||_2b._noScript)?[]:_a("> script[type^='dojo/']",_28));
var _3a=[],_3b=[];
if(_39){
for(i=0;i<_39.length;i++){
var _3c=_39[i];
_28.removeChild(_3c);
var _3d=(_3c.getAttribute(_20+"event")||_3c.getAttribute("event")),_29=_3c.getAttribute("type"),nf=this._functionFromScript(_3c,_20);
if(_3d){
if(_29=="dojo/connect"){
_3a.push({event:_3d,func:nf});
}else{
_2c[_3d]=nf;
}
}else{
_3b.push(nf);
}
}
}
var _3e=_2a.markupFactory||_2b.markupFactory;
var _3f=_3e?_3e(_2c,_28,_2a):new _2a(_2c,_28);
_1e.push(_3f);
if(_37){
_1.setObject(_37,_3f);
}
for(i=0;i<_3a.length;i++){
_8.after(_3f,_3a[i].event,_1.hitch(_3f,_3a[i].func),true);
}
for(i=0;i<_3b.length;i++){
_3b[i].call(_3f);
}
},this);
if(!_1c._started){
_3.forEach(_1e,function(_40){
if(!_1d.noStart&&_40&&_2.isFunction(_40.startup)&&!_40._started&&(!_40.getParent||!_40.getParent())){
_40.startup();
}
});
}
return _1e;
};
this.parse=function(_41,_42){
var _43;
if(!_42&&_41&&_41.rootNode){
_42=_41;
_43=_42.rootNode;
}else{
_43=_41;
}
_43=_43?_4.byId(_43):_5.body();
_42=_42||{};
var _44=(_42.scope||_1._scopeName)+"Type",_45="data-"+(_42.scope||_1._scopeName)+"-",_46=_45+"type",_47=_45+"textdir";
var _48=[];
var _49=_43.firstChild;
var _4a=_42&&_42.inherited;
if(!_4a){
function _4b(_4c,_4d){
return (_4c.getAttribute&&_4c.getAttribute(_4d))||(_4c!==_5.doc&&_4c!==_5.doc.documentElement&&_4c.parentNode?_4b(_4c.parentNode,_4d):null);
};
_4a={dir:_4b(_43,"dir"),lang:_4b(_43,"lang"),textDir:_4b(_43,_47)};
for(var key in _4a){
if(!_4a[key]){
delete _4a[key];
}
}
}
var _4e={inherited:_4a};
var _4f;
var _50;
function _51(_52){
if(!_52.inherited){
_52.inherited={};
var _53=_52.node,_54=_51(_52.parent);
var _55={dir:_53.getAttribute("dir")||_54.dir,lang:_53.getAttribute("lang")||_54.lang,textDir:_53.getAttribute(_47)||_54.textDir};
for(var key in _55){
if(_55[key]){
_52.inherited[key]=_55[key];
}
}
}
return _52.inherited;
};
while(true){
if(!_49){
if(!_4e||!_4e.node){
break;
}
_49=_4e.node.nextSibling;
_4f=_4e.scripts;
_50=false;
_4e=_4e.parent;
continue;
}
if(_49.nodeType!=1){
_49=_49.nextSibling;
continue;
}
if(_4f&&_49.nodeName.toLowerCase()=="script"){
_56=_49.getAttribute("type");
if(_56&&/^dojo\/\w/i.test(_56)){
_4f.push(_49);
}
_49=_49.nextSibling;
continue;
}
if(_50){
_49=_49.nextSibling;
continue;
}
var _56=_49.getAttribute(_46)||_49.getAttribute(_44);
var _57=_49.firstChild;
if(!_56&&(!_57||(_57.nodeType==3&&!_57.nextSibling))){
_49=_49.nextSibling;
continue;
}
var _58={node:_49,scripts:_4f,parent:_4e};
var _59=_56&&(_12[_56]||(_12[_56]=_1.getObject(_56))),_5a=_59&&!_59.prototype._noScript?[]:null;
if(_56){
_48.push({"type":_56,node:_49,scripts:_5a,inherited:_51(_58)});
}
_49=_57;
_4f=_5a;
_50=_59&&_59.prototype.stopParser&&!(_42&&_42.template);
_4e=_58;
}
var _5b=_42&&_42.template?{template:true}:null;
return this.instantiate(_48,_5b,_42);
};
}();
if(_1.config.parseOnLoad){
_1.ready(100,_1.parser,"parse");
}
return _1.parser;
});
