/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_KeyNavContainer",["dojo/_base/kernel",".","./_Container","./_FocusMixin","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/lang"],function(_1,_2){
_1.declare("dijit._KeyNavContainer",[_2._Container,_2._FocusMixin],{tabIndex:"0",connectKeyNavHandlers:function(_3,_4){
var _5=(this._keyNavCodes={});
var _6=_1.hitch(this,"focusPrev");
var _7=_1.hitch(this,"focusNext");
_1.forEach(_3,function(_8){
_5[_8]=_6;
});
_1.forEach(_4,function(_9){
_5[_9]=_7;
});
_5[_1.keys.HOME]=_1.hitch(this,"focusFirstChild");
_5[_1.keys.END]=_1.hitch(this,"focusLastChild");
this.connect(this.domNode,"onkeypress","_onContainerKeypress");
this.connect(this.domNode,"onfocus","_onContainerFocus");
},startupKeyNavChildren:function(){
_1.deprecated("startupKeyNavChildren() call no longer needed","","2.0");
},startup:function(){
this.inherited(arguments);
_1.forEach(this.getChildren(),_1.hitch(this,"_startupChild"));
},addChild:function(_a,_b){
this.inherited(arguments);
this._startupChild(_a);
},focus:function(){
this.focusFirstChild();
},focusFirstChild:function(){
this.focusChild(this._getFirstFocusableChild());
},focusLastChild:function(){
this.focusChild(this._getLastFocusableChild());
},focusNext:function(){
this.focusChild(this._getNextFocusableChild(this.focusedChild,1));
},focusPrev:function(){
this.focusChild(this._getNextFocusableChild(this.focusedChild,-1),true);
},focusChild:function(_c,_d){
if(!_c){
return;
}
if(this.focusedChild&&_c!==this.focusedChild){
this._onChildBlur(this.focusedChild);
}
_c.set("tabIndex",this.tabIndex);
_c.focus(_d?"end":"start");
this._set("focusedChild",_c);
},_startupChild:function(_e){
_e.set("tabIndex","-1");
this.connect(_e,"_onFocus",function(){
_e.set("tabIndex",this.tabIndex);
});
this.connect(_e,"_onBlur",function(){
_e.set("tabIndex","-1");
});
},_onContainerFocus:function(_f){
if(_f.target!==this.domNode||this.focusedChild){
return;
}
this.focusFirstChild();
_1.attr(this.domNode,"tabIndex","-1");
},_onBlur:function(evt){
if(this.tabIndex){
_1.attr(this.domNode,"tabIndex",this.tabIndex);
}
this.focusedChild=null;
this.inherited(arguments);
},_onContainerKeypress:function(evt){
if(evt.ctrlKey||evt.altKey){
return;
}
var _10=this._keyNavCodes[evt.charOrCode];
if(_10){
_10();
_1.stopEvent(evt);
}
},_onChildBlur:function(_11){
},_getFirstFocusableChild:function(){
return this._getNextFocusableChild(null,1);
},_getLastFocusableChild:function(){
return this._getNextFocusableChild(null,-1);
},_getNextFocusableChild:function(_12,dir){
if(_12){
_12=this._getSiblingOfChild(_12,dir);
}
var _13=this.getChildren();
for(var i=0;i<_13.length;i++){
if(!_12){
_12=_13[(dir>0)?0:(_13.length-1)];
}
if(_12.isFocusable()){
return _12;
}
_12=this._getSiblingOfChild(_12,dir);
}
return null;
}});
return _2._KeyNavContainer;
});
