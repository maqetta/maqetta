/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/tools/TextBlock",["dojo","../stencil/Text","../util/oo","../manager/_registry"],function(_1){
var _2;
_1.addOnLoad(function(){
_2=_1.byId("conEdit");
if(!_2){
console.error("A contenteditable div is missing from the main document. See 'dojox.drawing.tools.TextBlock'");
}else{
_2.parentNode.removeChild(_2);
}
});
dojox.drawing.tools.TextBlock=dojox.drawing.util.oo.declare(dojox.drawing.stencil.Text,function(_3){
if(_3.data){
var d=_3.data;
var _4=d.text?this.typesetter(d.text):d.text;
var w=!d.width?this.style.text.minWidth:d.width=="auto"?"auto":Math.max(d.width,this.style.text.minWidth);
var h=this._lineHeight;
if(_4&&w=="auto"){
var o=this.measureText(this.cleanText(_4,false),w);
w=o.w;
h=o.h;
}else{
this._text="";
}
this.points=[{x:d.x,y:d.y},{x:d.x+w,y:d.y},{x:d.x+w,y:d.y+h},{x:d.x,y:d.y+h}];
if(d.showEmpty||_4){
this.editMode=true;
_1.disconnect(this._postRenderCon);
this._postRenderCon=null;
this.connect(this,"render",this,"onRender",true);
if(d.showEmpty){
this._text=_4||"";
this.edit();
}else{
if(_4&&d.editMode){
this._text="";
this.edit();
}else{
if(_4){
this.render(_4);
}
}
}
setTimeout(_1.hitch(this,function(){
this.editMode=false;
}),100);
}else{
this.render();
}
}else{
this.connectMouse();
this._postRenderCon=_1.connect(this,"render",this,"_onPostRender");
}
},{draws:true,baseRender:false,type:"dojox.drawing.tools.TextBlock",_caretStart:0,_caretEnd:0,_blockExec:false,selectOnExec:true,showEmpty:false,onDrag:function(_5){
if(!this.parentNode){
this.showParent(_5);
}
var s=this._startdrag,e=_5.page;
this._box.left=(s.x<e.x?s.x:e.x);
this._box.top=s.y;
this._box.width=(s.x<e.x?e.x-s.x:s.x-e.x)+this.style.text.pad;
_1.style(this.parentNode,this._box.toPx());
},onUp:function(_6){
if(!this._downOnCanvas){
return;
}
this._downOnCanvas=false;
var c=_1.connect(this,"render",this,function(){
_1.disconnect(c);
this.onRender(this);
});
this.editMode=true;
this.showParent(_6);
this.created=true;
this.createTextField();
this.connectTextField();
},showParent:function(_7){
if(this.parentNode){
return;
}
var x=_7.pageX||10;
var y=_7.pageY||10;
this.parentNode=_1.doc.createElement("div");
this.parentNode.id=this.id;
var d=this.style.textMode.create;
this._box={left:x,top:y,width:_7.width||1,height:_7.height&&_7.height>8?_7.height:this._lineHeight,border:d.width+"px "+d.style+" "+d.color,position:"absolute",zIndex:500,toPx:function(){
var o={};
for(var nm in this){
o[nm]=typeof (this[nm])=="number"&&nm!="zIndex"?this[nm]+"px":this[nm];
}
return o;
}};
_1.style(this.parentNode,this._box);
document.body.appendChild(this.parentNode);
},createTextField:function(_8){
var d=this.style.textMode.edit;
this._box.border=d.width+"px "+d.style+" "+d.color;
this._box.height="auto";
this._box.width=Math.max(this._box.width,this.style.text.minWidth*this.mouse.zoom);
_1.style(this.parentNode,this._box.toPx());
this.parentNode.appendChild(_2);
_1.style(_2,{height:_8?"auto":this._lineHeight+"px",fontSize:(this.textSize/this.mouse.zoom)+"px",fontFamily:this.style.text.family});
_2.innerHTML=_8||"";
return _2;
},connectTextField:function(){
if(this._textConnected){
return;
}
var _9=dijit.byId("greekPalette");
var _a=_9==undefined?false:true;
if(_a){
_1.mixin(_9,{_pushChangeTo:_2,_textBlock:this});
}
this._textConnected=true;
this._dropMode=false;
this.mouse.setEventMode("TEXT");
this.keys.editMode(true);
var _b,_c,_d,_e,_f=this,_10=false,_11=function(){
if(_f._dropMode){
return;
}
_1.forEach([_b,_c,_d,_e],function(c){
_1.disconnect(c);
});
_f._textConnected=false;
_f.keys.editMode(false);
_f.mouse.setEventMode();
_f.execText();
};
_b=_1.connect(_2,"keyup",this,function(evt){
if(_1.trim(_2.innerHTML)&&!_10){
_1.style(_2,"height","auto");
_10=true;
}else{
if(_1.trim(_2.innerHTML).length<2&&_10){
_1.style(_2,"height",this._lineHeight+"px");
_10=false;
}
}
if(!this._blockExec){
if(evt.keyCode==13||evt.keyCode==27){
_1.stopEvent(evt);
_11();
}
}else{
if(evt.keyCode==_1.keys.SPACE){
_1.stopEvent(evt);
_a&&_9.onCancel();
}
}
});
_c=_1.connect(_2,"keydown",this,function(evt){
if(evt.keyCode==13||evt.keyCode==27){
_1.stopEvent(evt);
}
if(evt.keyCode==220){
if(!_a){
return;
}
_1.stopEvent(evt);
this.getSelection(_2);
this.insertText(_2,"\\");
this._dropMode=true;
this._blockExec=true;
_9.show({around:this.parentNode,orient:{"BL":"TL"}});
}
if(!this._dropMode){
this._blockExec=false;
}else{
switch(evt.keyCode){
case _1.keys.UP_ARROW:
case _1.keys.DOWN_ARROW:
case _1.keys.LEFT_ARROW:
case _1.keys.RIGHT_ARROW:
_1.stopEvent(evt);
_9._navigateByArrow(evt);
break;
case _1.keys.ENTER:
_1.stopEvent(evt);
_9._onCellClick(evt);
break;
case _1.keys.BACKSPACE:
case _1.keys.DELETE:
_1.stopEvent(evt);
_9.onCancel();
break;
}
}
});
_d=_1.connect(document,"mouseup",this,function(evt){
if(!this._onAnchor&&evt.target.id!="conEdit"){
_1.stopEvent(evt);
_11();
}else{
if(evt.target.id=="conEdit"&&_2.innerHTML==""){
_2.blur();
setTimeout(function(){
_2.focus();
},200);
}
}
});
this.createAnchors();
_e=_1.connect(this.mouse,"setZoom",this,function(evt){
_11();
});
_2.focus();
this.onDown=function(){
};
this.onDrag=function(){
};
setTimeout(_1.hitch(this,function(){
_2.focus();
this.onUp=function(){
if(!_f._onAnchor&&this.parentNode){
_f.disconnectMouse();
_11();
_f.onUp=function(){
};
}
};
}),500);
},execText:function(){
var d=_1.marginBox(this.parentNode);
var w=Math.max(d.w,this.style.text.minWidth);
var txt=this.cleanText(_2.innerHTML,true);
_2.innerHTML="";
_2.blur();
this.destroyAnchors();
txt=this.typesetter(txt);
var o=this.measureText(txt,w);
var sc=this.mouse.scrollOffset();
var org=this.mouse.origin;
var x=this._box.left+sc.left-org.x;
var y=this._box.top+sc.top-org.y;
x*=this.mouse.zoom;
y*=this.mouse.zoom;
w*=this.mouse.zoom;
o.h*=this.mouse.zoom;
this.points=[{x:x,y:y},{x:x+w,y:y},{x:x+w,y:y+o.h},{x:x,y:y+o.h}];
this.editMode=false;
if(!o.text){
this._text="";
this._textArray=[];
}
this.render(o.text);
this.onChangeText(this.getText());
},edit:function(){
this.editMode=true;
var _12=this.getText()||"";
if(this.parentNode||!this.points){
return;
}
var d=this.pointsToData();
var sc=this.mouse.scrollOffset();
var org=this.mouse.origin;
var obj={pageX:(d.x)/this.mouse.zoom-sc.left+org.x,pageY:(d.y)/this.mouse.zoom-sc.top+org.y,width:d.width/this.mouse.zoom,height:d.height/this.mouse.zoom};
this.remove(this.shape,this.hit);
this.showParent(obj);
this.createTextField(_12.replace("/n"," "));
this.connectTextField();
if(_12){
this.setSelection(_2,"end");
}
},cleanText:function(txt,_13){
var _14=function(str){
var _15={"&lt;":"<","&gt;":">","&amp;":"&"};
for(var nm in _15){
str=str.replace(new RegExp(nm,"gi"),_15[nm]);
}
return str;
};
if(_13){
_1.forEach(["<br>","<br/>","<br />","\\n","\\r"],function(br){
txt=txt.replace(new RegExp(br,"gi")," ");
});
}
txt=txt.replace(/&nbsp;/g," ");
txt=_14(txt);
txt=_1.trim(txt);
txt=txt.replace(/\s{2,}/g," ");
return txt;
},measureText:function(str,_16){
var r="(<br\\s*/*>)|(\\n)|(\\r)";
this.showParent({width:_16||"auto",height:"auto"});
this.createTextField(str);
var txt="";
var el=_2;
el.innerHTML="X";
var h=_1.marginBox(el).h;
el.innerHTML=str;
if(!_16||new RegExp(r,"gi").test(str)){
txt=str.replace(new RegExp(r,"gi"),"\n");
el.innerHTML=str.replace(new RegExp(r,"gi"),"<br/>");
}else{
if(_1.marginBox(el).h==h){
txt=str;
}else{
var ar=str.split(" ");
var _17=[[]];
var _18=0;
el.innerHTML="";
while(ar.length){
var _19=ar.shift();
el.innerHTML+=_19+" ";
if(_1.marginBox(el).h>h){
_18++;
_17[_18]=[];
el.innerHTML=_19+" ";
}
_17[_18].push(_19);
}
_1.forEach(_17,function(ar,i){
_17[i]=ar.join(" ");
});
txt=_17.join("\n");
el.innerHTML=txt.replace("\n","<br/>");
}
}
var dim=_1.marginBox(el);
_2.parentNode.removeChild(_2);
_1.destroy(this.parentNode);
this.parentNode=null;
return {h:dim.h,w:dim.w,text:txt};
},_downOnCanvas:false,onDown:function(obj){
this._startdrag={x:obj.pageX,y:obj.pageY};
_1.disconnect(this._postRenderCon);
this._postRenderCon=null;
this._downOnCanvas=true;
},createAnchors:function(){
this._anchors={};
var _1a=this;
var d=this.style.anchors,b=d.width,w=d.size-b*2,h=d.size-b*2,p=(d.size)/2*-1+"px";
var s={position:"absolute",width:w+"px",height:h+"px",backgroundColor:d.fill,border:b+"px "+d.style+" "+d.color};
if(_1.isIE){
s.paddingLeft=w+"px";
s.fontSize=w+"px";
}
var ss=[{top:p,left:p},{top:p,right:p},{bottom:p,right:p},{bottom:p,left:p}];
for(var i=0;i<4;i++){
var _1b=(i==0)||(i==3);
var id=this.util.uid(_1b?"left_anchor":"right_anchor");
var a=_1.create("div",{id:id},this.parentNode);
_1.style(a,_1.mixin(_1.clone(s),ss[i]));
var md,mm,mu;
var md=_1.connect(a,"mousedown",this,function(evt){
_1b=evt.target.id.indexOf("left")>-1;
_1a._onAnchor=true;
var _1c=evt.pageX;
var _1d=this._box.width;
_1.stopEvent(evt);
mm=_1.connect(document,"mousemove",this,function(evt){
var x=evt.pageX;
if(_1b){
this._box.left=x;
this._box.width=_1d+_1c-x;
}else{
this._box.width=x+_1d-_1c;
}
_1.style(this.parentNode,this._box.toPx());
});
mu=_1.connect(document,"mouseup",this,function(evt){
_1c=this._box.left;
_1d=this._box.width;
_1.disconnect(mm);
_1.disconnect(mu);
_1a._onAnchor=false;
_2.focus();
_1.stopEvent(evt);
});
});
this._anchors[id]={a:a,cons:[md]};
}
},destroyAnchors:function(){
for(var n in this._anchors){
_1.forEach(this._anchors[n].con,_1.disconnect,_1);
_1.destroy(this._anchors[n].a);
}
},setSavedCaret:function(val){
this._caretStart=this._caretEnd=val;
},getSavedCaret:function(){
return {start:this._caretStart,end:this._caretEnd};
},insertText:function(_1e,val){
var t,_1f=_1e.innerHTML;
var _20=this.getSavedCaret();
_1f=_1f.replace(/&nbsp;/g," ");
t=_1f.substr(0,_20.start)+val+_1f.substr(_20.end);
t=this.cleanText(t,true);
this.setSavedCaret(Math.min(t.length,(_20.end+val.length)));
_1e.innerHTML=t;
this.setSelection(_1e,"stored");
},getSelection:function(_21){
var _22,end;
if(_1.doc.selection){
var r=_1.doc.selection.createRange();
var rs=_1.body().createTextRange();
rs.moveToElementText(_21);
var re=rs.duplicate();
rs.moveToBookmark(r.getBookmark());
re.setEndPoint("EndToStart",rs);
_22=this._caretStart=re.text.length;
end=this._caretEnd=re.text.length+r.text.length;
console.warn("Caret start: ",_22," end: ",end," length: ",re.text.length," text: ",re.text);
}else{
this._caretStart=_1.global.getSelection().getRangeAt(_21).startOffset;
this._caretEnd=_1.global.getSelection().getRangeAt(_21).endOffset;
}
},setSelection:function(_23,_24){
console.warn("setSelection:");
if(_1.doc.selection){
var rs=_1.body().createTextRange();
rs.moveToElementText(_23);
switch(_24){
case "end":
rs.collapse(false);
break;
case "beg"||"start":
rs.collapse();
break;
case "all":
rs.collapse();
rs.moveStart("character",0);
rs.moveEnd("character",_23.text.length);
break;
case "stored":
rs.collapse();
var dif=this._caretStart-this._caretEnd;
rs.moveStart("character",this._caretStart);
rs.moveEnd("character",dif);
break;
}
rs.select();
}else{
var _25=function(_26,_27){
_27=_27||[];
for(var i=0;i<_26.childNodes.length;i++){
var n=_26.childNodes[i];
if(n.nodeType==3){
_27.push(n);
}else{
if(n.tagName&&n.tagName.toLowerCase()=="img"){
_27.push(n);
}
}
if(n.childNodes&&n.childNodes.length){
_25(n,_27);
}
}
return _27;
};
_23.focus();
var _28=_1.global.getSelection();
_28.removeAllRanges();
var r=_1.doc.createRange();
var _29=_25(_23);
switch(_24){
case "end":
undefined;
r.setStart(_29[_29.length-1],_29[_29.length-1].textContent.length);
r.setEnd(_29[_29.length-1],_29[_29.length-1].textContent.length);
break;
case "beg"||"start":
r.setStart(_29[0],0);
r.setEnd(_29[0],0);
break;
case "all":
r.setStart(_29[0],0);
r.setEnd(_29[_29.length-1],_29[_29.length-1].textContent.length);
break;
case "stored":
undefined;
r.setStart(_29[0],this._caretStart);
r.setEnd(_29[0],this._caretEnd);
}
_28.addRange(r);
}
}});
dojox.drawing.tools.TextBlock.setup={name:"dojox.drawing.tools.TextBlock",tooltip:"Text Tool",iconClass:"iconText"};
dojox.drawing.register(dojox.drawing.tools.TextBlock.setup,"tool");
return dojox.drawing.tools.TextBlock;
});
