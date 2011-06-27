/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/TimePicker.html"]="<div id=\"widget_${id}\" class=\"dijitMenu\"\n    ><div dojoAttachPoint=\"upArrow\" class=\"dijitButtonNode dijitUpArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" role=\"presentation\">&nbsp;</div\n\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div></div\n    ><div dojoAttachPoint=\"timeMenu,focusNode\" dojoAttachEvent=\"onclick:_onOptionSelected,onmouseover,onmouseout\"></div\n    ><div dojoAttachPoint=\"downArrow\" class=\"dijitButtonNode dijitDownArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" role=\"presentation\">&nbsp;</div\n\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div></div\n></div>\n";
define("dijit/_TimePicker",["dojo/_base/kernel",".","dojo/text!./templates/TimePicker.html","./form/_FormWidget","dojo/date/locale","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/sniff","dojo/date","dojo/date/stamp","dojo/query","dijit/typematic"],function(_1,_2,_3){
_1.declare("dijit._TimePicker",[_2._Widget,_2._TemplatedMixin],{templateString:_3,baseClass:"dijitTimePicker",clickableIncrement:"T00:15:00",visibleIncrement:"T01:00:00",visibleRange:"T05:00:00",value:new Date(),_visibleIncrement:2,_clickableIncrement:1,_totalIncrements:10,constraints:{},serialize:_1.date.stamp.toISOString,setValue:function(_4){
_1.deprecated("dijit._TimePicker:setValue() is deprecated.  Use set('value', ...) instead.","","2.0");
this.set("value",_4);
},_setValueAttr:function(_5){
this._set("value",_5);
this._showText();
},_setFilterStringAttr:function(_6){
this._set("filterString",_6);
this._showText();
},isDisabledDate:function(_7,_8){
return false;
},_getFilteredNodes:function(_9,_a,_b,_c){
var _d=[],_e=_c?_c.date:this._refDate,n,i=_9,_f=this._maxIncrement+Math.abs(i),chk=_b?-1:1,dec=_b?1:0,inc=1-dec;
do{
i=i-dec;
n=this._createOption(i);
if(n){
if((_b&&n.date>_e)||(!_b&&n.date<_e)){
break;
}
_d[_b?"unshift":"push"](n);
_e=n.date;
}
i=i+inc;
}while(_d.length<_a&&(i*chk)<_f);
return _d;
},_showText:function(){
var _10=_1.date.stamp.fromISOString;
this.timeMenu.innerHTML="";
this._clickableIncrementDate=_10(this.clickableIncrement);
this._visibleIncrementDate=_10(this.visibleIncrement);
this._visibleRangeDate=_10(this.visibleRange);
var _11=function(_12){
return _12.getHours()*60*60+_12.getMinutes()*60+_12.getSeconds();
},_13=_11(this._clickableIncrementDate),_14=_11(this._visibleIncrementDate),_15=_11(this._visibleRangeDate),_16=(this.value||this.currentFocus).getTime();
this._refDate=new Date(_16-_16%(_14*1000));
this._refDate.setFullYear(1970,0,1);
this._clickableIncrement=1;
this._totalIncrements=_15/_13;
this._visibleIncrement=_14/_13;
this._maxIncrement=(60*60*24)/_13;
var _17=this._getFilteredNodes(0,Math.min(this._totalIncrements>>1,10)-1),_18=this._getFilteredNodes(0,Math.min(this._totalIncrements,10)-_17.length,true,_17[0]);
_1.forEach(_18.concat(_17),function(n){
this.timeMenu.appendChild(n);
},this);
},constructor:function(){
this.constraints={};
},postMixInProperties:function(){
this.inherited(arguments);
this._setConstraintsAttr(this.constraints);
},_setConstraintsAttr:function(_19){
_1.mixin(this,_19);
if(!_19.locale){
_19.locale=this.lang;
}
},postCreate:function(){
this.connect(this.timeMenu,_1.isIE?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
this._connects.push(_2.typematic.addMouseListener(this.upArrow,this,"_onArrowUp",33,250));
this._connects.push(_2.typematic.addMouseListener(this.downArrow,this,"_onArrowDown",33,250));
this.inherited(arguments);
},_buttonMouse:function(e){
_1.toggleClass(e.currentTarget,e.currentTarget==this.upArrow?"dijitUpArrowHover":"dijitDownArrowHover",e.type=="mouseenter"||e.type=="mouseover");
},_createOption:function(_1a){
var _1b=new Date(this._refDate);
var _1c=this._clickableIncrementDate;
_1b.setHours(_1b.getHours()+_1c.getHours()*_1a,_1b.getMinutes()+_1c.getMinutes()*_1a,_1b.getSeconds()+_1c.getSeconds()*_1a);
if(this.constraints.selector=="time"){
_1b.setFullYear(1970,0,1);
}
var _1d=_1.date.locale.format(_1b,this.constraints);
if(this.filterString&&_1d.toLowerCase().indexOf(this.filterString)!==0){
return null;
}
var div=_1.create("div",{"class":this.baseClass+"Item"});
div.date=_1b;
div.index=_1a;
_1.create("div",{"class":this.baseClass+"ItemInner",innerHTML:_1d},div);
if(_1a%this._visibleIncrement<1&&_1a%this._visibleIncrement>-1){
_1.addClass(div,this.baseClass+"Marker");
}else{
if(!(_1a%this._clickableIncrement)){
_1.addClass(div,this.baseClass+"Tick");
}
}
if(this.isDisabledDate(_1b)){
_1.addClass(div,this.baseClass+"ItemDisabled");
}
if(this.value&&!_1.date.compare(this.value,_1b,this.constraints.selector)){
div.selected=true;
_1.addClass(div,this.baseClass+"ItemSelected");
if(_1.hasClass(div,this.baseClass+"Marker")){
_1.addClass(div,this.baseClass+"MarkerSelected");
}else{
_1.addClass(div,this.baseClass+"TickSelected");
}
this._highlightOption(div,true);
}
return div;
},_onOptionSelected:function(tgt){
var _1e=tgt.target.date||tgt.target.parentNode.date;
if(!_1e||this.isDisabledDate(_1e)){
return;
}
this._highlighted_option=null;
this.set("value",_1e);
this.onChange(_1e);
},onChange:function(_1f){
},_highlightOption:function(_20,_21){
if(!_20){
return;
}
if(_21){
if(this._highlighted_option){
this._highlightOption(this._highlighted_option,false);
}
this._highlighted_option=_20;
}else{
if(this._highlighted_option!==_20){
return;
}else{
this._highlighted_option=null;
}
}
_1.toggleClass(_20,this.baseClass+"ItemHover",_21);
if(_1.hasClass(_20,this.baseClass+"Marker")){
_1.toggleClass(_20,this.baseClass+"MarkerHover",_21);
}else{
_1.toggleClass(_20,this.baseClass+"TickHover",_21);
}
},onmouseover:function(e){
this._keyboardSelected=null;
var tgr=(e.target.parentNode===this.timeMenu)?e.target:e.target.parentNode;
if(!_1.hasClass(tgr,this.baseClass+"Item")){
return;
}
this._highlightOption(tgr,true);
},onmouseout:function(e){
this._keyboardSelected=null;
var tgr=(e.target.parentNode===this.timeMenu)?e.target:e.target.parentNode;
this._highlightOption(tgr,false);
},_mouseWheeled:function(e){
this._keyboardSelected=null;
_1.stopEvent(e);
var _22=(_1.isIE?e.wheelDelta:-e.detail);
this[(_22>0?"_onArrowUp":"_onArrowDown")]();
},_onArrowUp:function(_23){
if(typeof _23=="number"&&_23==-1){
return;
}
if(!this.timeMenu.childNodes.length){
return;
}
var _24=this.timeMenu.childNodes[0].index;
var _25=this._getFilteredNodes(_24,1,true,this.timeMenu.childNodes[0]);
if(_25.length){
this.timeMenu.removeChild(this.timeMenu.childNodes[this.timeMenu.childNodes.length-1]);
this.timeMenu.insertBefore(_25[0],this.timeMenu.childNodes[0]);
}
},_onArrowDown:function(_26){
if(typeof _26=="number"&&_26==-1){
return;
}
if(!this.timeMenu.childNodes.length){
return;
}
var _27=this.timeMenu.childNodes[this.timeMenu.childNodes.length-1].index+1;
var _28=this._getFilteredNodes(_27,1,false,this.timeMenu.childNodes[this.timeMenu.childNodes.length-1]);
if(_28.length){
this.timeMenu.removeChild(this.timeMenu.childNodes[0]);
this.timeMenu.appendChild(_28[0]);
}
},handleKey:function(e){
var dk=_1.keys;
if(e.charOrCode==dk.DOWN_ARROW||e.charOrCode==dk.UP_ARROW){
_1.stopEvent(e);
if(this._highlighted_option&&!this._highlighted_option.parentNode){
this._highlighted_option=null;
}
var _29=this.timeMenu,tgt=this._highlighted_option||_1.query("."+this.baseClass+"ItemSelected",_29)[0];
if(!tgt){
tgt=_29.childNodes[0];
}else{
if(_29.childNodes.length){
if(e.charOrCode==dk.DOWN_ARROW&&!tgt.nextSibling){
this._onArrowDown();
}else{
if(e.charOrCode==dk.UP_ARROW&&!tgt.previousSibling){
this._onArrowUp();
}
}
if(e.charOrCode==dk.DOWN_ARROW){
tgt=tgt.nextSibling;
}else{
tgt=tgt.previousSibling;
}
}
}
this._highlightOption(tgt,true);
this._keyboardSelected=tgt;
return false;
}else{
if(e.charOrCode==dk.ENTER||e.charOrCode===dk.TAB){
if(!this._keyboardSelected&&e.charOrCode===dk.TAB){
return true;
}
if(this._highlighted_option){
this._onOptionSelected({target:this._highlighted_option});
}
return e.charOrCode===dk.TAB;
}
}
}});
return _2._TimePicker;
});
