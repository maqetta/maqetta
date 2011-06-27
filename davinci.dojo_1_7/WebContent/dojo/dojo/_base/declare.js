/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/declare",["./kernel","../has","./lang","./array"],function(_1,_2){
var _3=_1._mixin,op=Object.prototype,_4=op.toString,_5=new Function,_6=0,_7="constructor";
function _8(_9,_a){
throw new Error("declare"+(_a?" "+_a:"")+": "+_9);
};
function _b(_c,_d){
var _e=[],_f=[{cls:0,refs:[]}],_10={},_11=1,l=_c.length,i=0,j,lin,_12,top,_13,rec,_14,_15;
for(;i<l;++i){
_12=_c[i];
if(!_12){
_8("mixin #"+i+" is unknown. Did you use dojo.require to pull it in?",_d);
}else{
if(_4.call(_12)!="[object Function]"){
_8("mixin #"+i+" is not a callable constructor.",_d);
}
}
lin=_12._meta?_12._meta.bases:[_12];
top=0;
for(j=lin.length-1;j>=0;--j){
_13=lin[j].prototype;
if(!_13.hasOwnProperty("declaredClass")){
_13.declaredClass="uniqName_"+(_6++);
}
_14=_13.declaredClass;
if(!_10.hasOwnProperty(_14)){
_10[_14]={count:0,refs:[],cls:lin[j]};
++_11;
}
rec=_10[_14];
if(top&&top!==rec){
rec.refs.push(top);
++top.count;
}
top=rec;
}
++top.count;
_f[0].refs.push(top);
}
while(_f.length){
top=_f.pop();
_e.push(top.cls);
--_11;
while(_15=top.refs,_15.length==1){
top=_15[0];
if(!top||--top.count){
top=0;
break;
}
_e.push(top.cls);
--_11;
}
if(top){
for(i=0,l=_15.length;i<l;++i){
top=_15[i];
if(!--top.count){
_f.push(top);
}
}
}
}
if(_11){
_8("can't build consistent linearization",_d);
}
_12=_c[0];
_e[0]=_12?_12._meta&&_12===_e[_e.length-_12._meta.bases.length]?_12._meta.bases.length:1:0;
return _e;
};
function _16(_17,a,f){
var _18,_19,_1a,_1b,_1c,_1d,_1e,opf,pos,_1f=this._inherited=this._inherited||{};
if(typeof _17=="string"){
_18=_17;
_17=a;
a=f;
}
f=0;
_1b=_17.callee;
_18=_18||_1b.nom;
if(!_18){
_8("can't deduce a name to call inherited()",this.declaredClass);
}
_1c=this.constructor._meta;
_1a=_1c.bases;
pos=_1f.p;
if(_18!=_7){
if(_1f.c!==_1b){
pos=0;
_1d=_1a[0];
_1c=_1d._meta;
if(_1c.hidden[_18]!==_1b){
_19=_1c.chains;
if(_19&&typeof _19[_18]=="string"){
_8("calling chained method with inherited: "+_18,this.declaredClass);
}
do{
_1c=_1d._meta;
_1e=_1d.prototype;
if(_1c&&(_1e[_18]===_1b&&_1e.hasOwnProperty(_18)||_1c.hidden[_18]===_1b)){
break;
}
}while(_1d=_1a[++pos]);
pos=_1d?pos:-1;
}
}
_1d=_1a[++pos];
if(_1d){
_1e=_1d.prototype;
if(_1d._meta&&_1e.hasOwnProperty(_18)){
f=_1e[_18];
}else{
opf=op[_18];
do{
_1e=_1d.prototype;
f=_1e[_18];
if(f&&(_1d._meta?_1e.hasOwnProperty(_18):f!==opf)){
break;
}
}while(_1d=_1a[++pos]);
}
}
f=_1d&&f||op[_18];
}else{
if(_1f.c!==_1b){
pos=0;
_1c=_1a[0]._meta;
if(_1c&&_1c.ctor!==_1b){
_19=_1c.chains;
if(!_19||_19.constructor!=="manual"){
_8("calling chained constructor with inherited",this.declaredClass);
}
while(_1d=_1a[++pos]){
_1c=_1d._meta;
if(_1c&&_1c.ctor===_1b){
break;
}
}
pos=_1d?pos:-1;
}
}
while(_1d=_1a[++pos]){
_1c=_1d._meta;
f=_1c?_1c.ctor:_1d;
if(f){
break;
}
}
f=_1d&&f;
}
_1f.c=f;
_1f.p=pos;
if(f){
return a===true?f:f.apply(this,a||_17);
}
};
function _20(_21,_22){
if(typeof _21=="string"){
return this.__inherited(_21,_22,true);
}
return this.__inherited(_21,true);
};
function _23(_24,a1,a2){
var f=this.getInherited(_24,a1);
if(f){
return f.apply(this,a2||a1||_24);
}
};
var _25=_1.config.isDebug?_23:_16;
function _26(cls){
var _27=this.constructor._meta.bases;
for(var i=0,l=_27.length;i<l;++i){
if(_27[i]===cls){
return true;
}
}
return this instanceof cls;
};
function _28(_29,_2a){
for(var _2b in _2a){
if(_2b!=_7&&_2a.hasOwnProperty(_2b)){
_29[_2b]=_2a[_2b];
}
}
if(_2("bug-for-in-skips-shadowed")){
for(var _2c=_1._extraNames,i=_2c.length;i;){
_2b=_2c[--i];
if(_2b!=_7&&_2a.hasOwnProperty(_2b)){
_29[_2b]=_2a[_2b];
}
}
}
};
function _2d(_2e,_2f){
var _30,t;
for(_30 in _2f){
t=_2f[_30];
if((t!==op[_30]||!(_30 in op))&&_30!=_7){
if(_4.call(t)=="[object Function]"){
t.nom=_30;
}
_2e[_30]=t;
}
}
if(_2("bug-for-in-skips-shadowed")){
for(var _31=_1._extraNames,i=_31.length;i;){
_30=_31[--i];
t=_2f[_30];
if((t!==op[_30]||!(_30 in op))&&_30!=_7){
if(_4.call(t)=="[object Function]"){
t.nom=_30;
}
_2e[_30]=t;
}
}
}
return _2e;
};
function _32(_33){
_2d(this.prototype,_33);
return this;
};
function _34(_35,_36){
return function(){
var a=arguments,_37=a,a0=a[0],f,i,m,l=_35.length,_38;
if(!(this instanceof a.callee)){
return _39(a);
}
if(_36&&(a0&&a0.preamble||this.preamble)){
_38=new Array(_35.length);
_38[0]=a;
for(i=0;;){
a0=a[0];
if(a0){
f=a0.preamble;
if(f){
a=f.apply(this,a)||a;
}
}
f=_35[i].prototype;
f=f.hasOwnProperty("preamble")&&f.preamble;
if(f){
a=f.apply(this,a)||a;
}
if(++i==l){
break;
}
_38[i]=a;
}
}
for(i=l-1;i>=0;--i){
f=_35[i];
m=f._meta;
f=m?m.ctor:f;
if(f){
f.apply(this,_38?_38[i]:a);
}
}
f=this.postscript;
if(f){
f.apply(this,_37);
}
};
};
function _3a(_3b,_3c){
return function(){
var a=arguments,t=a,a0=a[0],f;
if(!(this instanceof a.callee)){
return _39(a);
}
if(_3c){
if(a0){
f=a0.preamble;
if(f){
t=f.apply(this,t)||t;
}
}
f=this.preamble;
if(f){
f.apply(this,t);
}
}
if(_3b){
_3b.apply(this,a);
}
f=this.postscript;
if(f){
f.apply(this,a);
}
};
};
function _3d(_3e){
return function(){
var a=arguments,i=0,f,m;
if(!(this instanceof a.callee)){
return _39(a);
}
for(;f=_3e[i];++i){
m=f._meta;
f=m?m.ctor:f;
if(f){
f.apply(this,a);
break;
}
}
f=this.postscript;
if(f){
f.apply(this,a);
}
};
};
function _3f(_40,_41,_42){
return function(){
var b,m,f,i=0,_43=1;
if(_42){
i=_41.length-1;
_43=-1;
}
for(;b=_41[i];i+=_43){
m=b._meta;
f=(m?m.hidden:b.prototype)[_40];
if(f){
f.apply(this,arguments);
}
}
};
};
function _44(_45){
_5.prototype=_45.prototype;
var t=new _5;
_5.prototype=null;
return t;
};
function _39(_46){
var _47=_46.callee,t=_44(_47);
_47.apply(t,_46);
return t;
};
_1.declare=function(_48,_49,_4a){
if(typeof _48!="string"){
_4a=_49;
_49=_48;
_48="";
}
_4a=_4a||{};
var _4b,i,t,_4c,_4d,_4e,_4f,_50=1,_51=_49;
if(_4.call(_49)=="[object Array]"){
_4e=_b(_49,_48);
t=_4e[0];
_50=_4e.length-t;
_49=_4e[_50];
}else{
_4e=[0];
if(_49){
if(_4.call(_49)=="[object Function]"){
t=_49._meta;
_4e=_4e.concat(t?t.bases:_49);
}else{
_8("base class is not a callable constructor.",_48);
}
}else{
if(_49!==null){
_8("unknown base class. Did you use dojo.require to pull it in?",_48);
}
}
}
if(_49){
for(i=_50-1;;--i){
_4b=_44(_49);
if(!i){
break;
}
t=_4e[i];
(t._meta?_28:_3)(_4b,t.prototype);
_4c=new Function;
_4c.superclass=_49;
_4c.prototype=_4b;
_49=_4b.constructor=_4c;
}
}else{
_4b={};
}
_2d(_4b,_4a);
t=_4a.constructor;
if(t!==op.constructor){
t.nom=_7;
_4b.constructor=t;
}
for(i=_50-1;i;--i){
t=_4e[i]._meta;
if(t&&t.chains){
_4f=_3(_4f||{},t.chains);
}
}
if(_4b["-chains-"]){
_4f=_3(_4f||{},_4b["-chains-"]);
}
t=!_4f||!_4f.hasOwnProperty(_7);
_4e[0]=_4c=(_4f&&_4f.constructor==="manual")?_3d(_4e):(_4e.length==1?_3a(_4a.constructor,t):_34(_4e,t));
_4c._meta={bases:_4e,hidden:_4a,chains:_4f,parents:_51,ctor:_4a.constructor};
_4c.superclass=_49&&_49.prototype;
_4c.extend=_32;
_4c.prototype=_4b;
_4b.constructor=_4c;
_4b.getInherited=_20;
_4b.isInstanceOf=_26;
_4b.inherited=_25;
_4b.__inherited=_16;
if(_48){
_4b.declaredClass=_48;
_1.setObject(_48,_4c);
}
if(_4f){
for(_4d in _4f){
if(_4b[_4d]&&typeof _4f[_4d]=="string"&&_4d!=_7){
t=_4b[_4d]=_3f(_4d,_4e,_4f[_4d]==="after");
t.nom=_4d;
}
}
}
return _4c;
};
_1.safeMixin=_2d;
return _1.declare;
});
