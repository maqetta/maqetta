/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/dom",["dojo/_base/kernel","dojo/_base/lang","./_base","dojox/string/tokenize","./Context","dojo/_base/html"],function(_1,_2,dd,_3){
dd.BOOLS={checked:1,disabled:1,readonly:1};
dd.TOKEN_CHANGE=-11;
dd.TOKEN_ATTR=-12;
dd.TOKEN_CUSTOM=-13;
dd.TOKEN_NODE=1;
var _4=dd.text;
var _5=dd.dom={_attributes:{},_uppers:{},_re4:/^function anonymous\(\)\s*{\s*(.*)\s*}$/,_reTrim:/(?:^[\n\s]*(\{%)?\s*|\s*(%\})?[\n\s]*$)/g,_reSplit:/\s*%\}[\n\s]*\{%\s*/g,getTemplate:function(_6){
if(typeof this._commentable=="undefined"){
this._commentable=false;
var _7=document.createElement("div"),_8="Test comment handling, and long comments, using comments whenever possible.";
_7.innerHTML="<!--"+_8+"-->";
if(_7.childNodes.length&&_7.firstChild.nodeType==8&&_7.firstChild.data==_8){
this._commentable=true;
}
}
if(!this._commentable){
_6=_6.replace(/<!--({({|%).*?(%|})})-->/g,"$1");
}
if(_1.isIE){
_6=_6.replace(/\b(checked|disabled|readonly|style)="/g,"t$1=\"");
}
_6=_6.replace(/\bstyle="/g,"tstyle=\"");
var _9;
var _a=_1.isWebKit;
var _b=[[true,"select","option"],[_a,"tr","td|th"],[_a,"thead","tr","th"],[_a,"tbody","tr","td"],[_a,"table","tbody|thead|tr","tr","td"]];
var _c=[];
for(var i=0,_d;_d=_b[i];i++){
if(!_d[0]){
continue;
}
if(_6.indexOf("<"+_d[1])!=-1){
var _e=new RegExp("<"+_d[1]+"(?:.|\n)*?>((?:.|\n)+?)</"+_d[1]+">","ig");
tagLoop:
while(_9=_e.exec(_6)){
var _f=_d[2].split("|");
var _10=[];
for(var j=0,_11;_11=_f[j];j++){
_10.push("<"+_11+"(?:.|\n)*?>(?:.|\n)*?</"+_11+">");
}
var _12=[];
var _13=_3(_9[1],new RegExp("("+_10.join("|")+")","ig"),function(_14){
var tag=/<(\w+)/.exec(_14)[1];
if(!_12[tag]){
_12[tag]=true;
_12.push(tag);
}
return {data:_14};
});
if(_12.length){
var tag=(_12.length==1)?_12[0]:_d[2].split("|")[0];
var _15=[];
for(var j=0,jl=_13.length;j<jl;j++){
var _16=_13[j];
if(_1.isObject(_16)){
_15.push(_16.data);
}else{
var _17=_16.replace(this._reTrim,"");
if(!_17){
continue;
}
_16=_17.split(this._reSplit);
for(var k=0,kl=_16.length;k<kl;k++){
var _18="";
for(var p=2,pl=_d.length;p<pl;p++){
if(p==2){
_18+="<"+tag+" dtlinstruction=\"{% "+_16[k].replace("\"","\\\"")+" %}\">";
}else{
if(tag==_d[p]){
continue;
}else{
_18+="<"+_d[p]+">";
}
}
}
_18+="DTL";
for(var p=_d.length-1;p>1;p--){
if(p==2){
_18+="</"+tag+">";
}else{
if(tag==_d[p]){
continue;
}else{
_18+="</"+_d[p]+">";
}
}
}
_15.push("ÿ"+_c.length);
_c.push(_18);
}
}
}
_6=_6.replace(_9[1],_15.join(""));
}
}
}
}
for(var i=_c.length;i--;){
_6=_6.replace("ÿ"+i,_c[i]);
}
var re=/\b([a-zA-Z_:][a-zA-Z0-9_\-\.:]*)=['"]/g;
while(_9=re.exec(_6)){
var _19=_9[1].toLowerCase();
if(_19=="dtlinstruction"){
continue;
}
if(_19!=_9[1]){
this._uppers[_19]=_9[1];
}
this._attributes[_19]=true;
}
var _7=document.createElement("div");
_7.innerHTML=_6;
var _1a={nodes:[]};
while(_7.childNodes.length){
_1a.nodes.push(_7.removeChild(_7.childNodes[0]));
}
return _1a;
},tokenize:function(_1b){
var _1c=[];
for(var i=0,_1d;_1d=_1b[i++];){
if(_1d.nodeType!=1){
this.__tokenize(_1d,_1c);
}else{
this._tokenize(_1d,_1c);
}
}
return _1c;
},_swallowed:[],_tokenize:function(_1e,_1f){
var _20=false;
var _21=this._swallowed;
var i,j,tag,_22;
if(!_1f.first){
_20=_1f.first=true;
var _23=dd.register.getAttributeTags();
for(i=0;tag=_23[i];i++){
try{
(tag[2])({swallowNode:function(){
throw 1;
}},new dd.Token(dd.TOKEN_ATTR,""));
}
catch(e){
_21.push(tag);
}
}
}
for(i=0;tag=_21[i];i++){
var _24=_1e.getAttribute(tag[0]);
if(_24){
var _21=false;
var _25=(tag[2])({swallowNode:function(){
_21=true;
return _1e;
}},new dd.Token(dd.TOKEN_ATTR,tag[0]+" "+_24));
if(_21){
if(_1e.parentNode&&_1e.parentNode.removeChild){
_1e.parentNode.removeChild(_1e);
}
_1f.push([dd.TOKEN_CUSTOM,_25]);
return;
}
}
}
var _26=[];
if(_1.isIE&&_1e.tagName=="SCRIPT"){
_26.push({nodeType:3,data:_1e.text});
_1e.text="";
}else{
for(i=0;_22=_1e.childNodes[i];i++){
_26.push(_22);
}
}
_1f.push([dd.TOKEN_NODE,_1e]);
var _27=false;
if(_26.length){
_1f.push([dd.TOKEN_CHANGE,_1e]);
_27=true;
}
for(var key in this._attributes){
var _28=false;
var _29="";
if(key=="class"){
_29=_1e.className||_29;
}else{
if(key=="for"){
_29=_1e.htmlFor||_29;
}else{
if(key=="value"&&_1e.value==_1e.innerHTML){
continue;
}else{
if(_1e.getAttribute){
_29=_1e.getAttribute(key,2)||_29;
if(key=="href"||key=="src"){
if(_1.isIE){
var _2a=location.href.lastIndexOf(location.hash);
var _2b=location.href.substring(0,_2a).split("/");
_2b.pop();
_2b=_2b.join("/")+"/";
if(_29.indexOf(_2b)==0){
_29=_29.replace(_2b,"");
}
_29=decodeURIComponent(_29);
}
}else{
if(key=="tstyle"){
_28=key;
key="style";
}else{
if(dd.BOOLS[key.slice(1)]&&_1.trim(_29)){
key=key.slice(1);
}else{
if(this._uppers[key]&&_1.trim(_29)){
_28=this._uppers[key];
}
}
}
}
}
}
}
}
if(_28){
_1e.setAttribute(_28,"");
_1e.removeAttribute(_28);
}
if(typeof _29=="function"){
_29=_29.toString().replace(this._re4,"$1");
}
if(!_27){
_1f.push([dd.TOKEN_CHANGE,_1e]);
_27=true;
}
_1f.push([dd.TOKEN_ATTR,_1e,key,_29]);
}
for(i=0,_22;_22=_26[i];i++){
if(_22.nodeType==1){
var _2c=_22.getAttribute("dtlinstruction");
if(_2c){
_22.parentNode.removeChild(_22);
_22={nodeType:8,data:_2c};
}
}
this.__tokenize(_22,_1f);
}
if(!_20&&_1e.parentNode&&_1e.parentNode.tagName){
if(_27){
_1f.push([dd.TOKEN_CHANGE,_1e,true]);
}
_1f.push([dd.TOKEN_CHANGE,_1e.parentNode]);
_1e.parentNode.removeChild(_1e);
}else{
_1f.push([dd.TOKEN_CHANGE,_1e,true,true]);
}
},__tokenize:function(_2d,_2e){
var _2f=_2d.data;
switch(_2d.nodeType){
case 1:
this._tokenize(_2d,_2e);
return;
case 3:
if(_2f.match(/[^\s\n]/)&&(_2f.indexOf("{{")!=-1||_2f.indexOf("{%")!=-1)){
var _30=_4.tokenize(_2f);
for(var j=0,_31;_31=_30[j];j++){
if(typeof _31=="string"){
_2e.push([dd.TOKEN_TEXT,_31]);
}else{
_2e.push(_31);
}
}
}else{
_2e.push([_2d.nodeType,_2d]);
}
if(_2d.parentNode){
_2d.parentNode.removeChild(_2d);
}
return;
case 8:
if(_2f.indexOf("{%")==0){
var _31=_1.trim(_2f.slice(2,-2));
if(_31.substr(0,5)=="load "){
var _32=_1.trim(_31).split(/\s+/g);
for(var i=1,_33;_33=_32[i];i++){
_1["require"](_33);
}
}
_2e.push([dd.TOKEN_BLOCK,_31]);
}
if(_2f.indexOf("{{")==0){
_2e.push([dd.TOKEN_VAR,_1.trim(_2f.slice(2,-2))]);
}
if(_2d.parentNode){
_2d.parentNode.removeChild(_2d);
}
return;
}
}};
dd.DomTemplate=_1.extend(function(obj){
if(!obj.nodes){
var _34=_1.byId(obj);
if(_34&&_34.nodeType==1){
_1.forEach(["class","src","href","name","value"],function(_35){
_5._attributes[_35]=true;
});
obj={nodes:[_34]};
}else{
if(typeof obj=="object"){
obj=_4.getTemplateString(obj);
}
obj=_5.getTemplate(obj);
}
}
var _36=_5.tokenize(obj.nodes);
if(dd.tests){
this.tokens=_36.slice(0);
}
var _37=new dd._DomParser(_36);
this.nodelist=_37.parse();
},{_count:0,_re:/\bdojo:([a-zA-Z0-9_]+)\b/g,setClass:function(str){
this.getRootNode().className=str;
},getRootNode:function(){
return this.buffer.rootNode;
},getBuffer:function(){
return new dd.DomBuffer();
},render:function(_38,_39){
_39=this.buffer=_39||this.getBuffer();
this.rootNode=null;
var _3a=this.nodelist.render(_38||new dd.Context({}),_39);
for(var i=0,_3b;_3b=_39._cache[i];i++){
if(_3b._cache){
_3b._cache.length=0;
}
}
return _3a;
},unrender:function(_3c,_3d){
return this.nodelist.unrender(_3c,_3d);
}});
dd.DomBuffer=_1.extend(function(_3e){
this._parent=_3e;
this._cache=[];
},{concat:function(_3f){
var _40=this._parent;
if(_40&&_3f.parentNode&&_3f.parentNode===_40&&!_40._dirty){
return this;
}
if(_3f.nodeType==1&&!this.rootNode){
this.rootNode=_3f||true;
return this;
}
if(!_40){
if(_3f.nodeType==3&&_1.trim(_3f.data)){
throw new Error("Text should not exist outside of the root node in template");
}
return this;
}
if(this._closed){
if(_3f.nodeType==3&&!_1.trim(_3f.data)){
return this;
}else{
throw new Error("Content should not exist outside of the root node in template");
}
}
if(_40._dirty){
if(_3f._drawn&&_3f.parentNode==_40){
var _41=_40._cache;
if(_41){
for(var i=0,_42;_42=_41[i];i++){
this.onAddNode&&this.onAddNode(_42);
_40.insertBefore(_42,_3f);
this.onAddNodeComplete&&this.onAddNodeComplete(_42);
}
_41.length=0;
}
}
_40._dirty=false;
}
if(!_40._cache){
_40._cache=[];
this._cache.push(_40);
}
_40._dirty=true;
_40._cache.push(_3f);
return this;
},remove:function(obj){
if(typeof obj=="string"){
if(this._parent){
this._parent.removeAttribute(obj);
}
}else{
if(obj.nodeType==1&&!this.getRootNode()&&!this._removed){
this._removed=true;
return this;
}
if(obj.parentNode){
this.onRemoveNode&&this.onRemoveNode(obj);
if(obj.parentNode){
obj.parentNode.removeChild(obj);
}
}
}
return this;
},setAttribute:function(key,_43){
var old=_1.attr(this._parent,key);
if(this.onChangeAttribute&&old!=_43){
this.onChangeAttribute(this._parent,key,old,_43);
}
if(key=="style"){
this._parent.style.cssText=_43;
}else{
_1.attr(this._parent,key,_43);
if(key=="value"){
this._parent.setAttribute(key,_43);
}
}
return this;
},addEvent:function(_44,_45,fn,_46){
if(!_44.getThis()){
throw new Error("You must use Context.setObject(instance)");
}
this.onAddEvent&&this.onAddEvent(this.getParent(),_45,fn);
var _47=fn;
if(_1.isArray(_46)){
_47=function(e){
this[fn].apply(this,[e].concat(_46));
};
}
return _1.connect(this.getParent(),_45,_44.getThis(),_47);
},setParent:function(_48,up,_49){
if(!this._parent){
this._parent=this._first=_48;
}
if(up&&_49&&_48===this._first){
this._closed=true;
}
if(up){
var _4a=this._parent;
var _4b="";
var ie=_1.isIE&&_4a.tagName=="SCRIPT";
if(ie){
_4a.text="";
}
if(_4a._dirty){
var _4c=_4a._cache;
var _4d=(_4a.tagName=="SELECT"&&!_4a.options.length);
for(var i=0,_4e;_4e=_4c[i];i++){
if(_4e!==_4a){
this.onAddNode&&this.onAddNode(_4e);
if(ie){
_4b+=_4e.data;
}else{
_4a.appendChild(_4e);
if(_4d&&_4e.defaultSelected&&i){
_4d=i;
}
}
this.onAddNodeComplete&&this.onAddNodeComplete(_4e);
}
}
if(_4d){
_4a.options.selectedIndex=(typeof _4d=="number")?_4d:0;
}
_4c.length=0;
_4a._dirty=false;
}
if(ie){
_4a.text=_4b;
}
}
this._parent=_48;
this.onSetParent&&this.onSetParent(_48,up,_49);
return this;
},getParent:function(){
return this._parent;
},getRootNode:function(){
return this.rootNode;
}});
dd._DomNode=_1.extend(function(_4f){
this.contents=_4f;
},{render:function(_50,_51){
this._rendered=true;
return _51.concat(this.contents);
},unrender:function(_52,_53){
if(!this._rendered){
return _53;
}
this._rendered=false;
return _53.remove(this.contents);
},clone:function(_54){
return new this.constructor(this.contents);
}});
dd._DomNodeList=_1.extend(function(_55){
this.contents=_55||[];
},{push:function(_56){
this.contents.push(_56);
},unshift:function(_57){
this.contents.unshift(_57);
},render:function(_58,_59,_5a){
_59=_59||dd.DomTemplate.prototype.getBuffer();
if(_5a){
var _5b=_59.getParent();
}
for(var i=0;i<this.contents.length;i++){
_59=this.contents[i].render(_58,_59);
if(!_59){
throw new Error("Template node render functions must return their buffer");
}
}
if(_5b){
_59.setParent(_5b);
}
return _59;
},dummyRender:function(_5c,_5d,_5e){
var div=document.createElement("div");
var _5f=_5d.getParent();
var old=_5f._clone;
_5f._clone=div;
var _60=this.clone(_5d,div);
if(old){
_5f._clone=old;
}else{
_5f._clone=null;
}
_5d=dd.DomTemplate.prototype.getBuffer();
_60.unshift(new dd.ChangeNode(div));
_60.unshift(new dd._DomNode(div));
_60.push(new dd.ChangeNode(div,true));
_60.render(_5c,_5d);
if(_5e){
return _5d.getRootNode();
}
var _61=div.innerHTML;
return (_1.isIE)?_61.replace(/\s*_(dirty|clone)="[^"]*"/g,""):_61;
},unrender:function(_62,_63,_64){
if(_64){
var _65=_63.getParent();
}
for(var i=0;i<this.contents.length;i++){
_63=this.contents[i].unrender(_62,_63);
if(!_63){
throw new Error("Template node render functions must return their buffer");
}
}
if(_65){
_63.setParent(_65);
}
return _63;
},clone:function(_66){
var _67=_66.getParent();
var _68=this.contents;
var _69=new dd._DomNodeList();
var _6a=[];
for(var i=0;i<_68.length;i++){
var _6b=_68[i].clone(_66);
if(_6b instanceof dd.ChangeNode||_6b instanceof dd._DomNode){
var _6c=_6b.contents._clone;
if(_6c){
_6b.contents=_6c;
}else{
if(_67!=_6b.contents&&_6b instanceof dd._DomNode){
var _6d=_6b.contents;
_6b.contents=_6b.contents.cloneNode(false);
_66.onClone&&_66.onClone(_6d,_6b.contents);
_6a.push(_6d);
_6d._clone=_6b.contents;
}
}
}
_69.push(_6b);
}
for(var i=0,_6b;_6b=_6a[i];i++){
_6b._clone=null;
}
return _69;
},rtrim:function(){
while(1){
var i=this.contents.length-1;
if(this.contents[i] instanceof dd._DomTextNode&&this.contents[i].isEmpty()){
this.contents.pop();
}else{
break;
}
}
return this;
}});
dd._DomVarNode=_1.extend(function(str){
this.contents=new dd._Filter(str);
},{render:function(_6e,_6f){
var str=this.contents.resolve(_6e);
var _70="text";
if(str){
if(str.render&&str.getRootNode){
_70="injection";
}else{
if(str.safe){
if(str.nodeType){
_70="node";
}else{
if(str.toString){
str=str.toString();
_70="html";
}
}
}
}
}
if(this._type&&_70!=this._type){
this.unrender(_6e,_6f);
}
this._type=_70;
switch(_70){
case "text":
this._rendered=true;
this._txt=this._txt||document.createTextNode(str);
if(this._txt.data!=str){
var old=this._txt.data;
this._txt.data=str;
_6f.onChangeData&&_6f.onChangeData(this._txt,old,this._txt.data);
}
return _6f.concat(this._txt);
case "injection":
var _71=str.getRootNode();
if(this._rendered&&_71!=this._root){
_6f=this.unrender(_6e,_6f);
}
this._root=_71;
var _72=this._injected=new dd._DomNodeList();
_72.push(new dd.ChangeNode(_6f.getParent()));
_72.push(new dd._DomNode(_71));
_72.push(str);
_72.push(new dd.ChangeNode(_6f.getParent()));
this._rendered=true;
return _72.render(_6e,_6f);
case "node":
this._rendered=true;
if(this._node&&this._node!=str&&this._node.parentNode&&this._node.parentNode===_6f.getParent()){
this._node.parentNode.removeChild(this._node);
}
this._node=str;
return _6f.concat(str);
case "html":
if(this._rendered&&this._src!=str){
_6f=this.unrender(_6e,_6f);
}
this._src=str;
if(!this._rendered){
this._rendered=true;
this._html=this._html||[];
var div=(this._div=this._div||document.createElement("div"));
div.innerHTML=str;
var _73=div.childNodes;
while(_73.length){
var _74=div.removeChild(_73[0]);
this._html.push(_74);
_6f=_6f.concat(_74);
}
}
return _6f;
default:
return _6f;
}
},unrender:function(_75,_76){
if(!this._rendered){
return _76;
}
this._rendered=false;
switch(this._type){
case "text":
return _76.remove(this._txt);
case "injection":
return this._injection.unrender(_75,_76);
case "node":
if(this._node.parentNode===_76.getParent()){
return _76.remove(this._node);
}
return _76;
case "html":
for(var i=0,l=this._html.length;i<l;i++){
_76=_76.remove(this._html[i]);
}
return _76;
default:
return _76;
}
},clone:function(){
return new this.constructor(this.contents.getExpression());
}});
dd.ChangeNode=_1.extend(function(_77,up,_78){
this.contents=_77;
this.up=up;
this.root=_78;
},{render:function(_79,_7a){
return _7a.setParent(this.contents,this.up,this.root);
},unrender:function(_7b,_7c){
if(!_7c.getParent()){
return _7c;
}
return _7c.setParent(this.contents);
},clone:function(){
return new this.constructor(this.contents,this.up,this.root);
}});
dd.AttributeNode=_1.extend(function(key,_7d){
this.key=key;
this.value=_7d;
this.contents=_7d;
if(this._pool[_7d]){
this.nodelist=this._pool[_7d];
}else{
if(!(this.nodelist=dd.quickFilter(_7d))){
this.nodelist=(new dd.Template(_7d,true)).nodelist;
}
this._pool[_7d]=this.nodelist;
}
this.contents="";
},{_pool:{},render:function(_7e,_7f){
var key=this.key;
var _80=this.nodelist.dummyRender(_7e);
if(dd.BOOLS[key]){
_80=!(_80=="false"||_80=="undefined"||!_80);
}
if(_80!==this.contents){
this.contents=_80;
return _7f.setAttribute(key,_80);
}
return _7f;
},unrender:function(_81,_82){
this.contents="";
return _82.remove(this.key);
},clone:function(_83){
return new this.constructor(this.key,this.value);
}});
dd._DomTextNode=_1.extend(function(str){
this.contents=document.createTextNode(str);
this.upcoming=str;
},{set:function(_84){
this.upcoming=_84;
return this;
},render:function(_85,_86){
if(this.contents.data!=this.upcoming){
var old=this.contents.data;
this.contents.data=this.upcoming;
_86.onChangeData&&_86.onChangeData(this.contents,old,this.upcoming);
}
return _86.concat(this.contents);
},unrender:function(_87,_88){
return _88.remove(this.contents);
},isEmpty:function(){
return !_1.trim(this.contents.data);
},clone:function(){
return new this.constructor(this.contents.data);
}});
dd._DomParser=_1.extend(function(_89){
this.contents=_89;
},{i:0,parse:function(_8a){
var _8b={};
var _8c=this.contents;
if(!_8a){
_8a=[];
}
for(var i=0;i<_8a.length;i++){
_8b[_8a[i]]=true;
}
var _8d=new dd._DomNodeList();
while(this.i<_8c.length){
var _8e=_8c[this.i++];
var _8f=_8e[0];
var _90=_8e[1];
if(_8f==dd.TOKEN_CUSTOM){
_8d.push(_90);
}else{
if(_8f==dd.TOKEN_CHANGE){
var _91=new dd.ChangeNode(_90,_8e[2],_8e[3]);
_90[_91.attr]=_91;
_8d.push(_91);
}else{
if(_8f==dd.TOKEN_ATTR){
var fn=_4.getTag("attr:"+_8e[2],true);
if(fn&&_8e[3]){
if(_8e[3].indexOf("{%")!=-1||_8e[3].indexOf("{{")!=-1){
_90.setAttribute(_8e[2],"");
}
_8d.push(fn(null,new dd.Token(_8f,_8e[2]+" "+_8e[3])));
}else{
if(_1.isString(_8e[3])){
if(_8e[2]=="style"||_8e[3].indexOf("{%")!=-1||_8e[3].indexOf("{{")!=-1){
_8d.push(new dd.AttributeNode(_8e[2],_8e[3]));
}else{
if(_1.trim(_8e[3])){
try{
_1.attr(_90,_8e[2],_8e[3]);
}
catch(e){
}
}
}
}
}
}else{
if(_8f==dd.TOKEN_NODE){
var fn=_4.getTag("node:"+_90.tagName.toLowerCase(),true);
if(fn){
_8d.push(fn(null,new dd.Token(_8f,_90),_90.tagName.toLowerCase()));
}
_8d.push(new dd._DomNode(_90));
}else{
if(_8f==dd.TOKEN_VAR){
_8d.push(new dd._DomVarNode(_90));
}else{
if(_8f==dd.TOKEN_TEXT){
_8d.push(new dd._DomTextNode(_90.data||_90));
}else{
if(_8f==dd.TOKEN_BLOCK){
if(_8b[_90]){
--this.i;
return _8d;
}
var cmd=_90.split(/\s+/g);
if(cmd.length){
cmd=cmd[0];
var fn=_4.getTag(cmd);
if(typeof fn!="function"){
throw new Error("Function not found for "+cmd);
}
var tpl=fn(this,new dd.Token(_8f,_90));
if(tpl){
_8d.push(tpl);
}
}
}
}
}
}
}
}
}
}
if(_8a.length){
throw new Error("Could not find closing tag(s): "+_8a.toString());
}
return _8d;
},next_token:function(){
var _92=this.contents[this.i++];
return new dd.Token(_92[0],_92[1]);
},delete_first_token:function(){
this.i++;
},skip_past:function(_93){
return dd._Parser.prototype.skip_past.call(this,_93);
},create_variable_node:function(_94){
return new dd._DomVarNode(_94);
},create_text_node:function(_95){
return new dd._DomTextNode(_95||"");
},getTemplate:function(loc){
return new dd.DomTemplate(_5.getTemplate(loc));
}});
return dojox.dtl.dom;
});
