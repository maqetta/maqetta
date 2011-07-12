/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/fx",["./kernel","./Color","./connect","./lang","./html","./sniff"],function(_1){
var _2=_1._mixin;
_1._Line=function(_3,_4){
this.start=_3;
this.end=_4;
};
_1._Line.prototype.getValue=function(n){
return ((this.end-this.start)*n)+this.start;
};
_1.Animation=function(_5){
_2(this,_5);
if(_1.isArray(this.curve)){
this.curve=new _1._Line(this.curve[0],this.curve[1]);
}
};
_1._Animation=_1.Animation;
_1.extend(_1.Animation,{duration:350,repeat:0,rate:20,_percent:0,_startRepeatCount:0,_getStep:function(){
var _6=this._percent,_7=this.easing;
return _7?_7(_6):_6;
},_fire:function(_8,_9){
var a=_9||[];
if(this[_8]){
if(_1.config.debugAtAllCosts){
this[_8].apply(this,a);
}else{
try{
this[_8].apply(this,a);
}
catch(e){
console.error("exception in animation handler for:",_8);
console.error(e);
}
}
}
return this;
},play:function(_a,_b){
var _c=this;
if(_c._delayTimer){
_c._clearTimer();
}
if(_b){
_c._stopTimer();
_c._active=_c._paused=false;
_c._percent=0;
}else{
if(_c._active&&!_c._paused){
return _c;
}
}
_c._fire("beforeBegin",[_c.node]);
var de=_a||_c.delay,_d=_1.hitch(_c,"_play",_b);
if(de>0){
_c._delayTimer=setTimeout(_d,de);
return _c;
}
_d();
return _c;
},_play:function(_e){
var _f=this;
if(_f._delayTimer){
_f._clearTimer();
}
_f._startTime=new Date().valueOf();
if(_f._paused){
_f._startTime-=_f.duration*_f._percent;
}
_f._active=true;
_f._paused=false;
var _10=_f.curve.getValue(_f._getStep());
if(!_f._percent){
if(!_f._startRepeatCount){
_f._startRepeatCount=_f.repeat;
}
_f._fire("onBegin",[_10]);
}
_f._fire("onPlay",[_10]);
_f._cycle();
return _f;
},pause:function(){
var _11=this;
if(_11._delayTimer){
_11._clearTimer();
}
_11._stopTimer();
if(!_11._active){
return _11;
}
_11._paused=true;
_11._fire("onPause",[_11.curve.getValue(_11._getStep())]);
return _11;
},gotoPercent:function(_12,_13){
var _14=this;
_14._stopTimer();
_14._active=_14._paused=true;
_14._percent=_12;
if(_13){
_14.play();
}
return _14;
},stop:function(_15){
var _16=this;
if(_16._delayTimer){
_16._clearTimer();
}
if(!_16._timer){
return _16;
}
_16._stopTimer();
if(_15){
_16._percent=1;
}
_16._fire("onStop",[_16.curve.getValue(_16._getStep())]);
_16._active=_16._paused=false;
return _16;
},status:function(){
if(this._active){
return this._paused?"paused":"playing";
}
return "stopped";
},_cycle:function(){
var _17=this;
if(_17._active){
var _18=new Date().valueOf();
var _19=(_18-_17._startTime)/(_17.duration);
if(_19>=1){
_19=1;
}
_17._percent=_19;
if(_17.easing){
_19=_17.easing(_19);
}
_17._fire("onAnimate",[_17.curve.getValue(_19)]);
if(_17._percent<1){
_17._startTimer();
}else{
_17._active=false;
if(_17.repeat>0){
_17.repeat--;
_17.play(null,true);
}else{
if(_17.repeat==-1){
_17.play(null,true);
}else{
if(_17._startRepeatCount){
_17.repeat=_17._startRepeatCount;
_17._startRepeatCount=0;
}
}
}
_17._percent=0;
_17._fire("onEnd",[_17.node]);
!_17.repeat&&_17._stopTimer();
}
}
return _17;
},_clearTimer:function(){
clearTimeout(this._delayTimer);
delete this._delayTimer;
}});
var ctr=0,_1a=null,_1b={run:function(){
}};
_1.extend(_1.Animation,{_startTimer:function(){
if(!this._timer){
this._timer=_1.connect(_1b,"run",this,"_cycle");
ctr++;
}
if(!_1a){
_1a=setInterval(_1.hitch(_1b,"run"),this.rate);
}
},_stopTimer:function(){
if(this._timer){
_1.disconnect(this._timer);
this._timer=null;
ctr--;
}
if(ctr<=0){
clearInterval(_1a);
_1a=null;
ctr=0;
}
}});
var _1c=_1.isIE?function(_1d){
var ns=_1d.style;
if(!ns.width.length&&_1.style(_1d,"width")=="auto"){
ns.width="auto";
}
}:function(){
};
_1._fade=function(_1e){
_1e.node=_1.byId(_1e.node);
var _1f=_2({properties:{}},_1e),_20=(_1f.properties.opacity={});
_20.start=!("start" in _1f)?function(){
return +_1.style(_1f.node,"opacity")||0;
}:_1f.start;
_20.end=_1f.end;
var _21=_1.animateProperty(_1f);
_1.connect(_21,"beforeBegin",_1.partial(_1c,_1f.node));
return _21;
};
_1.fadeIn=function(_22){
return _1._fade(_2({end:1},_22));
};
_1.fadeOut=function(_23){
return _1._fade(_2({end:0},_23));
};
_1._defaultEasing=function(n){
return 0.5+((Math.sin((n+1.5)*Math.PI))/2);
};
var _24=function(_25){
this._properties=_25;
for(var p in _25){
var _26=_25[p];
if(_26.start instanceof _1.Color){
_26.tempColor=new _1.Color();
}
}
};
_24.prototype.getValue=function(r){
var ret={};
for(var p in this._properties){
var _27=this._properties[p],_28=_27.start;
if(_28 instanceof _1.Color){
ret[p]=_1.blendColors(_28,_27.end,r,_27.tempColor).toCss();
}else{
if(!_1.isArray(_28)){
ret[p]=((_27.end-_28)*r)+_28+(p!="opacity"?_27.units||"px":0);
}
}
}
return ret;
};
_1.animateProperty=function(_29){
var n=_29.node=_1.byId(_29.node);
if(!_29.easing){
_29.easing=_1._defaultEasing;
}
var _2a=new _1.Animation(_29);
_1.connect(_2a,"beforeBegin",_2a,function(){
var pm={};
for(var p in this.properties){
if(p=="width"||p=="height"){
this.node.display="block";
}
var _2b=this.properties[p];
if(_1.isFunction(_2b)){
_2b=_2b(n);
}
_2b=pm[p]=_2({},(_1.isObject(_2b)?_2b:{end:_2b}));
if(_1.isFunction(_2b.start)){
_2b.start=_2b.start(n);
}
if(_1.isFunction(_2b.end)){
_2b.end=_2b.end(n);
}
var _2c=(p.toLowerCase().indexOf("color")>=0);
function _2d(_2e,p){
var v={height:_2e.offsetHeight,width:_2e.offsetWidth}[p];
if(v!==undefined){
return v;
}
v=_1.style(_2e,p);
return (p=="opacity")?+v:(_2c?v:parseFloat(v));
};
if(!("end" in _2b)){
_2b.end=_2d(n,p);
}else{
if(!("start" in _2b)){
_2b.start=_2d(n,p);
}
}
if(_2c){
_2b.start=new _1.Color(_2b.start);
_2b.end=new _1.Color(_2b.end);
}else{
_2b.start=(p=="opacity")?+_2b.start:parseFloat(_2b.start);
}
}
this.curve=new _24(pm);
});
_1.connect(_2a,"onAnimate",_1.hitch(_1,"style",_2a.node));
return _2a;
};
_1.anim=function(_2f,_30,_31,_32,_33,_34){
return _1.animateProperty({node:_2f,duration:_31||_1.Animation.prototype.duration,properties:_30,easing:_32,onEnd:_33}).play(_34||0);
};
return {_Line:_1._Line,Animation:_1.Animation,_fade:_1._fade,fadeIn:_1.fadeIn,fadeOut:_1.fadeOut,_defaultEasing:_1._defaultEasing,animateProperty:_1.animateProperty,anim:_1.anim};
});
