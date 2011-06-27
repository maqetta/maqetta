/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/AdapterRegistry",["./main"],function(_1){
_1.AdapterRegistry=function(_2){
this.pairs=[];
this.returnWrappers=_2||false;
};
_1.extend(_1.AdapterRegistry,{register:function(_3,_4,_5,_6,_7){
this.pairs[((_7)?"unshift":"push")]([_3,_4,_5,_6]);
},match:function(){
for(var i=0;i<this.pairs.length;i++){
var _8=this.pairs[i];
if(_8[1].apply(this,arguments)){
if((_8[3])||(this.returnWrappers)){
return _8[2];
}else{
return _8[2].apply(this,arguments);
}
}
}
throw new Error("No match found");
},unregister:function(_9){
for(var i=0;i<this.pairs.length;i++){
var _a=this.pairs[i];
if(_a[0]==_9){
this.pairs.splice(i,1);
return true;
}
}
return false;
}});
return _1.AdapterRegistry;
});
