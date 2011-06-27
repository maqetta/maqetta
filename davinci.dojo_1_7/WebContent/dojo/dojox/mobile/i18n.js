/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/i18n",["./common","dojo/i18n"],function(_1,_2){
dojo.getObject("mobile.i18n",true,dojox);
dojox.mobile.i18n.load=function(_3,_4,_5){
return dojox.mobile.i18n.registerBundle(dojo.i18n.getLocalization(_3,_4,_5));
};
dojox.mobile.i18n.registerBundle=function(_6){
if(!dojox.mobile.i18n.bundle){
dojox.mobile.i18n.bundle=[];
}
return dojo.mixin(dojox.mobile.i18n.bundle,_6);
};
dojo.extend(dijit._WidgetBase,{mblNoConv:false,_cv:function(s){
if(this.mblNoConv||!dojox.mobile.i18n.bundle){
return s;
}
return dojox.mobile.i18n.bundle[dojo.trim(s)]||s;
}});
return dojox.mobile.i18n;
});
