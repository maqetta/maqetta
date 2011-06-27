/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/manager/keys",["dojo","../util/common","./Stencil"],function(_1){
var _2=false;
var _3=true;
var _4="abcdefghijklmnopqrstuvwxyz";
dojox.drawing.manager.keys={arrowIncrement:1,arrowShiftIncrement:10,shift:false,ctrl:false,alt:false,cmmd:false,meta:false,onDelete:function(_5){
},onEsc:function(_6){
},onEnter:function(_7){
},onArrow:function(_8){
},onKeyDown:function(_9){
},onKeyUp:function(_a){
},listeners:[],register:function(_b){
var _c=dojox.drawing.util.common.uid("listener");
this.listeners.push({handle:_c,scope:_b.scope||window,callback:_b.callback,keyCode:_b.keyCode});
},_getLetter:function(_d){
if(!_d.meta&&_d.keyCode>=65&&_d.keyCode<=90){
return _4.charAt(_d.keyCode-65);
}
return null;
},_mixin:function(_e){
_e.meta=this.meta;
_e.shift=this.shift;
_e.alt=this.alt;
_e.cmmd=this.cmmd;
_e.letter=this._getLetter(_e);
return _e;
},editMode:function(_f){
_2=_f;
},enable:function(_10){
_3=_10;
},scanForFields:function(){
if(this._fieldCons){
_1.forEach(this._fieldCons,_1.disconnect,_1);
}
this._fieldCons=[];
_1.query("input").forEach(function(n){
var a=_1.connect(n,"focus",this,function(evt){
this.enable(false);
});
var b=_1.connect(n,"blur",this,function(evt){
this.enable(true);
});
this._fieldCons.push(a);
this._fieldCons.push(b);
},this);
},init:function(){
setTimeout(_1.hitch(this,"scanForFields"),500);
_1.connect(document,"blur",this,function(evt){
this.meta=this.shift=this.ctrl=this.cmmd=this.alt=false;
});
_1.connect(document,"keydown",this,function(evt){
if(!_3){
return;
}
if(evt.keyCode==16){
this.shift=true;
}
if(evt.keyCode==17){
this.ctrl=true;
}
if(evt.keyCode==18){
this.alt=true;
}
if(evt.keyCode==224){
this.cmmd=true;
}
this.meta=this.shift||this.ctrl||this.cmmd||this.alt;
if(!_2){
this.onKeyDown(this._mixin(evt));
if(evt.keyCode==8||evt.keyCode==46){
_1.stopEvent(evt);
}
}
});
_1.connect(document,"keyup",this,function(evt){
if(!_3){
return;
}
var _11=false;
if(evt.keyCode==16){
this.shift=false;
}
if(evt.keyCode==17){
this.ctrl=false;
}
if(evt.keyCode==18){
this.alt=false;
}
if(evt.keyCode==224){
this.cmmd=false;
}
this.meta=this.shift||this.ctrl||this.cmmd||this.alt;
!_2&&this.onKeyUp(this._mixin(evt));
if(evt.keyCode==13){
console.warn("KEY ENTER");
this.onEnter(evt);
_11=true;
}
if(evt.keyCode==27){
this.onEsc(evt);
_11=true;
}
if(evt.keyCode==8||evt.keyCode==46){
this.onDelete(evt);
_11=true;
}
if(_11&&!_2){
_1.stopEvent(evt);
}
});
_1.connect(document,"keypress",this,function(evt){
if(!_3){
return;
}
var inc=this.shift?this.arrowIncrement*this.arrowShiftIncrement:this.arrowIncrement;
var x=0,y=0;
if(evt.keyCode==32&&!_2){
_1.stopEvent(evt);
}
if(evt.keyCode==37){
x=-inc;
}
if(evt.keyCode==38){
y=-inc;
}
if(evt.keyCode==39){
x=inc;
}
if(evt.keyCode==40){
y=inc;
}
if(x||y){
evt.x=x;
evt.y=y;
evt.shift=this.shift;
if(!_2){
this.onArrow(evt);
_1.stopEvent(evt);
}
}
});
}};
_1.addOnLoad(dojox.drawing.manager.keys,"init");
return dojox.drawing.manager.keys;
});
