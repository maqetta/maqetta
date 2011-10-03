//>>built
define("dojox/encoding/compression/splay",["dojo/_base/kernel","dojo/_base/lang","../bits"],function(_1){
var _2=_1.getObject("dojox.encoding.compression",true);
_2.Splay=function(n){
this.up=new Array(2*n+1);
this.left=new Array(n);
this.right=new Array(n);
this.reset();
};
_1.extend(_2.Splay,{reset:function(){
for(var i=1;i<this.up.length;this.up[i]=Math.floor((i-1)/2),++i){
}
for(var i=0;i<this.left.length;this.left[i]=2*i+1,this.right[i]=2*i+2,++i){
}
},splay:function(i){
var a=i+this.left.length;
do{
var c=this.up[a];
if(c){
var d=this.up[c];
var b=this.left[d];
if(c==b){
b=this.right[d];
this.right[d]=a;
}else{
this.left[d]=a;
}
this[a==this.left[c]?"left":"right"][c]=b;
this.up[a]=d;
this.up[b]=c;
a=d;
}else{
a=c;
}
}while(a);
},encode:function(_3,_4){
var s=[],a=_3+this.left.length;
do{
s.push(this.right[this.up[a]]==a);
a=this.up[a];
}while(a);
this.splay(_3);
var l=s.length;
while(s.length){
_4.putBits(s.pop()?1:0,1);
}
return l;
},decode:function(_5){
var a=0;
do{
a=this[_5.getBits(1)?"right":"left"][a];
}while(a<this.left.length);
a-=this.left.length;
this.splay(a);
return a;
}});
return _2.Splay;
});
