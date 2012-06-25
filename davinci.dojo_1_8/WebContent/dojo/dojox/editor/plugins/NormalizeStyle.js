//>>built
define("dojox/editor/plugins/NormalizeStyle",["dojo","dijit","dojox","dijit/_editor/_Plugin","dijit/_editor/html","dojo/_base/connect","dojo/_base/declare"],function(_1,_2,_3,_4){
_1.declare("dojox.editor.plugins.NormalizeStyle",_4,{mode:"semantic",condenseSpans:true,setEditor:function(_5){
this.editor=_5;
_5.customUndo=true;
if(this.mode==="semantic"){
this.editor.contentDomPostFilters.push(_1.hitch(this,this._convertToSemantic));
}else{
if(this.mode==="css"){
this.editor.contentDomPostFilters.push(_1.hitch(this,this._convertToCss));
}
}
if(_1.isIE){
this.editor.contentDomPreFilters.push(_1.hitch(this,this._convertToSemantic));
this._browserFilter=this._convertToSemantic;
}else{
if(_1.isWebKit){
this.editor.contentDomPreFilters.push(_1.hitch(this,this._convertToCss));
this._browserFilter=this._convertToCss;
}else{
if(_1.isMoz){
this.editor.contentDomPreFilters.push(_1.hitch(this,this._convertToSemantic));
this._browserFilter=this._convertToSemantic;
}else{
this.editor.contentDomPreFilters.push(_1.hitch(this,this._convertToSemantic));
this._browserFilter=this._convertToSemantic;
}
}
}
if(this.editor._inserthtmlImpl){
this.editor._oldInsertHtmlImpl=this.editor._inserthtmlImpl;
}
this.editor._inserthtmlImpl=_1.hitch(this,this._inserthtmlImpl);
},_convertToSemantic:function(_6){
if(_6){
var _7=this.editor.document;
var _8=this;
var _9=function(_a){
if(_a.nodeType==1){
if(_a.id!=="dijitEditorBody"){
var _b=_a.style;
var _c=_a.tagName?_a.tagName.toLowerCase():"";
var _d;
if(_b&&_c!="table"&&_c!="ul"&&_c!="ol"){
var fw=_b.fontWeight?_b.fontWeight.toLowerCase():"";
var fs=_b.fontStyle?_b.fontStyle.toLowerCase():"";
var td=_b.textDecoration?_b.textDecoration.toLowerCase():"";
var s=_b.fontSize?_b.fontSize.toLowerCase():"";
var bc=_b.backgroundColor?_b.backgroundColor.toLowerCase():"";
var c=_b.color?_b.color.toLowerCase():"";
var _e=function(_f,_10){
if(_f){
while(_10.firstChild){
_f.appendChild(_10.firstChild);
}
if(_c=="span"&&!_10.style.cssText){
_1.place(_f,_10,"before");
_10.parentNode.removeChild(_10);
_10=_f;
}else{
_10.appendChild(_f);
}
}
return _10;
};
switch(fw){
case "bold":
case "bolder":
case "700":
case "800":
case "900":
_d=_7.createElement("b");
_a.style.fontWeight="";
break;
}
_a=_e(_d,_a);
_d=null;
if(fs=="italic"){
_d=_7.createElement("i");
_a.style.fontStyle="";
}
_a=_e(_d,_a);
_d=null;
if(td){
var da=td.split(" ");
var _11=0;
_1.forEach(da,function(s){
switch(s){
case "underline":
_d=_7.createElement("u");
break;
case "line-through":
_d=_7.createElement("strike");
break;
}
_11++;
if(_11==da.length){
_a.style.textDecoration="";
}
_a=_e(_d,_a);
_d=null;
});
}
if(s){
var _12={"xx-small":1,"x-small":2,"small":3,"medium":4,"large":5,"x-large":6,"xx-large":7,"-webkit-xxx-large":7};
if(s.indexOf("pt")>0){
s=s.substring(0,s.indexOf("pt"));
s=parseInt(s);
if(s<5){
s="xx-small";
}else{
if(s<10){
s="x-small";
}else{
if(s<15){
s="small";
}else{
if(s<20){
s="medium";
}else{
if(s<25){
s="large";
}else{
if(s<30){
s="x-large";
}else{
if(s>30){
s="xx-large";
}
}
}
}
}
}
}
}else{
if(s.indexOf("px")>0){
s=s.substring(0,s.indexOf("px"));
s=parseInt(s);
if(s<5){
s="xx-small";
}else{
if(s<10){
s="x-small";
}else{
if(s<15){
s="small";
}else{
if(s<20){
s="medium";
}else{
if(s<25){
s="large";
}else{
if(s<30){
s="x-large";
}else{
if(s>30){
s="xx-large";
}
}
}
}
}
}
}
}
}
var _13=_12[s];
if(!_13){
_13=3;
}
_d=_7.createElement("font");
font.setAttribute("size",_13);
_a.style.fontSize="";
}
_a=_e(_d,_a);
_d=null;
if(bc&&_c!=="font"&&_8._isInline(_c)){
bc=new _1.Color(bc).toHex();
_d=_7.createElement("font");
_d.style.backgroundColor=bc;
_a.style.backgroundColor="";
}
if(c&&_c!=="font"){
c=new _1.Color(c).toHex();
_d=_7.createElement("font");
_d.setAttribute("color",c);
_a.style.color="";
}
_a=_e(_d,_a);
_d=null;
}
}
if(_a.childNodes){
var _14=[];
_1.forEach(_a.childNodes,function(n){
_14.push(n);
});
_1.forEach(_14,_9);
}
}
return _a;
};
return this._normalizeTags(_9(_6));
}
return _6;
},_normalizeTags:function(_15){
var w=this.editor.window;
_1.query("em,s,strong",_15).forEach(function(n){
var tag=n.tagName?n.tagName.toLowerCase():"";
var _16;
switch(tag){
case "s":
_16="strike";
break;
case "em":
_16="i";
break;
case "strong":
_16="b";
break;
}
if(_16){
var _17=doc.createElement(_16);
_1.place("<"+_16+">",n,"before");
while(n.firstChild){
_17.appendChild(n.firstChild);
}
n.parentNode.removeChild(n);
}
});
return _15;
},_convertToCss:function(_18){
if(_18){
var doc=this.editor.document;
var _19=function(_1a){
if(_1a.nodeType==1){
if(_1a.id!=="dijitEditorBody"){
var tag=_1a.tagName?_1a.tagName.toLowerCase():"";
if(tag){
var _1b;
switch(tag){
case "b":
case "strong":
_1b=doc.createElement("span");
_1b.style.fontWeight="bold";
break;
case "i":
case "em":
_1b=doc.createElement("span");
_1b.style.fontStyle="italic";
break;
case "u":
_1b=doc.createElement("span");
_1b.style.textDecoration="underline";
break;
case "strike":
case "s":
_1b=doc.createElement("span");
_1b.style.textDecoration="line-through";
break;
case "font":
var _1c={};
if(_1.attr(_1a,"color")){
_1c.color=_1.attr(_1a,"color");
}
if(_1.attr(_1a,"face")){
_1c.fontFace=_1.attr(_1a,"face");
}
if(_1a.style&&_1a.style.backgroundColor){
_1c.backgroundColor=_1a.style.backgroundColor;
}
if(_1a.style&&_1a.style.color){
_1c.color=_1a.style.color;
}
var _1d={1:"xx-small",2:"x-small",3:"small",4:"medium",5:"large",6:"x-large",7:"xx-large"};
if(_1.attr(_1a,"size")){
_1c.fontSize=_1d[_1.attr(_1a,"size")];
}
_1b=doc.createElement("span");
_1.style(_1b,_1c);
break;
}
if(_1b){
while(_1a.firstChild){
_1b.appendChild(_1a.firstChild);
}
_1.place(_1b,_1a,"before");
_1a.parentNode.removeChild(_1a);
_1a=_1b;
}
}
}
if(_1a.childNodes){
var _1e=[];
_1.forEach(_1a.childNodes,function(n){
_1e.push(n);
});
_1.forEach(_1e,_19);
}
}
return _1a;
};
_18=_19(_18);
if(this.condenseSpans){
this._condenseSpans(_18);
}
}
return _18;
},_condenseSpans:function(_1f){
var _20=function(_21){
var _22=function(_23){
var m;
if(_23){
m={};
var _24=_23.toLowerCase().split(";");
_1.forEach(_24,function(s){
if(s){
var ss=s.split(":");
var key=ss[0]?_1.trim(ss[0]):"";
var val=ss[1]?_1.trim(ss[1]):"";
if(key&&val){
var i;
var _25="";
for(i=0;i<key.length;i++){
var ch=key.charAt(i);
if(ch=="-"){
i++;
ch=key.charAt(i);
_25+=ch.toUpperCase();
}else{
_25+=ch;
}
}
m[_25]=val;
}
}
});
}
return m;
};
if(_21&&_21.nodeType==1){
var tag=_21.tagName?_21.tagName.toLowerCase():"";
if(tag==="span"&&_21.childNodes&&_21.childNodes.length===1){
var c=_21.firstChild;
while(c&&c.nodeType==1&&c.tagName&&c.tagName.toLowerCase()=="span"){
if(!_1.attr(c,"class")&&!_1.attr(c,"id")&&c.style){
var s1=_22(_21.style.cssText);
var s2=_22(c.style.cssText);
if(s1&&s2){
var _26={};
var i;
for(i in s1){
if(!s1[i]||!s2[i]||s1[i]==s2[i]){
_26[i]=s1[i];
delete s2[i];
}else{
if(s1[i]!=s2[i]){
if(i=="textDecoration"){
_26[i]=s1[i]+" "+s2[i];
delete s2[i];
}else{
_26=null;
}
break;
}else{
_26=null;
break;
}
}
}
if(_26){
for(i in s2){
_26[i]=s2[i];
}
_1.style(_21,_26);
while(c.firstChild){
_21.appendChild(c.firstChild);
}
var t=c.nextSibling;
c.parentNode.removeChild(c);
c=t;
}else{
c=c.nextSibling;
}
}else{
c=c.nextSibling;
}
}else{
c=c.nextSibling;
}
}
}
}
if(_21.childNodes&&_21.childNodes.length){
_1.forEach(_21.childNodes,_20);
}
};
_20(_1f);
},_isInline:function(tag){
switch(tag){
case "a":
case "b":
case "strong":
case "s":
case "strike":
case "i":
case "u":
case "em":
case "sup":
case "sub":
case "span":
case "font":
case "big":
case "cite":
case "q":
case "img":
case "small":
return true;
default:
return false;
}
},_inserthtmlImpl:function(_27){
if(_27){
var div=doc.createElement("div");
div.innerHTML=_27;
div=this._browserFilter(div);
_27=_2._editor.getChildrenHtml(div);
div.innerHTML="";
if(this.editor._oldInsertHtmlImpl){
return this.editor._oldInsertHtmlImpl(_27);
}else{
return this.editor.execCommand("inserthtml",_27);
}
}
return false;
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
var _28=o.args.name.toLowerCase();
if(_28==="normalizestyle"){
o.plugin=new _3.editor.plugins.NormalizeStyle({mode:("mode" in o.args)?o.args.mode:"semantic",condenseSpans:("condenseSpans" in o.args)?o.args.condenseSpans:true});
}
});
return _3.editor.plugins.NormalizeStyle;
});
