//>>built
define("dijit/_OnDijitClickMixin",["dojo/on","dojo/_base/array","dojo/keys","dojo/_base/declare","dojo/has","dojo/_base/unload","dojo/_base/window"],function(on,_1,_2,_3,_4,_5,_6){
var _7=null;
if(_4("dom-addeventlistener")){
_6.doc.addEventListener("keydown",function(_8){
_7=_8.target;
},true);
}else{
(function(){
var _9=function(_a){
_7=_a.srcElement;
};
_6.doc.attachEvent("onkeydown",_9);
_5.addOnWindowUnload(function(){
_6.doc.detachEvent("onkeydown",_9);
});
})();
}
function _b(e){
return (e.keyCode===_2.ENTER||e.keyCode===_2.SPACE)&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.metaKey;
};
var _c=function(_d,_e){
if(/input|button/i.test(_d.nodeName)){
return on(_d,"click",_e);
}else{
var _f=[on(_d,"keypress",function(e){
if(_b(e)){
_7=e.target;
e.preventDefault();
}
}),on(_d,"keyup",function(e){
if(_b(e)&&e.target==_7){
_7=null;
on.emit(e.target,"click",{cancelable:true,bubbles:true});
}
}),on(_d,"click",function(e){
_e.call(this,e);
})];
if(_4("touch")){
var _10;
_f.push(on(_d,"touchend",function(e){
var _11=e.target;
_10=setTimeout(function(){
_10=null;
on.emit(_11,"click",{cancelable:true,bubbles:true});
},0);
e.preventDefault();
}));
}
return {remove:function(){
_1.forEach(_f,function(h){
h.remove();
});
if(_10){
clearTimeout(_10);
_10=null;
}
}};
}
};
var ret=_3("dijit._OnDijitClickMixin",null,{connect:function(obj,_12,_13){
return this.inherited(arguments,[obj,_12=="ondijitclick"?_c:_12,_13]);
}});
ret.a11yclick=_c;
return ret;
});
