define([
    	"dojo/_base/declare"
], function(declare){


return declare("davinci.ve.themeEditor.ThemeColor", [dojo.Color], {
	
  constructor: function(/* Object */args){
    dojo.safeMixin(this, args);

  },

	toHsl: function (){
	   var r = this.r;
	   var g = this.g;
	   var b = this.b;
	    r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;

	    if(max == min){
	        h = s = 0; // achromatic
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }

	    return {h: h, s: s, l: l};
	},

	/** Sets the object s color from hue, saturation, lightness
	 * @param   String  h       The hue
	 * @param   String  s       The saturation
	 * @param   String  l       The lightness
	 * @return  Object           The RGB representation
	 */
  setHsl: function (h, s, l){
	    var r, g, b;

	    if(s == 0){
	        r = g = b = l; // achromatic
	    }else{
	        function hue2rgb(p, q, t){
	            if(t < 0) t += 1;
	            if(t > 1) t -= 1;
	            if(t < 1/6) return p + (q - p) * 6 * t;
	            if(t < 1/2) return q;
	            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	            return p;
	        }

	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }
	    this.r = parseInt(r * 255);
	    this.g = parseInt(g * 255);
	    this.b = parseInt(b * 255);
	    if (this.r > 255) this.r=255;
	    if (this.g > 255) this.g=255;
	    if (this.b > 255) this.b=255;
	    return {r:this.r, g:this.g, b:this.b};

	},

	/*
	 * @return  Object           The HSV representation
	 */
	toHsv: function (){
		var r = this.r;
		var g = this.g;
		var b = this.b;
		
	    r = r/255, g = g/255, b = b/255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, v = max;

	    var d = max - min;
	    s = max == 0 ? 0 : d / max;

	    if(max == min){
	        h = 0; // achromatic
	    }else{
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }

	    return {h:h, s:s, v:v};
	},

	/**
	 * Sets color value from HSV
	 *
	 * @param   String  h       The hue
	 * @param   String  s       The saturation
	 * @param   String  v       The value
	 * @return  Object          The RGB representation
	 */
	setHsv: function (h, s, v){
	    var r, g, b;

	    var i = Math.floor(h * 6);
	    var f = h * 6 - i;
	    var p = v * (1 - s);
	    var q = v * (1 - f * s);
	    var t = v * (1 - (1 - f) * s);

	    switch(i % 6){
	        case 0: r = v, g = t, b = p; break;
	        case 1: r = q, g = v, b = p; break;
	        case 2: r = p, g = v, b = t; break;
	        case 3: r = p, g = q, b = v; break;
	        case 4: r = t, g = p, b = v; break;
	        case 5: r = v, g = p, b = q; break;
	    }
	    this.r = r * 255;
	    this.g = g * 255;
	    this.b = b * 255;
	    if (this.r > 255) this.r=255;
	    if (this.g > 255) this.g=255;
	    if (this.b > 255) this.b=255;
	    return {r:this.r, g:this.g, b:this.b};
	},
	

	/**
	 * calculate  a highlight color for the current RGB colors of this object using the normal and highlight colors
	 *
	 * @param   String  normal      Base color
	 * @param   String  highlight   The highlight color
	 * @param   String  v       The value
	 * @return  Object          The RGB representation
	 */
	
	calculateHighlightColor: function(normal, highlight){
		var normalColor =new davinci.ve.themeEditor.ThemeColor(normal); 
		var highlightColor = new davinci.ve.themeEditor.ThemeColor(highlight);
		var calculateHighlight = new davinci.ve.themeEditor.ThemeColor('#FFFFFF'); //  just a place holder
		var normalHsl = normalColor.toHsl();
		var highlightHsl = highlightColor.toHsl();
		var myHsl = this.toHsl();
		var delta = new Object();
		delta.h = highlightHsl.h -  normalHsl.h;
		delta.s = highlightHsl.s -  normalHsl.s;
		delta.l = highlightHsl.l -  normalHsl.l;
		var h = myHsl.h + delta.h;
		var s = myHsl.s + delta.s;
		var l = myHsl.l + delta.l;
		calculateHighlight.setHsl(h,s,l);
		return calculateHighlight;
		
	},
	getHoverColor: function(){
		var normalColor =new davinci.ve.themeEditor.ThemeColor(normal); 
		var highlightColor = new davinci.ve.themeEditor.ThemeColor(highlight);
		var calculateHighlight = new davinci.ve.themeEditor.ThemeColor('#FFFFFF'); //  just a place holder
		var normalHsl = normalColor.toHsl();
		var highlightHsl = highlightColor.toHsl();
		var myHsl = this.toHsl();
		var delta = new Object();
		delta.h = highlightHsl.h -  normalHsl.h;
		delta.s = highlightHsl.s -  normalHsl.s;
		delta.l = highlightHsl.l -  normalHsl.l;
		var h = 0.3329565030146425; //myHsl.h + delta.h;
		var s = 1; //myHsl.s + delta.s;
		var l = 0.8588235294117648; //myHsl.l + delta.l;
		calculateHighlight.setHsl(h,s,l);
		return calculateHighlight;
		
	}


});
});