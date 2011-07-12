/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/hccss",["require","dojo/_base/kernel","dojo/_base/html","dojo/ready","dojo/_base/sniff","dojo/_base/window"],function(_1,_2){
if(_2.isIE||_2.isMoz){
_2.ready(90,function(){
var _3=_2.create("div",{id:"a11yTestNode",style:{cssText:"border: 1px solid;"+"border-color:red green;"+"position: absolute;"+"height: 5px;"+"top: -999px;"+"background-image: url(\""+(_2.config.blankGif||_1.toUrl("dojo/resources/blank.gif"))+"\");"}},_2.body());
var cs=_2.getComputedStyle(_3);
if(cs){
var _4=cs.backgroundImage;
var _5=(cs.borderTopColor==cs.borderRightColor)||(_4!=null&&(_4=="none"||_4=="url(invalid-url:)"));
if(_5){
_2.addClass(_2.body(),"dijit_a11y");
}
if(_2.isIE){
_3.outerHTML="";
}else{
_2.body().removeChild(_3);
}
}
});
}
});
