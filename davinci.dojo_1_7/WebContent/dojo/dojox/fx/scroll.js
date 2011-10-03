//>>built
define("dojox/fx/scroll",["dojo/_base/kernel","dojo/_base/lang","dojox/fx/_base","dojox/fx/_core","dojo/dom-geometry","dojo/_base/sniff"],function(_1,_2,_3,_4,_5,_6){
_1.experimental("dojox.fx.scroll");
var fx=_2.getObject("dojox.fx",true);
_3.smoothScroll=function(_7){
if(!_7.target){
_7.target=_5.position(_7.node);
}
var _8=_2[(_6("ie")?"isObject":"isFunction")](_7["win"].scrollTo),_9={x:_7.target.x,y:_7.target.y};
if(!_8){
var _a=_5.position(_7.win);
_9.x-=_a.x;
_9.y-=_a.y;
}
var _b=(_8)?(function(_c){
_7.win.scrollTo(_c[0],_c[1]);
}):(function(_d){
_7.win.scrollLeft=_d[0];
_7.win.scrollTop=_d[1];
});
var _e=new _3.Animation(_2.mixin({beforeBegin:function(){
if(this.curve){
delete this.curve;
}
var _f=_8?dojo._docScroll():{x:_7.win.scrollLeft,y:_7.win.scrollTop};
_e.curve=new _4([_f.x,_f.y],[_f.x+_9.x,_f.y+_9.y]);
},onAnimate:_b},_7));
return _e;
};
fx.smoothScroll=_3.smoothScroll;
return _3.smoothScroll;
});
