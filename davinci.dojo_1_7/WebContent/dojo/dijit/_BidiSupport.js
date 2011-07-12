/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_BidiSupport",["dojo/_base/kernel","./_WidgetBase","dojo/_base/lang"],function(_1,_2){
_1.extend(_2,{getTextDir:function(_3){
return this.textDir=="auto"?this._checkContextual(_3):this.textDir;
},_checkContextual:function(_4){
var _5=/[A-Za-z\u05d0-\u065f\u066a-\u06ef\u06fa-\u07ff\ufb1d-\ufdff\ufe70-\ufefc]/.exec(_4);
return _5?(_5[0]<="z"?"ltr":"rtl"):this.dir?this.dir:this.isLeftToRight()?"ltr":"rtl";
},applyTextDir:function(_6,_7){
var _8=this.textDir=="auto"?this._checkContextual(_7):this.textDir;
if(_6.dir!=_8){
_6.dir=_8;
}
}});
return _2;
});
