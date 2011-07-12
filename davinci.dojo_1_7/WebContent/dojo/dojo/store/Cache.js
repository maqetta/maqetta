/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/store/Cache",["../main"],function(_1){
_1.getObject("store",true,_1);
_1.store.Cache=function(_2,_3,_4){
_4=_4||{};
return _1.delegate(_2,{query:function(_5,_6){
var _7=_2.query(_5,_6);
_7.forEach(function(_8){
if(!_4.isLoaded||_4.isLoaded(_8)){
_3.put(_8);
}
});
return _7;
},queryEngine:_2.queryEngine||_3.queryEngine,get:function(id,_9){
return _1.when(_3.get(id),function(_a){
return _a||_1.when(_2.get(id,_9),function(_b){
if(_b){
_3.put(_b,{id:id});
}
return _b;
});
});
},add:function(_c,_d){
return _1.when(_2.add(_c,_d),function(_e){
return _3.add(typeof _e=="object"?_e:_c,_d);
});
},put:function(_f,_10){
_3.remove((_10&&_10.id)||this.getIdentity(_f));
return _1.when(_2.put(_f,_10),function(_11){
return _3.put(typeof _11=="object"?_11:_f,_10);
});
},remove:function(id,_12){
return _1.when(_2.remove(id,_12),function(_13){
return _3.remove(id,_12);
});
},evict:function(id){
return _3.remove(id);
}});
};
return _1.store.Cache;
});
