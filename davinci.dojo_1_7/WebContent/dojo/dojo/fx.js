/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/fx",["./main","./fx/Toggler"],function(_1){
var _2={_fire:function(_3,_4){
if(this[_3]){
this[_3].apply(this,_4||[]);
}
return this;
}};
var _5=function(_6){
this._index=-1;
this._animations=_6||[];
this._current=this._onAnimateCtx=this._onEndCtx=null;
this.duration=0;
_1.forEach(this._animations,function(a){
this.duration+=a.duration;
if(a.delay){
this.duration+=a.delay;
}
},this);
};
_1.extend(_5,{_onAnimate:function(){
this._fire("onAnimate",arguments);
},_onEnd:function(){
_1.disconnect(this._onAnimateCtx);
_1.disconnect(this._onEndCtx);
this._onAnimateCtx=this._onEndCtx=null;
if(this._index+1==this._animations.length){
this._fire("onEnd");
}else{
this._current=this._animations[++this._index];
this._onAnimateCtx=_1.connect(this._current,"onAnimate",this,"_onAnimate");
this._onEndCtx=_1.connect(this._current,"onEnd",this,"_onEnd");
this._current.play(0,true);
}
},play:function(_7,_8){
if(!this._current){
this._current=this._animations[this._index=0];
}
if(!_8&&this._current.status()=="playing"){
return this;
}
var _9=_1.connect(this._current,"beforeBegin",this,function(){
this._fire("beforeBegin");
}),_a=_1.connect(this._current,"onBegin",this,function(_b){
this._fire("onBegin",arguments);
}),_c=_1.connect(this._current,"onPlay",this,function(_d){
this._fire("onPlay",arguments);
_1.disconnect(_9);
_1.disconnect(_a);
_1.disconnect(_c);
});
if(this._onAnimateCtx){
_1.disconnect(this._onAnimateCtx);
}
this._onAnimateCtx=_1.connect(this._current,"onAnimate",this,"_onAnimate");
if(this._onEndCtx){
_1.disconnect(this._onEndCtx);
}
this._onEndCtx=_1.connect(this._current,"onEnd",this,"_onEnd");
this._current.play.apply(this._current,arguments);
return this;
},pause:function(){
if(this._current){
var e=_1.connect(this._current,"onPause",this,function(_e){
this._fire("onPause",arguments);
_1.disconnect(e);
});
this._current.pause();
}
return this;
},gotoPercent:function(_f,_10){
this.pause();
var _11=this.duration*_f;
this._current=null;
_1.some(this._animations,function(a){
if(a.duration<=_11){
this._current=a;
return true;
}
_11-=a.duration;
return false;
});
if(this._current){
this._current.gotoPercent(_11/this._current.duration,_10);
}
return this;
},stop:function(_12){
if(this._current){
if(_12){
for(;this._index+1<this._animations.length;++this._index){
this._animations[this._index].stop(true);
}
this._current=this._animations[this._index];
}
var e=_1.connect(this._current,"onStop",this,function(arg){
this._fire("onStop",arguments);
_1.disconnect(e);
});
this._current.stop();
}
return this;
},status:function(){
return this._current?this._current.status():"stopped";
},destroy:function(){
if(this._onAnimateCtx){
_1.disconnect(this._onAnimateCtx);
}
if(this._onEndCtx){
_1.disconnect(this._onEndCtx);
}
}});
_1.extend(_5,_2);
_1.fx.chain=function(_13){
return new _5(_13);
};
var _14=function(_15){
this._animations=_15||[];
this._connects=[];
this._finished=0;
this.duration=0;
_1.forEach(_15,function(a){
var _16=a.duration;
if(a.delay){
_16+=a.delay;
}
if(this.duration<_16){
this.duration=_16;
}
this._connects.push(_1.connect(a,"onEnd",this,"_onEnd"));
},this);
this._pseudoAnimation=new _1.Animation({curve:[0,1],duration:this.duration});
var _17=this;
_1.forEach(["beforeBegin","onBegin","onPlay","onAnimate","onPause","onStop","onEnd"],function(evt){
_17._connects.push(_1.connect(_17._pseudoAnimation,evt,function(){
_17._fire(evt,arguments);
}));
});
};
_1.extend(_14,{_doAction:function(_18,_19){
_1.forEach(this._animations,function(a){
a[_18].apply(a,_19);
});
return this;
},_onEnd:function(){
if(++this._finished>this._animations.length){
this._fire("onEnd");
}
},_call:function(_1a,_1b){
var t=this._pseudoAnimation;
t[_1a].apply(t,_1b);
},play:function(_1c,_1d){
this._finished=0;
this._doAction("play",arguments);
this._call("play",arguments);
return this;
},pause:function(){
this._doAction("pause",arguments);
this._call("pause",arguments);
return this;
},gotoPercent:function(_1e,_1f){
var ms=this.duration*_1e;
_1.forEach(this._animations,function(a){
a.gotoPercent(a.duration<ms?1:(ms/a.duration),_1f);
});
this._call("gotoPercent",arguments);
return this;
},stop:function(_20){
this._doAction("stop",arguments);
this._call("stop",arguments);
return this;
},status:function(){
return this._pseudoAnimation.status();
},destroy:function(){
_1.forEach(this._connects,_1.disconnect);
}});
_1.extend(_14,_2);
_1.fx.combine=function(_21){
return new _14(_21);
};
_1.fx.wipeIn=function(_22){
var _23=_22.node=_1.byId(_22.node),s=_23.style,o;
var _24=_1.animateProperty(_1.mixin({properties:{height:{start:function(){
o=s.overflow;
s.overflow="hidden";
if(s.visibility=="hidden"||s.display=="none"){
s.height="1px";
s.display="";
s.visibility="";
return 1;
}else{
var _25=_1.style(_23,"height");
return Math.max(_25,1);
}
},end:function(){
return _23.scrollHeight;
}}}},_22));
var _26=function(){
s.height="auto";
s.overflow=o;
};
_1.connect(_24,"onStop",_26);
_1.connect(_24,"onEnd",_26);
return _24;
};
_1.fx.wipeOut=function(_27){
var _28=_27.node=_1.byId(_27.node),s=_28.style,o;
var _29=_1.animateProperty(_1.mixin({properties:{height:{end:1}}},_27));
_1.connect(_29,"beforeBegin",function(){
o=s.overflow;
s.overflow="hidden";
s.display="";
});
var _2a=function(){
s.overflow=o;
s.height="auto";
s.display="none";
};
_1.connect(_29,"onStop",_2a);
_1.connect(_29,"onEnd",_2a);
return _29;
};
_1.fx.slideTo=function(_2b){
var _2c=_2b.node=_1.byId(_2b.node),top=null,_2d=null;
var _2e=(function(n){
return function(){
var cs=_1.getComputedStyle(n);
var pos=cs.position;
top=(pos=="absolute"?n.offsetTop:parseInt(cs.top)||0);
_2d=(pos=="absolute"?n.offsetLeft:parseInt(cs.left)||0);
if(pos!="absolute"&&pos!="relative"){
var ret=_1.position(n,true);
top=ret.y;
_2d=ret.x;
n.style.position="absolute";
n.style.top=top+"px";
n.style.left=_2d+"px";
}
};
})(_2c);
_2e();
var _2f=_1.animateProperty(_1.mixin({properties:{top:_2b.top||0,left:_2b.left||0}},_2b));
_1.connect(_2f,"beforeBegin",_2f,_2e);
return _2f;
};
return _1.fx;
});
