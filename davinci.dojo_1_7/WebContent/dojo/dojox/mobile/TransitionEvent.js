/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/TransitionEvent",["dojo/_base/kernel","dojo/_base/declare","dojo/on","./transition"],function(_1,_2,on,_3){
return _1.declare("dojox.mobile.TransitionEvent",null,{constructor:function(_4,_5,_6){
this.transitionOptions=_5;
this.target=_4;
this.triggerEvent=_6||null;
},dispatch:function(){
var _7={bubbles:true,cancelable:true,detail:this.transitionOptions,triggerEvent:this.triggerEvent};
var _8=on.emit(this.target,"startTransition",_7);
if(_8){
_1.when(_3.call(this,_8),_1.hitch(this,function(_9){
this.endTransition(_9);
}));
}
},endTransition:function(_a){
on.emit(this.target,"endTransition",{detail:_a.transitionOptions});
}});
});
