/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/contrib/objects",["dojo/_base/kernel"],function(_1){
_1.getObject("dtl.contrib.objects",true,dojox);
_1.mixin(dojox.dtl.contrib.objects,{key:function(_2,_3){
return _2[_3];
}});
dojox.dtl.register.filters("dojox.dtl.contrib",{"objects":["key"]});
return dojox.dtl.contrib.objects;
});
