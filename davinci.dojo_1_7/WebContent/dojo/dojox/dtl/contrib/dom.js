/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/contrib/dom",["dojo/_base/kernel","dojo/_base/lang","../_base","../dom","dojo/_base/html"],function(_1,_2,dd){
_1.getObject("dtl.contrib.dom",true,dojox);
var _3=dd.contrib.dom;
var _4={render:function(){
return this.contents;
}};
_3.StyleNode=_1.extend(function(_5){
this.contents={};
this._current={};
this._styles=_5;
for(var _6 in _5){
if(_5[_6].indexOf("{{")!=-1){
var _7=new dd.Template(_5[_6]);
}else{
var _7=_1.delegate(_4);
_7.contents=_5[_6];
}
this.contents[_6]=_7;
}
},{render:function(_8,_9){
for(var _a in this.contents){
var _b=this.contents[_a].render(_8);
if(this._current[_a]!=_b){
_1.style(_9.getParent(),_a,this._current[_a]=_b);
}
}
return _9;
},unrender:function(_c,_d){
this._current={};
return _d;
},clone:function(_e){
return new this.constructor(this._styles);
}});
_3.BufferNode=_1.extend(function(_f,_10){
this.nodelist=_f;
this.options=_10;
},{_swap:function(_11,_12){
if(!this.swapped&&this.parent.parentNode){
if(_11=="node"){
if((_12.nodeType==3&&!this.options.text)||(_12.nodeType==1&&!this.options.node)){
return;
}
}else{
if(_11=="class"){
if(_11!="class"){
return;
}
}
}
this.onAddNode&&_1.disconnect(this.onAddNode);
this.onRemoveNode&&_1.disconnect(this.onRemoveNode);
this.onChangeAttribute&&_1.disconnect(this.onChangeAttribute);
this.onChangeData&&_1.disconnect(this.onChangeData);
this.swapped=this.parent.cloneNode(true);
this.parent.parentNode.replaceChild(this.swapped,this.parent);
}
},render:function(_13,_14){
this.parent=_14.getParent();
if(this.options.node){
this.onAddNode=_1.connect(_14,"onAddNode",_1.hitch(this,"_swap","node"));
this.onRemoveNode=_1.connect(_14,"onRemoveNode",_1.hitch(this,"_swap","node"));
}
if(this.options.text){
this.onChangeData=_1.connect(_14,"onChangeData",_1.hitch(this,"_swap","node"));
}
if(this.options["class"]){
this.onChangeAttribute=_1.connect(_14,"onChangeAttribute",_1.hitch(this,"_swap","class"));
}
_14=this.nodelist.render(_13,_14);
if(this.swapped){
this.swapped.parentNode.replaceChild(this.parent,this.swapped);
_1.destroy(this.swapped);
}else{
this.onAddNode&&_1.disconnect(this.onAddNode);
this.onRemoveNode&&_1.disconnect(this.onRemoveNode);
this.onChangeAttribute&&_1.disconnect(this.onChangeAttribute);
this.onChangeData&&_1.disconnect(this.onChangeData);
}
delete this.parent;
delete this.swapped;
return _14;
},unrender:function(_15,_16){
return this.nodelist.unrender(_15,_16);
},clone:function(_17){
return new this.constructor(this.nodelist.clone(_17),this.options);
}});
_1.mixin(_3,{buffer:function(_18,_19){
var _1a=_19.contents.split().slice(1);
var _1b={};
var _1c=false;
for(var i=_1a.length;i--;){
_1c=true;
_1b[_1a[i]]=true;
}
if(!_1c){
_1b.node=true;
}
var _1d=_18.parse(["endbuffer"]);
_18.next_token();
return new _3.BufferNode(_1d,_1b);
},html:function(_1e,_1f){
_1.deprecated("{% html someVariable %}","Use {{ someVariable|safe }} instead");
return _1e.create_variable_node(_1f.contents.slice(5)+"|safe");
},style_:function(_20,_21){
var _22={};
_21=_21.contents.replace(/^style\s+/,"");
var _23=_21.split(/\s*;\s*/g);
for(var i=0,_24;_24=_23[i];i++){
var _25=_24.split(/\s*:\s*/g);
var key=_25[0];
var _26=_1.trim(_25[1]);
if(_26){
_22[key]=_26;
}
}
return new _3.StyleNode(_22);
}});
dd.register.tags("dojox.dtl.contrib",{"dom":["html","attr:style","buffer"]});
return dojox.dtl.contrib.dom;
});
