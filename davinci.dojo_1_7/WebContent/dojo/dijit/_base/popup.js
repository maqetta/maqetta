/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_base/popup",["dojo/_base/kernel","..","../popup","../BackgroundIframe","dojo/_base/html"],function(_1,_2,_3,_4){
var _5=_3._createWrapper;
_3._createWrapper=function(_6){
if(!_6.declaredClass){
_6={_popupWrapper:(_6.parentNode&&_1.hasClass(_6.parentNode,"dijitPopup"))?_6.parentNode:null,domNode:_6,destroy:function(){
}};
}
return _5.call(this,_6);
};
var _7=_3.open;
_3.open=function(_8){
if(_8.orient&&typeof _8.orient!="string"&&!("length" in _8.orient)){
var _9=[];
for(var _a in _8.orient){
_9.push({aroundCorner:_a,corner:_8.orient[_a]});
}
_8.orient=_9;
}
return _7.call(this,_8);
};
return _2.popup;
});
