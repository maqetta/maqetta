/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/selector/acme",["../_base/kernel","../has","../_base/sniff","../_base/array","../_base/lang","../_base/window"],function(_1,_2){
var _3=_1.trim;
var _4=_1.forEach;
var _5=function(){
return _1.doc;
};
var _6=((_1.isWebKit||_1.isMozilla)&&((_5().compatMode)=="BackCompat"));
var _7=">~+";
var _8=false;
var _9=function(){
return true;
};
var _a=function(_b){
if(_7.indexOf(_b.slice(-1))>=0){
_b+=" * ";
}else{
_b+=" ";
}
var ts=function(s,e){
return _3(_b.slice(s,e));
};
var _c=[];
var _d=-1,_e=-1,_f=-1,_10=-1,_11=-1,_12=-1,_13=-1,lc="",cc="",_14;
var x=0,ql=_b.length,_15=null,_16=null;
var _17=function(){
if(_13>=0){
var tv=(_13==x)?null:ts(_13,x);
_15[(_7.indexOf(tv)<0)?"tag":"oper"]=tv;
_13=-1;
}
};
var _18=function(){
if(_12>=0){
_15.id=ts(_12,x).replace(/\\/g,"");
_12=-1;
}
};
var _19=function(){
if(_11>=0){
_15.classes.push(ts(_11+1,x).replace(/\\/g,""));
_11=-1;
}
};
var _1a=function(){
_18();
_17();
_19();
};
var _1b=function(){
_1a();
if(_10>=0){
_15.pseudos.push({name:ts(_10+1,x)});
}
_15.loops=(_15.pseudos.length||_15.attrs.length||_15.classes.length);
_15.oquery=_15.query=ts(_14,x);
_15.otag=_15.tag=(_15["oper"])?null:(_15.tag||"*");
if(_15.tag){
_15.tag=_15.tag.toUpperCase();
}
if(_c.length&&(_c[_c.length-1].oper)){
_15.infixOper=_c.pop();
_15.query=_15.infixOper.query+" "+_15.query;
}
_c.push(_15);
_15=null;
};
for(;lc=cc,cc=_b.charAt(x),x<ql;x++){
if(lc=="\\"){
continue;
}
if(!_15){
_14=x;
_15={query:null,pseudos:[],attrs:[],classes:[],tag:null,oper:null,id:null,getTag:function(){
return (_8)?this.otag:this.tag;
}};
_13=x;
}
if(_d>=0){
if(cc=="]"){
if(!_16.attr){
_16.attr=ts(_d+1,x);
}else{
_16.matchFor=ts((_f||_d+1),x);
}
var cmf=_16.matchFor;
if(cmf){
if((cmf.charAt(0)=="\"")||(cmf.charAt(0)=="'")){
_16.matchFor=cmf.slice(1,-1);
}
}
_15.attrs.push(_16);
_16=null;
_d=_f=-1;
}else{
if(cc=="="){
var _1c=("|~^$*".indexOf(lc)>=0)?lc:"";
_16.type=_1c+cc;
_16.attr=ts(_d+1,x-_1c.length);
_f=x+1;
}
}
}else{
if(_e>=0){
if(cc==")"){
if(_10>=0){
_16.value=ts(_e+1,x);
}
_10=_e=-1;
}
}else{
if(cc=="#"){
_1a();
_12=x+1;
}else{
if(cc=="."){
_1a();
_11=x;
}else{
if(cc==":"){
_1a();
_10=x;
}else{
if(cc=="["){
_1a();
_d=x;
_16={};
}else{
if(cc=="("){
if(_10>=0){
_16={name:ts(_10+1,x),value:null};
_15.pseudos.push(_16);
}
_e=x;
}else{
if((cc==" ")&&(lc!=cc)){
_1b();
}
}
}
}
}
}
}
}
}
return _c;
};
var _1d=function(_1e,_1f){
if(!_1e){
return _1f;
}
if(!_1f){
return _1e;
}
return function(){
return _1e.apply(window,arguments)&&_1f.apply(window,arguments);
};
};
var _20=function(i,arr){
var r=arr||[];
if(i){
r.push(i);
}
return r;
};
var _21=function(n){
return (1==n.nodeType);
};
var _22="";
var _23=function(_24,_25){
if(!_24){
return _22;
}
if(_25=="class"){
return _24.className||_22;
}
if(_25=="for"){
return _24.htmlFor||_22;
}
if(_25=="style"){
return _24.style.cssText||_22;
}
return (_8?_24.getAttribute(_25):_24.getAttribute(_25,2))||_22;
};
var _26={"*=":function(_27,_28){
return function(_29){
return (_23(_29,_27).indexOf(_28)>=0);
};
},"^=":function(_2a,_2b){
return function(_2c){
return (_23(_2c,_2a).indexOf(_2b)==0);
};
},"$=":function(_2d,_2e){
return function(_2f){
var ea=" "+_23(_2f,_2d);
return (ea.lastIndexOf(_2e)==(ea.length-_2e.length));
};
},"~=":function(_30,_31){
var _32=" "+_31+" ";
return function(_33){
var ea=" "+_23(_33,_30)+" ";
return (ea.indexOf(_32)>=0);
};
},"|=":function(_34,_35){
var _36=_35+"-";
return function(_37){
var ea=_23(_37,_34);
return ((ea==_35)||(ea.indexOf(_36)==0));
};
},"=":function(_38,_39){
return function(_3a){
return (_23(_3a,_38)==_39);
};
}};
var _3b=(typeof _5().firstChild.nextElementSibling=="undefined");
var _3c=!_3b?"nextElementSibling":"nextSibling";
var _3d=!_3b?"previousElementSibling":"previousSibling";
var _3e=(_3b?_21:_9);
var _3f=function(_40){
while(_40=_40[_3d]){
if(_3e(_40)){
return false;
}
}
return true;
};
var _41=function(_42){
while(_42=_42[_3c]){
if(_3e(_42)){
return false;
}
}
return true;
};
var _43=function(_44){
var _45=_44.parentNode;
var i=0,_46=_45.children||_45.childNodes,ci=(_44["_i"]||-1),cl=(_45["_l"]||-1);
if(!_46){
return -1;
}
var l=_46.length;
if(cl==l&&ci>=0&&cl>=0){
return ci;
}
_45["_l"]=l;
ci=-1;
for(var te=_45["firstElementChild"]||_45["firstChild"];te;te=te[_3c]){
if(_3e(te)){
te["_i"]=++i;
if(_44===te){
ci=i;
}
}
}
return ci;
};
var _47=function(_48){
return !((_43(_48))%2);
};
var _49=function(_4a){
return ((_43(_4a))%2);
};
var _4b={"checked":function(_4c,_4d){
return function(_4e){
return !!("checked" in _4e?_4e.checked:_4e.selected);
};
},"first-child":function(){
return _3f;
},"last-child":function(){
return _41;
},"only-child":function(_4f,_50){
return function(_51){
return _3f(_51)&&_41(_51);
};
},"empty":function(_52,_53){
return function(_54){
var cn=_54.childNodes;
var cnl=_54.childNodes.length;
for(var x=cnl-1;x>=0;x--){
var nt=cn[x].nodeType;
if((nt===1)||(nt==3)){
return false;
}
}
return true;
};
},"contains":function(_55,_56){
var cz=_56.charAt(0);
if(cz=="\""||cz=="'"){
_56=_56.slice(1,-1);
}
return function(_57){
return (_57.innerHTML.indexOf(_56)>=0);
};
},"not":function(_58,_59){
var p=_a(_59)[0];
var _5a={el:1};
if(p.tag!="*"){
_5a.tag=1;
}
if(!p.classes.length){
_5a.classes=1;
}
var ntf=_5b(p,_5a);
return function(_5c){
return (!ntf(_5c));
};
},"nth-child":function(_5d,_5e){
var pi=parseInt;
if(_5e=="odd"){
return _49;
}else{
if(_5e=="even"){
return _47;
}
}
if(_5e.indexOf("n")!=-1){
var _5f=_5e.split("n",2);
var _60=_5f[0]?((_5f[0]=="-")?-1:pi(_5f[0])):1;
var idx=_5f[1]?pi(_5f[1]):0;
var lb=0,ub=-1;
if(_60>0){
if(idx<0){
idx=(idx%_60)&&(_60+(idx%_60));
}else{
if(idx>0){
if(idx>=_60){
lb=idx-idx%_60;
}
idx=idx%_60;
}
}
}else{
if(_60<0){
_60*=-1;
if(idx>0){
ub=idx;
idx=idx%_60;
}
}
}
if(_60>0){
return function(_61){
var i=_43(_61);
return (i>=lb)&&(ub<0||i<=ub)&&((i%_60)==idx);
};
}else{
_5e=idx;
}
}
var _62=pi(_5e);
return function(_63){
return (_43(_63)==_62);
};
}};
var _64=(_1.isIE&&(_1.isIE<9||_1.isQuirks))?function(_65){
var clc=_65.toLowerCase();
if(clc=="class"){
_65="className";
}
return function(_66){
return (_8?_66.getAttribute(_65):_66[_65]||_66[clc]);
};
}:function(_67){
return function(_68){
return (_68&&_68.getAttribute&&_68.hasAttribute(_67));
};
};
var _5b=function(_69,_6a){
if(!_69){
return _9;
}
_6a=_6a||{};
var ff=null;
if(!("el" in _6a)){
ff=_1d(ff,_21);
}
if(!("tag" in _6a)){
if(_69.tag!="*"){
ff=_1d(ff,function(_6b){
return (_6b&&(_6b.tagName==_69.getTag()));
});
}
}
if(!("classes" in _6a)){
_4(_69.classes,function(_6c,idx,arr){
var re=new RegExp("(?:^|\\s)"+_6c+"(?:\\s|$)");
ff=_1d(ff,function(_6d){
return re.test(_6d.className);
});
ff.count=idx;
});
}
if(!("pseudos" in _6a)){
_4(_69.pseudos,function(_6e){
var pn=_6e.name;
if(_4b[pn]){
ff=_1d(ff,_4b[pn](pn,_6e.value));
}
});
}
if(!("attrs" in _6a)){
_4(_69.attrs,function(_6f){
var _70;
var a=_6f.attr;
if(_6f.type&&_26[_6f.type]){
_70=_26[_6f.type](a,_6f.matchFor);
}else{
if(a.length){
_70=_64(a);
}
}
if(_70){
ff=_1d(ff,_70);
}
});
}
if(!("id" in _6a)){
if(_69.id){
ff=_1d(ff,function(_71){
return (!!_71&&(_71.id==_69.id));
});
}
}
if(!ff){
if(!("default" in _6a)){
ff=_9;
}
}
return ff;
};
var _72=function(_73){
return function(_74,ret,bag){
while(_74=_74[_3c]){
if(_3b&&(!_21(_74))){
continue;
}
if((!bag||_75(_74,bag))&&_73(_74)){
ret.push(_74);
}
break;
}
return ret;
};
};
var _76=function(_77){
return function(_78,ret,bag){
var te=_78[_3c];
while(te){
if(_3e(te)){
if(bag&&!_75(te,bag)){
break;
}
if(_77(te)){
ret.push(te);
}
}
te=te[_3c];
}
return ret;
};
};
var _79=function(_7a){
_7a=_7a||_9;
return function(_7b,ret,bag){
var te,x=0,_7c=_7b.children||_7b.childNodes;
while(te=_7c[x++]){
if(_3e(te)&&(!bag||_75(te,bag))&&(_7a(te,x))){
ret.push(te);
}
}
return ret;
};
};
var _7d=function(_7e,_7f){
var pn=_7e.parentNode;
while(pn){
if(pn==_7f){
break;
}
pn=pn.parentNode;
}
return !!pn;
};
var _80={};
var _81=function(_82){
var _83=_80[_82.query];
if(_83){
return _83;
}
var io=_82.infixOper;
var _84=(io?io.oper:"");
var _85=_5b(_82,{el:1});
var qt=_82.tag;
var _86=("*"==qt);
var ecs=_5()["getElementsByClassName"];
if(!_84){
if(_82.id){
_85=(!_82.loops&&_86)?_9:_5b(_82,{el:1,id:1});
_83=function(_87,arr){
var te=_1.byId(_82.id,(_87.ownerDocument||_87));
if(!te||!_85(te)){
return;
}
if(9==_87.nodeType){
return _20(te,arr);
}else{
if(_7d(te,_87)){
return _20(te,arr);
}
}
};
}else{
if(ecs&&/\{\s*\[native code\]\s*\}/.test(String(ecs))&&_82.classes.length&&!_6){
_85=_5b(_82,{el:1,classes:1,id:1});
var _88=_82.classes.join(" ");
_83=function(_89,arr,bag){
var ret=_20(0,arr),te,x=0;
var _8a=_89.getElementsByClassName(_88);
while((te=_8a[x++])){
if(_85(te,_89)&&_75(te,bag)){
ret.push(te);
}
}
return ret;
};
}else{
if(!_86&&!_82.loops){
_83=function(_8b,arr,bag){
var ret=_20(0,arr),te,x=0;
var _8c=_8b.getElementsByTagName(_82.getTag());
while((te=_8c[x++])){
if(_75(te,bag)){
ret.push(te);
}
}
return ret;
};
}else{
_85=_5b(_82,{el:1,tag:1,id:1});
_83=function(_8d,arr,bag){
var ret=_20(0,arr),te,x=0;
var _8e=_8d.getElementsByTagName(_82.getTag());
while((te=_8e[x++])){
if(_85(te,_8d)&&_75(te,bag)){
ret.push(te);
}
}
return ret;
};
}
}
}
}else{
var _8f={el:1};
if(_86){
_8f.tag=1;
}
_85=_5b(_82,_8f);
if("+"==_84){
_83=_72(_85);
}else{
if("~"==_84){
_83=_76(_85);
}else{
if(">"==_84){
_83=_79(_85);
}
}
}
}
return _80[_82.query]=_83;
};
var _90=function(_91,_92){
var _93=_20(_91),qp,x,te,qpl=_92.length,bag,ret;
for(var i=0;i<qpl;i++){
ret=[];
qp=_92[i];
x=_93.length-1;
if(x>0){
bag={};
ret.nozip=true;
}
var gef=_81(qp);
for(var j=0;(te=_93[j]);j++){
gef(te,ret,bag);
}
if(!ret.length){
break;
}
_93=ret;
}
return ret;
};
var _94={},_95={};
var _96=function(_97){
var _98=_a(_3(_97));
if(_98.length==1){
var tef=_81(_98[0]);
return function(_99){
var r=tef(_99,[]);
if(r){
r.nozip=true;
}
return r;
};
}
return function(_9a){
return _90(_9a,_98);
};
};
var nua=navigator.userAgent;
var wk="WebKit/";
var _9b=(_1.isWebKit&&(nua.indexOf(wk)>0)&&(parseFloat(nua.split(wk)[1])>528));
var _9c=_1.isIE?"commentStrip":"nozip";
var qsa="querySelectorAll";
var _9d=(!!_5()[qsa]&&(!_1.isSafari||(_1.isSafari>3.1)||_9b));
var _9e=/n\+\d|([^ ])?([>~+])([^ =])?/g;
var _9f=function(_a0,pre,ch,_a1){
return ch?(pre?pre+" ":"")+ch+(_a1?" "+_a1:""):_a0;
};
var _a2=function(_a3,_a4){
_a3=_a3.replace(_9e,_9f);
if(_9d){
var _a5=_95[_a3];
if(_a5&&!_a4){
return _a5;
}
}
var _a6=_94[_a3];
if(_a6){
return _a6;
}
var qcz=_a3.charAt(0);
var _a7=(-1==_a3.indexOf(" "));
if((_a3.indexOf("#")>=0)&&(_a7)){
_a4=true;
}
var _a8=(_9d&&(!_a4)&&(_7.indexOf(qcz)==-1)&&(!_1.isIE||(_a3.indexOf(":")==-1))&&(!(_6&&(_a3.indexOf(".")>=0)))&&(_a3.indexOf(":contains")==-1)&&(_a3.indexOf(":checked")==-1)&&(_a3.indexOf("|=")==-1));
if(_a8){
var tq=(_7.indexOf(_a3.charAt(_a3.length-1))>=0)?(_a3+" *"):_a3;
return _95[_a3]=function(_a9){
try{
if(!((9==_a9.nodeType)||_a7)){
throw "";
}
var r=_a9[qsa](tq);
r[_9c]=true;
return r;
}
catch(e){
return _a2(_a3,true)(_a9);
}
};
}else{
var _aa=_a3.split(/\s*,\s*/);
return _94[_a3]=((_aa.length<2)?_96(_a3):function(_ab){
var _ac=0,ret=[],tp;
while((tp=_aa[_ac++])){
ret=ret.concat(_96(tp)(_ab));
}
return ret;
});
}
};
var _ad=0;
var _ae=_1.isIE?function(_af){
if(_8){
return (_af.getAttribute("_uid")||_af.setAttribute("_uid",++_ad)||_ad);
}else{
return _af.uniqueID;
}
}:function(_b0){
return (_b0._uid||(_b0._uid=++_ad));
};
var _75=function(_b1,bag){
if(!bag){
return 1;
}
var id=_ae(_b1);
if(!bag[id]){
return bag[id]=1;
}
return 0;
};
var _b2="_zipIdx";
var _b3=function(arr){
if(arr&&arr.nozip){
return arr;
}
var ret=[];
if(!arr||!arr.length){
return ret;
}
if(arr[0]){
ret.push(arr[0]);
}
if(arr.length<2){
return ret;
}
_ad++;
if(_1.isIE&&_8){
var _b4=_ad+"";
arr[0].setAttribute(_b2,_b4);
for(var x=1,te;te=arr[x];x++){
if(arr[x].getAttribute(_b2)!=_b4){
ret.push(te);
}
te.setAttribute(_b2,_b4);
}
}else{
if(_1.isIE&&arr.commentStrip){
try{
for(var x=1,te;te=arr[x];x++){
if(_21(te)){
ret.push(te);
}
}
}
catch(e){
}
}else{
if(arr[0]){
arr[0][_b2]=_ad;
}
for(var x=1,te;te=arr[x];x++){
if(arr[x][_b2]!=_ad){
ret.push(te);
}
te[_b2]=_ad;
}
}
}
return ret;
};
var _b5=function(_b6,_b7){
_b7=_b7||_5();
var od=_b7.ownerDocument||_b7.documentElement;
_8=(_b7.contentType&&_b7.contentType=="application/xml")||(_1.isOpera&&(_b7.doctype||od.toString()=="[object XMLDocument]"))||(!!od)&&(_1.isIE?od.xml:(_b7.xmlVersion||od.xmlVersion));
var r=_a2(_b6)(_b7);
if(r&&r.nozip){
return r;
}
return _b3(r);
};
_b5.filter=function(_b8,_b9,_ba){
var _bb=[],_bc=_a(_b9),_bd=(_bc.length==1&&!/[^\w#\.]/.test(_b9))?_5b(_bc[0]):function(_be){
return _1.query(_b9,_ba).indexOf(_be)!=-1;
};
for(var x=0,te;te=_b8[x];x++){
if(_bd(te)){
_bb.push(te);
}
}
return _bb;
};
return _b5;
});
