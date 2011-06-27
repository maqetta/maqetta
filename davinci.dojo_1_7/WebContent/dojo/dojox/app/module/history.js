/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/app/module/history",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/on"],function(_1,_2,_3,_4){
return _1.declare(null,{postCreate:function(_5,_6){
this.inherited(arguments);
var _7=window.location.hash;
this._startView=((_7&&_7.charAt(0)=="#")?_7.substr(1):_7)||this.defaultView;
_4(this.domNode,"startTransition",_1.hitch(this,"onStartTransition"));
_4(window,"popstate",_1.hitch(this,"onPopState"));
},startup:function(){
this.inherited(arguments);
},onStartTransition:function(_8){
if(_8.preventDefault){
_8.preventDefault();
}
_1.when(this.transition(_8.detail.target,_1.mixin({reverse:false},_8.detail)),_1.hitch(this,function(){
history.pushState(_8.detail,_8.detail.href,_8.detail.url);
}));
},onPopState:function(_9){
var _a=_9.state;
if(!_a){
if(!this._startView&&window.location.hash){
_a={target:(location.hash&&location.hash.charAt(0)=="#")?location.hash.substr(1):location.hash,url:location.hash};
}else{
_a={};
}
}
var _b=_a.target||this._startView||this.defaultView;
if(this._startView){
this._startView=null;
}
var _c=_a.title||null;
var _d=_a.url||null;
if(_9._sim){
history.replaceState(_a,_c,_d);
}
var _e=history.state;
this.transition(_b,_1.mixin({reverse:true},_a));
}});
});
