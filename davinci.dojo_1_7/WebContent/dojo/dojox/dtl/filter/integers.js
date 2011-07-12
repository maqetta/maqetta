/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/filter/integers",["dojo/_base/kernel"],function(_1){
_1.getObject("dtl.filter.integers",true,dojox);
_1.mixin(dojox.dtl.filter.integers,{add:function(_2,_3){
_2=parseInt(_2,10);
_3=parseInt(_3,10);
return isNaN(_3)?_2:_2+_3;
},get_digit:function(_4,_5){
_4=parseInt(_4,10);
_5=parseInt(_5,10)-1;
if(_5>=0){
_4+="";
if(_5<_4.length){
_4=parseInt(_4.charAt(_5),10);
}else{
_4=0;
}
}
return (isNaN(_4)?0:_4);
}});
return dojox.dtl.filter.integers;
});
