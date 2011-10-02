//>>built
define("dojox/fx/ext-dojo/NodeList",["dojo/_base/kernel","dojo/_base/lang","dojox/fx","dojo/NodeList-fx"],function(_1,_2,_3,_4){
_1.experimental("dojox.fx.ext-dojo.NodeList");
_2.extend(_4,{sizeTo:function(_5){
return this._anim(_3,"sizeTo",_5);
},slideBy:function(_6){
return this._anim(_3,"slideBy",_6);
},highlight:function(_7){
return this._anim(_3,"highlight",_7);
},fadeTo:function(_8){
return this._anim(_3,"_fade",_8);
},wipeTo:function(_9){
return this._anim(_3,"wipeTo",_9);
}});
return _4;
});
