/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/widget/SelectableLegend",["dojo/_base/kernel","dojo/_base/array","dojo/_base/declare","dojo/query","dojo/_base/html","dojo/_base/connect","dojo/_base/Color","./Legend","dijit/form/CheckBox","../action2d/Highlight","dojox/lang/functional","dojox/gfx/fx"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,df,fx){
var _b=_1.declare(null,{constructor:function(_c){
this.legend=_c;
this.index=0;
this.horizontalLength=this._getHrizontalLength();
_1.forEach(_c.legends,function(_d,i){
if(i>0){
_1.query("input",_d).attr("tabindex",-1);
}
});
this.firstLabel=_1.query("input",_c.legends[0])[0];
_1.connect(this.firstLabel,"focus",this,function(){
this.legend.active=true;
});
_1.connect(this.legend.domNode,"keydown",this,"_onKeyEvent");
},_getHrizontalLength:function(){
var _e=this.legend.horizontal;
if(typeof _e=="number"){
return Math.min(_e,this.legend.legends.length);
}else{
if(!_e){
return 1;
}else{
return this.legend.legends.length;
}
}
},_onKeyEvent:function(e){
if(!this.legend.active){
return;
}
if(e.keyCode==_1.keys.TAB){
this.legend.active=false;
return;
}
var _f=this.legend.legends.length;
switch(e.keyCode){
case _1.keys.LEFT_ARROW:
this.index--;
if(this.index<0){
this.index+=_f;
}
break;
case _1.keys.RIGHT_ARROW:
this.index++;
if(this.index>=_f){
this.index-=_f;
}
break;
case _1.keys.UP_ARROW:
if(this.index-this.horizontalLength>=0){
this.index-=this.horizontalLength;
}
break;
case _1.keys.DOWN_ARROW:
if(this.index+this.horizontalLength<_f){
this.index+=this.horizontalLength;
}
break;
default:
return;
}
this._moveToFocus();
_1.stopEvent(e);
},_moveToFocus:function(){
_1.query("input",this.legend.legends[this.index])[0].focus();
}});
_1.declare("dojox.charting.widget.SelectableLegend",dojox.charting.widget.Legend,{outline:false,transitionFill:null,transitionStroke:null,postCreate:function(){
this.legends=[];
this.legendAnim={};
this.inherited(arguments);
},refresh:function(){
this.legends=[];
this.inherited(arguments);
this._applyEvents();
new _b(this);
},_addLabel:function(dyn,_10){
this.inherited(arguments);
var _11=_1.query("td",this.legendBody);
var _12=_11[_11.length-1];
this.legends.push(_12);
var _13=new _9({checked:true});
_1.place(_13.domNode,_12,"first");
var _10=_1.query("label",_12)[0];
_1.attr(_10,"for",_13.id);
},_applyEvents:function(){
if(this.chart.dirty){
return;
}
_1.forEach(this.legends,function(_14,i){
var _15,_16=[],_17,_18;
if(this._isPie()){
_15=this.chart.stack[0];
_16.push(_15.group.children[i]);
_17=_15.name;
_18=this.chart.series[0].name;
}else{
_15=this.chart.series[i];
_16=_15.group.children;
_17=_15.plot;
_18=_15.name;
}
var _19={fills:df.map(_16,"x.getFill()"),strokes:df.map(_16,"x.getStroke()")};
var _1a=_1.query(".dijitCheckBox",_14)[0];
_1.connect(_1a,"onclick",this,function(e){
this._toggle(_16,i,_14.vanished,_19,_18,_17);
_14.vanished=!_14.vanished;
e.stopPropagation();
});
var _1b=_1.query(".dojoxLegendIcon",_14)[0],_1c=this._getFilledShape(this._surfaces[i].children);
_1.forEach(["onmouseenter","onmouseleave"],function(_1d){
_1.connect(_1b,_1d,this,function(e){
this._highlight(e,_1c,_16,i,_14.vanished,_19,_18,_17);
});
},this);
},this);
},_toggle:function(_1e,_1f,_20,dyn,_21,_22){
_1.forEach(_1e,function(_23,i){
var _24=dyn.fills[i],_25=this._getTransitionFill(_22),_26=dyn.strokes[i],_27=this.transitionStroke;
if(_24){
if(_25&&(typeof _24=="string"||_24 instanceof _1.Color)){
fx.animateFill({shape:_23,color:{start:_20?_25:_24,end:_20?_24:_25}}).play();
}else{
_23.setFill(_20?_24:_25);
}
}
if(_26&&!this.outline){
_23.setStroke(_20?_26:_27);
}
},this);
},_highlight:function(e,_28,_29,_2a,_2b,dyn,_2c,_2d){
if(!_2b){
var _2e=this._getAnim(_2d),_2f=this._isPie(),_30=_31(e.type);
var _32={shape:_28,index:_2f?"legend"+_2a:"legend",run:{name:_2c},type:_30};
_2e.process(_32);
_1.forEach(_29,function(_33,i){
_33.setFill(dyn.fills[i]);
var o={shape:_33,index:_2f?_2a:i,run:{name:_2c},type:_30};
_2e.duration=100;
_2e.process(o);
});
}
},_getAnim:function(_34){
if(!this.legendAnim[_34]){
this.legendAnim[_34]=new _a(this.chart,_34);
}
return this.legendAnim[_34];
},_getTransitionFill:function(_35){
if(this.chart.stack[this.chart.plots[_35]].declaredClass.indexOf("dojox.charting.plot2d.Stacked")!=-1){
return this.chart.theme.plotarea.fill;
}
return null;
},_getFilledShape:function(_36){
var i=0;
while(_36[i]){
if(_36[i].getFill()){
return _36[i];
}
i++;
}
},_isPie:function(){
return this.chart.stack[0].declaredClass=="dojox.charting.plot2d.Pie";
}});
function _31(_37){
if(_37=="mouseenter"){
return "onmouseover";
}
if(_37=="mouseleave"){
return "onmouseout";
}
return "on"+_37;
};
return dojox.charting.widget.SelectableLegend;
});
