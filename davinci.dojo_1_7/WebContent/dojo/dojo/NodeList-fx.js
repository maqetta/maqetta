/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/NodeList-fx",["./main","./fx"],function(_1){
_1.extend(_1.NodeList,{_anim:function(_2,_3,_4){
_4=_4||{};
var a=_1.fx.combine(this.map(function(_5){
var _6={node:_5};
_1.mixin(_6,_4);
return _2[_3](_6);
}));
return _4.auto?a.play()&&this:a;
},wipeIn:function(_7){
return this._anim(_1.fx,"wipeIn",_7);
},wipeOut:function(_8){
return this._anim(_1.fx,"wipeOut",_8);
},slideTo:function(_9){
return this._anim(_1.fx,"slideTo",_9);
},fadeIn:function(_a){
return this._anim(_1,"fadeIn",_a);
},fadeOut:function(_b){
return this._anim(_1,"fadeOut",_b);
},animateProperty:function(_c){
return this._anim(_1,"animateProperty",_c);
},anim:function(_d,_e,_f,_10,_11){
var _12=_1.fx.combine(this.map(function(_13){
return _1.animateProperty({node:_13,properties:_d,duration:_e||350,easing:_f});
}));
if(_10){
_1.connect(_12,"onEnd",_10);
}
return _12.play(_11||0);
}});
return _1.NodeList;
});
