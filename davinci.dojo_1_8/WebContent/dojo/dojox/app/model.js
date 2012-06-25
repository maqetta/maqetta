//>>built
define("dojox/app/model",["dojo/_base/lang","dojo/Deferred","dojo/when","dojo/_base/config"],function(_1,_2,_3,_4){
return function(_5,_6,_7){
this.app=_7||_6;
this.defCount=0;
var _8={};
var _9=new _2();
if(_6.loadedModels){
_1.mixin(_8,_6.loadedModels);
}
if(_5){
var _a=_8;
for(var _b in _5){
if(_b.charAt(0)!=="_"){
this.defCount++;
}
}
if(this.defCount==0){
return _8;
}
for(var _c in _5){
if(_c.charAt(0)!=="_"){
_d(_5,_c,_6,_9,_8);
}
}
return _9;
}else{
return _8;
}
return _9;
};
function _d(_e,_f,_10,_11,_12){
var _13=_e[_f].params?_e[_f].params:{};
var def=new _2();
var _14=_e[_f].modelLoader?_e[_f].modelLoader:"dojox/app/utils/simpleModel";
require([_14],function(_15){
def.resolve(_15);
});
var _16=new _2();
return _3(def,_1.hitch(this,function(_17){
var _18;
try{
_18=_17(_e,_13,_f);
}
catch(ex){
console.warn("load model error in model.",ex);
_16.reject("load model error in model.",ex);
return _16.promise;
}
if(_18.then){
_3(_18,_1.hitch(this,function(_19){
_12[_f]=_19;
this.app.log("in app/model, for item=[",_f,"] loadedModels =",_12);
this.defCount--;
if(this.defCount==0){
_11.resolve(_12);
}
_16.resolve(_12);
return _12;
}),function(){
_16.reject("load model error in models.");
});
return _16;
}else{
_12[_f]=_18;
this.app.log("in app/model else path, for item=[",_f,"] loadedModels=",_12);
this.defCount--;
if(this.defCount==0){
_11.resolve(_12);
}
_16.resolve(_12);
return _12;
}
}));
return _16;
};
});
