/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/manager/_NodeMixin",["dojo","dijit","dojox","dojox/form/manager/_Mixin"],function(_1,_2,_3){
_1.getObject("dojox.form.manager._NodeMixin",1);
(function(){
var fm=_3.form.manager,aa=fm.actionAdapter,_4=fm._keys,ce=fm.changeEvent=function(_5){
var _6="onclick";
switch(_5.tagName.toLowerCase()){
case "textarea":
_6="onkeyup";
break;
case "select":
_6="onchange";
break;
case "input":
switch(_5.type.toLowerCase()){
case "text":
case "password":
_6="onkeyup";
break;
}
break;
}
return _6;
},_7=function(_8,_9){
var _a=_1.attr(_8,"name");
_9=_9||this.domNode;
if(_a&&!(_a in this.formWidgets)){
for(var n=_8;n&&n!==_9;n=n.parentNode){
if(_1.attr(n,"widgetId")&&_2.byNode(n) instanceof _2.form._FormWidget){
return null;
}
}
if(_8.tagName.toLowerCase()=="input"&&_8.type.toLowerCase()=="radio"){
var a=this.formNodes[_a];
a=a&&a.node;
if(a&&_1.isArray(a)){
a.push(_8);
}else{
this.formNodes[_a]={node:[_8],connections:[]};
}
}else{
this.formNodes[_a]={node:_8,connections:[]};
}
}else{
_a=null;
}
return _a;
},_b=function(_c){
var _d={};
aa(function(_e,n){
var o=_1.attr(n,"observer");
if(o&&typeof o=="string"){
_1.forEach(o.split(","),function(o){
o=_1.trim(o);
if(o&&_1.isFunction(this[o])){
_d[o]=1;
}
},this);
}
}).call(this,null,this.formNodes[_c].node);
return _4(_d);
},_f=function(_10,_11){
var t=this.formNodes[_10],c=t.connections;
if(c.length){
_1.forEach(c,_1.disconnect);
c=t.connections=[];
}
aa(function(_12,n){
var _13=ce(n);
_1.forEach(_11,function(o){
c.push(_1.connect(n,_13,this,function(evt){
if(this.watching){
this[o](this.formNodeValue(_10),_10,n,evt);
}
}));
},this);
}).call(this,null,t.node);
};
_1.declare("dojox.form.manager._NodeMixin",null,{destroy:function(){
for(var _14 in this.formNodes){
_1.forEach(this.formNodes[_14].connections,_1.disconnect);
}
this.formNodes={};
this.inherited(arguments);
},registerNode:function(_15){
if(typeof _15=="string"){
_15=_1.byId(_15);
}
var _16=_7.call(this,_15);
if(_16){
_f.call(this,_16,_b.call(this,_16));
}
return this;
},unregisterNode:function(_17){
if(_17 in this.formNodes){
_1.forEach(this.formNodes[_17].connections,this.disconnect,this);
delete this.formNodes[_17];
}
return this;
},registerNodeDescendants:function(_18){
if(typeof _18=="string"){
_18=_1.byId(_18);
}
_1.query("input, select, textarea, button",_18).map(function(n){
return _7.call(this,n,_18);
},this).forEach(function(_19){
if(_19){
_f.call(this,_19,_b.call(this,_19));
}
},this);
return this;
},unregisterNodeDescendants:function(_1a){
if(typeof _1a=="string"){
_1a=_1.byId(_1a);
}
_1.query("input, select, textarea, button",_1a).map(function(n){
return _1.attr(_1a,"name")||null;
}).forEach(function(_1b){
if(_1b){
this.unregisterNode(_1b);
}
},this);
return this;
},formNodeValue:function(_1c,_1d){
var _1e=arguments.length==2&&_1d!==undefined,_1f;
if(typeof _1c=="string"){
_1c=this.formNodes[_1c];
if(_1c){
_1c=_1c.node;
}
}
if(!_1c){
return null;
}
if(_1.isArray(_1c)){
if(_1e){
_1.forEach(_1c,function(_20){
_20.checked="";
});
_1.forEach(_1c,function(_21){
_21.checked=_21.value===_1d?"checked":"";
});
return this;
}
_1.some(_1c,function(_22){
if(_22.checked){
_1f=_22;
return true;
}
return false;
});
return _1f?_1f.value:"";
}
switch(_1c.tagName.toLowerCase()){
case "select":
if(_1c.multiple){
if(_1e){
if(_1.isArray(_1d)){
var _23={};
_1.forEach(_1d,function(v){
_23[v]=1;
});
_1.query("> option",_1c).forEach(function(opt){
opt.selected=opt.value in _23;
});
return this;
}
_1.query("> option",_1c).forEach(function(opt){
opt.selected=opt.value===_1d;
});
return this;
}
var _1f=_1.query("> option",_1c).filter(function(opt){
return opt.selected;
}).map(function(opt){
return opt.value;
});
return _1f.length==1?_1f[0]:_1f;
}
if(_1e){
_1.query("> option",_1c).forEach(function(opt){
opt.selected=opt.value===_1d;
});
return this;
}
return _1c.value||"";
case "button":
if(_1e){
_1c.innerHTML=""+_1d;
return this;
}
return _1c.innerHTML;
case "input":
if(_1c.type.toLowerCase()=="checkbox"){
if(_1e){
_1c.checked=_1d?"checked":"";
return this;
}
return Boolean(_1c.checked);
}
}
if(_1e){
_1c.value=""+_1d;
return this;
}
return _1c.value;
},inspectFormNodes:function(_24,_25,_26){
var _27,_28={};
if(_25){
if(_1.isArray(_25)){
_1.forEach(_25,function(_29){
if(_29 in this.formNodes){
_28[_29]=_24.call(this,_29,this.formNodes[_29].node,_26);
}
},this);
}else{
for(_27 in _25){
if(_27 in this.formNodes){
_28[_27]=_24.call(this,_27,this.formNodes[_27].node,_25[_27]);
}
}
}
}else{
for(_27 in this.formNodes){
_28[_27]=_24.call(this,_27,this.formNodes[_27].node,_26);
}
}
return _28;
}});
})();
return _1.getObject("dojox.form.manager._NodeMixin");
});
require(["dojox/form/manager/_NodeMixin"]);
