/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/TreeNode.html"]="<div class=\"dijitTreeNode\" role=\"presentation\"\n\t><div dojoAttachPoint=\"rowNode\" class=\"dijitTreeRow\" role=\"presentation\" dojoAttachEvent=\"onmouseenter:_onMouseEnter, onmouseleave:_onMouseLeave, onclick:_onClick, ondblclick:_onDblClick\"\n\t\t><img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"expandoNode\" class=\"dijitTreeExpando\" role=\"presentation\"\n\t\t/><span dojoAttachPoint=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"\n\t\t></span\n\t\t><span dojoAttachPoint=\"contentNode\"\n\t\t\tclass=\"dijitTreeContent\" role=\"presentation\">\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint=\"iconNode\" class=\"dijitIcon dijitTreeIcon\" role=\"presentation\"\n\t\t\t/><span dojoAttachPoint=\"labelNode\" class=\"dijitTreeLabel\" role=\"treeitem\" tabindex=\"-1\" aria-selected=\"false\" dojoAttachEvent=\"onfocus:_onLabelFocus\"></span>\n\t\t</span\n\t></div>\n\t<div dojoAttachPoint=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\" style=\"display: none;\"></div>\n</div>\n";
require.cache["dijit/templates/Tree.html"]="<div class=\"dijitTree dijitTreeContainer\" role=\"tree\"\n\tdojoAttachEvent=\"onkeypress:_onKeyPress\">\n\t<div class=\"dijitInline dijitTreeIndent\" style=\"position: absolute; top: -9999px\" dojoAttachPoint=\"indentDetector\"></div>\n</div>\n";
define("dijit/Tree",["dojo/_base/kernel",".","dojo/text!./templates/TreeNode.html","dojo/text!./templates/Tree.html","dojo/fx","dojo/DeferredList","./_Widget","./_TemplatedMixin","./_Container","./_Contained","./_CssStateMixin","./focus","dojo/cookie","./tree/TreeStoreModel","./tree/ForestStoreModel","./tree/_dndSelector","dojo/_base/Deferred","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/lang"],function(_1,_2,_3,_4){
_1.declare("dijit._TreeNode",[_2._Widget,_2._TemplatedMixin,_2._Container,_2._Contained,_2._CssStateMixin],{item:null,isTreeNode:true,label:"",_setLabelAttr:{node:"labelNode",type:"innerText"},isExpandable:null,isExpanded:false,state:"UNCHECKED",templateString:_3,baseClass:"dijitTreeNode",cssStateNodes:{rowNode:"dijitTreeRow",labelNode:"dijitTreeLabel"},_setTooltipAttr:{node:"rowNode",type:"attribute",attribute:"title"},buildRendering:function(){
this.inherited(arguments);
this._setExpando();
this._updateItemClasses(this.item);
if(this.isExpandable){
this.labelNode.setAttribute("aria-expanded",this.isExpanded);
}
this.setSelected(false);
},_setIndentAttr:function(_5){
var _6=(Math.max(_5,0)*this.tree._nodePixelIndent)+"px";
_1.style(this.domNode,"backgroundPosition",_6+" 0px");
_1.style(this.rowNode,this.isLeftToRight()?"paddingLeft":"paddingRight",_6);
_1.forEach(this.getChildren(),function(_7){
_7.set("indent",_5+1);
});
this._set("indent",_5);
},markProcessing:function(){
this.state="LOADING";
this._setExpando(true);
},unmarkProcessing:function(){
this._setExpando(false);
},_updateItemClasses:function(_8){
var _9=this.tree,_a=_9.model;
if(_9._v10Compat&&_8===_a.root){
_8=null;
}
this._applyClassAndStyle(_8,"icon","Icon");
this._applyClassAndStyle(_8,"label","Label");
this._applyClassAndStyle(_8,"row","Row");
},_applyClassAndStyle:function(_b,_c,_d){
var _e="_"+_c+"Class";
var _f=_c+"Node";
var _10=this[_e];
this[_e]=this.tree["get"+_d+"Class"](_b,this.isExpanded);
_1.replaceClass(this[_f],this[_e]||"",_10||"");
_1.style(this[_f],this.tree["get"+_d+"Style"](_b,this.isExpanded)||{});
},_updateLayout:function(){
var _11=this.getParent();
if(!_11||_11.rowNode.style.display=="none"){
_1.addClass(this.domNode,"dijitTreeIsRoot");
}else{
_1.toggleClass(this.domNode,"dijitTreeIsLast",!this.getNextSibling());
}
},_setExpando:function(_12){
var _13=["dijitTreeExpandoLoading","dijitTreeExpandoOpened","dijitTreeExpandoClosed","dijitTreeExpandoLeaf"],_14=["*","-","+","*"],idx=_12?0:(this.isExpandable?(this.isExpanded?1:2):3);
_1.replaceClass(this.expandoNode,_13[idx],_13);
this.expandoNodeText.innerHTML=_14[idx];
},expand:function(){
if(this._expandDeferred){
return this._expandDeferred;
}
this._wipeOut&&this._wipeOut.stop();
this.isExpanded=true;
this.labelNode.setAttribute("aria-expanded","true");
if(this.tree.showRoot||this!==this.tree.rootNode){
this.containerNode.setAttribute("role","group");
}
_1.addClass(this.contentNode,"dijitTreeContentExpanded");
this._setExpando();
this._updateItemClasses(this.item);
if(this==this.tree.rootNode){
this.tree.domNode.setAttribute("aria-expanded","true");
}
var def,_15=_1.fx.wipeIn({node:this.containerNode,duration:_2.defaultDuration,onEnd:function(){
def.callback(true);
}});
def=(this._expandDeferred=new _1.Deferred(function(){
_15.stop();
}));
_15.play();
return def;
},collapse:function(){
if(!this.isExpanded){
return;
}
if(this._expandDeferred){
this._expandDeferred.cancel();
delete this._expandDeferred;
}
this.isExpanded=false;
this.labelNode.setAttribute("aria-expanded","false");
if(this==this.tree.rootNode){
this.tree.domNode.setAttribute("aria-expanded","false");
}
_1.removeClass(this.contentNode,"dijitTreeContentExpanded");
this._setExpando();
this._updateItemClasses(this.item);
if(!this._wipeOut){
this._wipeOut=_1.fx.wipeOut({node:this.containerNode,duration:_2.defaultDuration});
}
this._wipeOut.play();
},indent:0,setChildItems:function(_16){
var _17=this.tree,_18=_17.model,_19=[];
_1.forEach(this.getChildren(),function(_1a){
_2._Container.prototype.removeChild.call(this,_1a);
},this);
this.state="LOADED";
if(_16&&_16.length>0){
this.isExpandable=true;
_1.forEach(_16,function(_1b){
var id=_18.getIdentity(_1b),_1c=_17._itemNodesMap[id],_1d;
if(_1c){
for(var i=0;i<_1c.length;i++){
if(_1c[i]&&!_1c[i].getParent()){
_1d=_1c[i];
_1d.set("indent",this.indent+1);
break;
}
}
}
if(!_1d){
_1d=this.tree._createTreeNode({item:_1b,tree:_17,isExpandable:_18.mayHaveChildren(_1b),label:_17.getLabel(_1b),tooltip:_17.getTooltip(_1b),dir:_17.dir,lang:_17.lang,indent:this.indent+1});
if(_1c){
_1c.push(_1d);
}else{
_17._itemNodesMap[id]=[_1d];
}
}
this.addChild(_1d);
if(this.tree.autoExpand||this.tree._state(_1d)){
_19.push(_17._expandNode(_1d));
}
},this);
_1.forEach(this.getChildren(),function(_1e,idx){
_1e._updateLayout();
});
}else{
this.isExpandable=false;
}
if(this._setExpando){
this._setExpando(false);
}
this._updateItemClasses(this.item);
if(this==_17.rootNode){
var fc=this.tree.showRoot?this:this.getChildren()[0];
if(fc){
fc.setFocusable(true);
_17.lastFocused=fc;
}else{
_17.domNode.setAttribute("tabIndex","0");
}
}
return new _1.DeferredList(_19);
},getTreePath:function(){
var _1f=this;
var _20=[];
while(_1f&&_1f!==this.tree.rootNode){
_20.unshift(_1f.item);
_1f=_1f.getParent();
}
_20.unshift(this.tree.rootNode.item);
return _20;
},getIdentity:function(){
return this.tree.model.getIdentity(this.item);
},removeChild:function(_21){
this.inherited(arguments);
var _22=this.getChildren();
if(_22.length==0){
this.isExpandable=false;
this.collapse();
}
_1.forEach(_22,function(_23){
_23._updateLayout();
});
},makeExpandable:function(){
this.isExpandable=true;
this._setExpando(false);
},_onLabelFocus:function(evt){
this.tree._onNodeFocus(this);
},setSelected:function(_24){
this.labelNode.setAttribute("aria-selected",_24);
_1.toggleClass(this.rowNode,"dijitTreeRowSelected",_24);
},setFocusable:function(_25){
this.labelNode.setAttribute("tabIndex",_25?"0":"-1");
},_onClick:function(evt){
this.tree._onClick(this,evt);
},_onDblClick:function(evt){
this.tree._onDblClick(this,evt);
},_onMouseEnter:function(evt){
this.tree._onNodeMouseEnter(this,evt);
},_onMouseLeave:function(evt){
this.tree._onNodeMouseLeave(this,evt);
}});
_1.declare("dijit.Tree",[_2._Widget,_2._TemplatedMixin],{store:null,model:null,query:null,label:"",showRoot:true,childrenAttr:["children"],paths:[],path:[],selectedItems:null,selectedItem:null,openOnClick:false,openOnDblClick:false,templateString:_4,persist:true,autoExpand:false,dndController:"dijit.tree._dndSelector",dndParams:["onDndDrop","itemCreator","onDndCancel","checkAcceptance","checkItemAcceptance","dragThreshold","betweenThreshold"],onDndDrop:null,itemCreator:null,onDndCancel:null,checkAcceptance:null,checkItemAcceptance:null,dragThreshold:5,betweenThreshold:0,_nodePixelIndent:19,_publish:function(_26,_27){
_1.publish(this.id,[_1.mixin({tree:this,event:_26},_27||{})]);
},postMixInProperties:function(){
this.tree=this;
if(this.autoExpand){
this.persist=false;
}
this._itemNodesMap={};
if(!this.cookieName&&this.id){
this.cookieName=this.id+"SaveStateCookie";
}
this._loadDeferred=new _1.Deferred();
this.inherited(arguments);
},postCreate:function(){
this._initState();
if(!this.model){
this._store2model();
}
this.connect(this.model,"onChange","_onItemChange");
this.connect(this.model,"onChildrenChange","_onItemChildrenChange");
this.connect(this.model,"onDelete","_onItemDelete");
this._load();
this.inherited(arguments);
if(this.dndController){
if(_1.isString(this.dndController)){
this.dndController=_1.getObject(this.dndController);
}
var _28={};
for(var i=0;i<this.dndParams.length;i++){
if(this[this.dndParams[i]]){
_28[this.dndParams[i]]=this[this.dndParams[i]];
}
}
this.dndController=new this.dndController(this,_28);
}
},_store2model:function(){
this._v10Compat=true;
_1.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");
var _29={id:this.id+"_ForestStoreModel",store:this.store,query:this.query,childrenAttrs:this.childrenAttr};
if(this.params.mayHaveChildren){
_29.mayHaveChildren=_1.hitch(this,"mayHaveChildren");
}
if(this.params.getItemChildren){
_29.getChildren=_1.hitch(this,function(_2a,_2b,_2c){
this.getItemChildren((this._v10Compat&&_2a===this.model.root)?null:_2a,_2b,_2c);
});
}
this.model=new _2.tree.ForestStoreModel(_29);
this.showRoot=Boolean(this.label);
},onLoad:function(){
},_load:function(){
this.model.getRoot(_1.hitch(this,function(_2d){
var rn=(this.rootNode=this.tree._createTreeNode({item:_2d,tree:this,isExpandable:true,label:this.label||this.getLabel(_2d),indent:this.showRoot?0:-1}));
if(!this.showRoot){
rn.rowNode.style.display="none";
this.domNode.setAttribute("role","presentation");
rn.labelNode.setAttribute("role","presentation");
rn.containerNode.setAttribute("role","tree");
}
this.domNode.appendChild(rn.domNode);
var _2e=this.model.getIdentity(_2d);
if(this._itemNodesMap[_2e]){
this._itemNodesMap[_2e].push(rn);
}else{
this._itemNodesMap[_2e]=[rn];
}
rn._updateLayout();
this._expandNode(rn).addCallback(_1.hitch(this,function(){
this._loadDeferred.callback(true);
this.onLoad();
}));
}),function(err){
console.error(this,": error loading root: ",err);
});
},getNodesByItem:function(_2f){
if(!_2f){
return [];
}
var _30=_1.isString(_2f)?_2f:this.model.getIdentity(_2f);
return [].concat(this._itemNodesMap[_30]);
},_setSelectedItemAttr:function(_31){
this.set("selectedItems",[_31]);
},_setSelectedItemsAttr:function(_32){
var _33=this;
this._loadDeferred.addCallback(_1.hitch(this,function(){
var _34=_1.map(_32,function(_35){
return (!_35||_1.isString(_35))?_35:_33.model.getIdentity(_35);
});
var _36=[];
_1.forEach(_34,function(id){
_36=_36.concat(_33._itemNodesMap[id]||[]);
});
this.set("selectedNodes",_36);
}));
},_setPathAttr:function(_37){
if(_37.length){
return this.set("paths",[_37]);
}else{
return this.set("paths",[]);
}
},_setPathsAttr:function(_38){
var _39=this;
return new _1.DeferredList(_1.map(_38,function(_3a){
var d=new _1.Deferred();
_3a=_1.map(_3a,function(_3b){
return _1.isString(_3b)?_3b:_39.model.getIdentity(_3b);
});
if(_3a.length){
_39._loadDeferred.addCallback(function(){
_3c(_3a,[_39.rootNode],d);
});
}else{
d.errback("Empty path");
}
return d;
})).addCallback(_3d);
function _3c(_3e,_3f,def){
var _40=_3e.shift();
var _41=_1.filter(_3f,function(_42){
return _42.getIdentity()==_40;
})[0];
if(!!_41){
if(_3e.length){
_39._expandNode(_41).addCallback(function(){
_3c(_3e,_41.getChildren(),def);
});
}else{
def.callback(_41);
}
}else{
def.errback("Could not expand path at "+_40);
}
};
function _3d(_43){
_39.set("selectedNodes",_1.map(_1.filter(_43,function(x){
return x[0];
}),function(x){
return x[1];
}));
};
},_setSelectedNodeAttr:function(_44){
this.set("selectedNodes",[_44]);
},_setSelectedNodesAttr:function(_45){
this._loadDeferred.addCallback(_1.hitch(this,function(){
this.dndController.setSelection(_45);
}));
},mayHaveChildren:function(_46){
},getItemChildren:function(_47,_48){
},getLabel:function(_49){
return this.model.getLabel(_49);
},getIconClass:function(_4a,_4b){
return (!_4a||this.model.mayHaveChildren(_4a))?(_4b?"dijitFolderOpened":"dijitFolderClosed"):"dijitLeaf";
},getLabelClass:function(_4c,_4d){
},getRowClass:function(_4e,_4f){
},getIconStyle:function(_50,_51){
},getLabelStyle:function(_52,_53){
},getRowStyle:function(_54,_55){
},getTooltip:function(_56){
return "";
},_onKeyPress:function(e){
if(e.altKey){
return;
}
var dk=_1.keys;
var _57=_2.getEnclosingWidget(e.target);
if(!_57){
return;
}
var key=e.charOrCode;
if(typeof key=="string"&&key!=" "){
if(!e.altKey&&!e.ctrlKey&&!e.shiftKey&&!e.metaKey){
this._onLetterKeyNav({node:_57,key:key.toLowerCase()});
_1.stopEvent(e);
}
}else{
if(this._curSearch){
clearTimeout(this._curSearch.timer);
delete this._curSearch;
}
var map=this._keyHandlerMap;
if(!map){
map={};
map[dk.ENTER]="_onEnterKey";
map[dk.SPACE]=map[" "]="_onEnterKey";
map[this.isLeftToRight()?dk.LEFT_ARROW:dk.RIGHT_ARROW]="_onLeftArrow";
map[this.isLeftToRight()?dk.RIGHT_ARROW:dk.LEFT_ARROW]="_onRightArrow";
map[dk.UP_ARROW]="_onUpArrow";
map[dk.DOWN_ARROW]="_onDownArrow";
map[dk.HOME]="_onHomeKey";
map[dk.END]="_onEndKey";
this._keyHandlerMap=map;
}
if(this._keyHandlerMap[key]){
this[this._keyHandlerMap[key]]({node:_57,item:_57.item,evt:e});
_1.stopEvent(e);
}
}
},_onEnterKey:function(_58){
this._publish("execute",{item:_58.item,node:_58.node});
this.dndController.userSelect(_58.node,_1.isCopyKey(_58.evt),_58.evt.shiftKey);
this.onClick(_58.item,_58.node,_58.evt);
},_onDownArrow:function(_59){
var _5a=this._getNextNode(_59.node);
if(_5a&&_5a.isTreeNode){
this.focusNode(_5a);
}
},_onUpArrow:function(_5b){
var _5c=_5b.node;
var _5d=_5c.getPreviousSibling();
if(_5d){
_5c=_5d;
while(_5c.isExpandable&&_5c.isExpanded&&_5c.hasChildren()){
var _5e=_5c.getChildren();
_5c=_5e[_5e.length-1];
}
}else{
var _5f=_5c.getParent();
if(!(!this.showRoot&&_5f===this.rootNode)){
_5c=_5f;
}
}
if(_5c&&_5c.isTreeNode){
this.focusNode(_5c);
}
},_onRightArrow:function(_60){
var _61=_60.node;
if(_61.isExpandable&&!_61.isExpanded){
this._expandNode(_61);
}else{
if(_61.hasChildren()){
_61=_61.getChildren()[0];
if(_61&&_61.isTreeNode){
this.focusNode(_61);
}
}
}
},_onLeftArrow:function(_62){
var _63=_62.node;
if(_63.isExpandable&&_63.isExpanded){
this._collapseNode(_63);
}else{
var _64=_63.getParent();
if(_64&&_64.isTreeNode&&!(!this.showRoot&&_64===this.rootNode)){
this.focusNode(_64);
}
}
},_onHomeKey:function(){
var _65=this._getRootOrFirstNode();
if(_65){
this.focusNode(_65);
}
},_onEndKey:function(_66){
var _67=this.rootNode;
while(_67.isExpanded){
var c=_67.getChildren();
_67=c[c.length-1];
}
if(_67&&_67.isTreeNode){
this.focusNode(_67);
}
},multiCharSearchDuration:250,_onLetterKeyNav:function(_68){
var cs=this._curSearch;
if(cs){
cs.pattern=cs.pattern+_68.key;
clearTimeout(cs.timer);
}else{
cs=this._curSearch={pattern:_68.key,startNode:_68.node};
}
var _69=this;
cs.timer=setTimeout(function(){
delete _69._curSearch;
},this.multiCharSearchDuration);
var _6a=cs.startNode;
do{
_6a=this._getNextNode(_6a);
if(!_6a){
_6a=this._getRootOrFirstNode();
}
}while(_6a!==cs.startNode&&(_6a.label.toLowerCase().substr(0,cs.pattern.length)!=cs.pattern));
if(_6a&&_6a.isTreeNode){
if(_6a!==cs.startNode){
this.focusNode(_6a);
}
}
},isExpandoNode:function(_6b,_6c){
return _1.isDescendant(_6b,_6c.expandoNode);
},_onClick:function(_6d,e){
var _6e=e.target,_6f=this.isExpandoNode(_6e,_6d);
if((this.openOnClick&&_6d.isExpandable)||_6f){
if(_6d.isExpandable){
this._onExpandoClick({node:_6d});
}
}else{
this._publish("execute",{item:_6d.item,node:_6d,evt:e});
this.onClick(_6d.item,_6d,e);
this.focusNode(_6d);
}
_1.stopEvent(e);
},_onDblClick:function(_70,e){
var _71=e.target,_72=(_71==_70.expandoNode||_71==_70.expandoNodeText);
if((this.openOnDblClick&&_70.isExpandable)||_72){
if(_70.isExpandable){
this._onExpandoClick({node:_70});
}
}else{
this._publish("execute",{item:_70.item,node:_70,evt:e});
this.onDblClick(_70.item,_70,e);
this.focusNode(_70);
}
_1.stopEvent(e);
},_onExpandoClick:function(_73){
var _74=_73.node;
this.focusNode(_74);
if(_74.isExpanded){
this._collapseNode(_74);
}else{
this._expandNode(_74);
}
},onClick:function(_75,_76,evt){
},onDblClick:function(_77,_78,evt){
},onOpen:function(_79,_7a){
},onClose:function(_7b,_7c){
},_getNextNode:function(_7d){
if(_7d.isExpandable&&_7d.isExpanded&&_7d.hasChildren()){
return _7d.getChildren()[0];
}else{
while(_7d&&_7d.isTreeNode){
var _7e=_7d.getNextSibling();
if(_7e){
return _7e;
}
_7d=_7d.getParent();
}
return null;
}
},_getRootOrFirstNode:function(){
return this.showRoot?this.rootNode:this.rootNode.getChildren()[0];
},_collapseNode:function(_7f){
if(_7f._expandNodeDeferred){
delete _7f._expandNodeDeferred;
}
if(_7f.isExpandable){
if(_7f.state=="LOADING"){
return;
}
_7f.collapse();
this.onClose(_7f.item,_7f);
this._state(_7f,false);
}
},_expandNode:function(_80,_81){
if(_80._expandNodeDeferred&&!_81){
return _80._expandNodeDeferred;
}
var _82=this.model,_83=_80.item,_84=this;
switch(_80.state){
case "UNCHECKED":
_80.markProcessing();
var def=(_80._expandNodeDeferred=new _1.Deferred());
_82.getChildren(_83,function(_85){
_80.unmarkProcessing();
var _86=_80.setChildItems(_85);
var ed=_84._expandNode(_80,true);
_86.addCallback(function(){
ed.addCallback(function(){
def.callback();
});
});
},function(err){
console.error(_84,": error loading root children: ",err);
});
break;
default:
def=(_80._expandNodeDeferred=_80.expand());
this.onOpen(_80.item,_80);
this._state(_80,true);
}
return def;
},focusNode:function(_87){
_2.focus(_87.labelNode);
},_onNodeFocus:function(_88){
if(_88&&_88!=this.lastFocused){
if(this.lastFocused&&!this.lastFocused._destroyed){
this.lastFocused.setFocusable(false);
}
_88.setFocusable(true);
this.lastFocused=_88;
}
},_onNodeMouseEnter:function(_89){
},_onNodeMouseLeave:function(_8a){
},_onItemChange:function(_8b){
var _8c=this.model,_8d=_8c.getIdentity(_8b),_8e=this._itemNodesMap[_8d];
if(_8e){
var _8f=this.getLabel(_8b),_90=this.getTooltip(_8b);
_1.forEach(_8e,function(_91){
_91.set({item:_8b,label:_8f,tooltip:_90});
_91._updateItemClasses(_8b);
});
}
},_onItemChildrenChange:function(_92,_93){
var _94=this.model,_95=_94.getIdentity(_92),_96=this._itemNodesMap[_95];
if(_96){
_1.forEach(_96,function(_97){
_97.setChildItems(_93);
});
}
},_onItemDelete:function(_98){
var _99=this.model,_9a=_99.getIdentity(_98),_9b=this._itemNodesMap[_9a];
if(_9b){
_1.forEach(_9b,function(_9c){
this.dndController.removeTreeNode(_9c);
var _9d=_9c.getParent();
if(_9d){
_9d.removeChild(_9c);
}
_9c.destroyRecursive();
},this);
delete this._itemNodesMap[_9a];
}
},_initState:function(){
this._openedNodes={};
if(this.persist&&this.cookieName){
var _9e=_1.cookie(this.cookieName);
if(_9e){
_1.forEach(_9e.split(","),function(_9f){
this._openedNodes[_9f]=true;
},this);
}
}
},_state:function(_a0,_a1){
if(!this.persist){
return false;
}
var _a2=_1.map(_a0.getTreePath(),function(_a3){
return this.model.getIdentity(_a3);
},this).join("/");
if(arguments.length===1){
return this._openedNodes[_a2];
}else{
if(_a1){
this._openedNodes[_a2]=true;
}else{
delete this._openedNodes[_a2];
}
var ary=[];
for(var id in this._openedNodes){
ary.push(id);
}
_1.cookie(this.cookieName,ary.join(","),{expires:365});
}
},destroy:function(){
if(this._curSearch){
clearTimeout(this._curSearch.timer);
delete this._curSearch;
}
if(this.rootNode){
this.rootNode.destroyRecursive();
}
if(this.dndController&&!_1.isString(this.dndController)){
this.dndController.destroy();
}
this.rootNode=null;
this.inherited(arguments);
},destroyRecursive:function(){
this.destroy();
},resize:function(_a4){
if(_a4){
_1.marginBox(this.domNode,_a4);
}
this._nodePixelIndent=_1.position(this.tree.indentDetector).w;
if(this.tree.rootNode){
this.tree.rootNode.set("indent",this.showRoot?0:-1);
}
},_createTreeNode:function(_a5){
return new _2._TreeNode(_a5);
}});
return _2.Tree;
});
