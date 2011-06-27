/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/encoding/bits",["dojo/_base/kernel"],function(_1){
_1.getObject("encoding.bits",true,dojox);
dojox.encoding.bits.OutputStream=function(){
this.reset();
};
_1.extend(dojox.encoding.bits.OutputStream,{reset:function(){
this.buffer=[];
this.accumulator=0;
this.available=8;
},putBits:function(_2,_3){
while(_3){
var w=Math.min(_3,this.available);
var v=(w<=_3?_2>>>(_3-w):_2)<<(this.available-w);
this.accumulator|=v&(255>>>(8-this.available));
this.available-=w;
if(!this.available){
this.buffer.push(this.accumulator);
this.accumulator=0;
this.available=8;
}
_3-=w;
}
},getWidth:function(){
return this.buffer.length*8+(8-this.available);
},getBuffer:function(){
var b=this.buffer;
if(this.available<8){
b.push(this.accumulator&(255<<this.available));
}
this.reset();
return b;
}});
dojox.encoding.bits.InputStream=function(_4,_5){
this.buffer=_4;
this.width=_5;
this.bbyte=this.bit=0;
};
_1.extend(dojox.encoding.bits.InputStream,{getBits:function(_6){
var r=0;
while(_6){
var w=Math.min(_6,8-this.bit);
var v=this.buffer[this.bbyte]>>>(8-this.bit-w);
r<<=w;
r|=v&~(~0<<w);
this.bit+=w;
if(this.bit==8){
++this.bbyte;
this.bit=0;
}
_6-=w;
}
return r;
},getWidth:function(){
return this.width-this.bbyte*8-this.bit;
}});
return dojox.encoding.bits;
});
