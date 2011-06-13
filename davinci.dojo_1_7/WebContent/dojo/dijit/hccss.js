/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dijit/hccss",["dojo/_base/kernel","dojo/_base/html","dojo/ready","dojo/_base/sniff","dojo/_base/url","dojo/_base/window"],function(_1){
if(_1.isIE||_1.isMoz){
_1.ready(90,function(){
var _2=_1.create("div",{id:"a11yTestNode",style:{cssText:"border: 1px solid;"+"border-color:red green;"+"position: absolute;"+"height: 5px;"+"top: -999px;"+"background-image: url(\""+(_1.config.blankGif||_1.moduleUrl("dojo","resources/blank.gif"))+"\");"}},_1.body());
var cs=_1.getComputedStyle(_2);
if(cs){
var _3=cs.backgroundImage;
var _4=(cs.borderTopColor==cs.borderRightColor)||(_3!=null&&(_3=="none"||_3=="url(invalid-url:)"));
if(_4){
_1.addClass(_1.body(),"dijit_a11y");
}
if(_1.isIE){
_2.outerHTML="";
}else{
_1.body().removeChild(_2);
}
}
});
}
});
