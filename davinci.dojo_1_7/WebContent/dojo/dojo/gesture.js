/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/gesture",["./_base/kernel","./on","./touch","./has"],function(_1,on,_2,_3){
_1.gesture={events:{},gestures:[],_gestureElements:[],register:function(_4){
if(!_3("touch")&&_4.touchOnly){
console.warn("Gestures:[",_4.defaultEvent,"] is only supported on touch devices!");
return;
}
if(_1.indexOf(this.gestures,_4)<0){
this.gestures.push(_4);
}
var _5=_4.defaultEvent;
this.events[_5]=_4;
_4.call=this.handle(_5);
_1.forEach(_4.subEvents,function(_6){
_4[_6]=this.handle(_5+"."+_6);
this.events[_5+"."+_6]=_4;
},this);
},unRegister:function(_7){
var i=_1.indexOf(this.gestures,_7);
if(i>=0){
this.gestures.splice(i,1);
}
var _8=_7.defaultEvent;
delete this.events[_8];
_1.forEach(_7.subEvents,function(_9){
delete this.events[_8+"."+_9];
},this);
},handle:function(_a){
var _b=this;
return function(_c,_d){
var a=arguments;
if(a.length>2){
_c=a[1];
_d=a[2];
}
var _e=_c&&(_c.nodeType||_c.attachEvent||_c.addEventListener);
if(!_e||!_b.isGestureEvent(_a)){
return on(_c,_a,_d);
}else{
var _f={remove:function(){
_b._remove(_c,_a,_d);
}};
_b._add(_c,_a,_d);
return _f;
}
};
},isGestureEvent:function(e){
return !!this.events[e];
},isMouseEvent:function(_10){
return (/^mousedown$|^mousemove$|^mouseup$|^click$|^contextmenu$/).test(_10);
},_add:function(_11,_12,_13){
var _14=this.getGestureElement(_11);
if(_14===null){
_14={target:_11,gestures:{},listening:false};
this._gestureElements.push(_14);
}
if(!_14.gestures[_12]){
_14.gestures[_12]={callbacks:[_13],stopped:false};
}else{
_14.gestures[_12].callbacks.push(_13);
}
if(!_14.listening){
var _15=_1.hitch(this,"_press",_14);
var _16=_1.hitch(this,"_move",_14);
var _17=_1.hitch(this,"_release",_14);
var _18=this.events[_12].touchOnly;
if(_18){
_14.press=on(_11,"touchstart",_15);
_14.move=on(_11,"touchmove",_16);
_14.release=on(_11,"touchend",_17);
}else{
_14.press=_2.press(_11,_15);
_14.move=_2.move(_11,_16);
_14.release=_2.release(_11,_17);
}
if(_3("touch")){
var _19=_1.hitch(this,"_cancel",_14);
_14.cancel=on(_11,"touchcancel",_19);
}
_14.listening=true;
}
},_remove:function(_1a,_1b,_1c){
var _1d=this.getGestureElement(_1a);
var i=_1.indexOf(_1d.gestures[_1b].callbacks,_1c);
_1d.gestures[_1b].callbacks.splice(i,1);
},getGestureElement:function(_1e){
var i;
for(i=0;i<this._gestureElements.length;i++){
var _1f=this._gestureElements[i];
if(_1f.target===_1e){
return _1f;
}
}
return null;
},_press:function(_20,e){
this._forEach(_20,"press",e);
},_move:function(_21,e){
this._forEach(_21,"move",e);
},_release:function(_22,e){
this._forEach(_22,"release",e);
},_cancel:function(_23,e){
this._forEach(_23,"cancel",e);
},_forEach:function(_24,_25,e){
e.preventDefault();
if(e.locking){
return;
}
var _26=[],x;
for(x in _24.gestures){
var _27=this.events[x];
if(_27[_25]&&_1.indexOf(_26,_27)<0){
e.locking=true;
_27[_25](_24,e);
_26.push(_27);
}
}
},fire:function(_28,_29,_2a,_2b){
var _2c=this._createEvent(_2a,_2b);
_2c.type=_29;
_2c.stopPropagation=function(){
_28.gestures[_29].stopped=true;
};
this._fire(_28,_29,_2c);
},_fire:function(_2d,_2e,e){
var _2f=_2d.gestures[_2e];
if(!_2f){
return;
}
_1.forEach(_2f.callbacks,function(_30){
_30(e);
});
if(!_2f.stopped){
var _31=_2d.target.parentNode,_32=_1.gesture.getGestureElement(_31);
if(_31&&_32){
e.target=_31;
this._fire(_32,_2e,e);
}
}
},_createEvent:function(e,_33){
var _34={target:e.target,currentTarget:e.currentTarget,srcEvent:e,preventDefault:function(){
e.preventDefault();
}};
var i;
for(i in _33){
_34[i]=_33[i];
}
return _34;
}};
return _1.gesture;
});
