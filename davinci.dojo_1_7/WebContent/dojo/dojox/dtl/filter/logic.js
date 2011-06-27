/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/filter/logic",["dojo/_base/kernel"],function(_1){
_1.getObject("dtl.filter.logic",true,dojox);
_1.mixin(dojox.dtl.filter.logic,{default_:function(_2,_3){
return _2||_3||"";
},default_if_none:function(_4,_5){
return (_4===null)?_5||"":_4||"";
},divisibleby:function(_6,_7){
return (parseInt(_6,10)%parseInt(_7,10))===0;
},_yesno:/\s*,\s*/g,yesno:function(_8,_9){
if(!_9){
_9="yes,no,maybe";
}
var _a=_9.split(dojox.dtl.filter.logic._yesno);
if(_a.length<2){
return _8;
}
if(_8){
return _a[0];
}
if((!_8&&_8!==null)||_a.length<3){
return _a[1];
}
return _a[2];
}});
return dojox.dtl.filter.logic;
});
