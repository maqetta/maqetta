/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_DialogMixin",["dojo/_base/kernel",".","./_Widget","dojo/_base/declare"],function(_1,_2){
_1.declare("dijit._DialogMixin",null,{execute:function(_3){
},onCancel:function(){
},onExecute:function(){
},_onSubmit:function(){
this.onExecute();
this.execute(this.get("value"));
},_getFocusItems:function(){
var _4=_2._getTabNavigable(this.containerNode);
this._firstFocusItem=_4.lowest||_4.first||this.closeButtonNode||this.domNode;
this._lastFocusItem=_4.last||_4.highest||this._firstFocusItem;
}});
return _2._DialogMixin;
});
