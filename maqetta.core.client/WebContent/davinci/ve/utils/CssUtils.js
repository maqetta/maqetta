dojo.provide("davinci.ve.utils.CssUtils");

(function () {
	var CssUtils = davinci.ve.utils.CssUtils;
	
	var cssColorNames = ['aliceblue','#F0F8FF',
	'antiquewhite','#FAEBD7',
	'aquamarine','#7FFFD4',
	'aqua','#00FFFF',
	'azure','#F0FFFF',
	'beige','#F5F5DC',
	'bisque','#FFE4C4',
	'black','#000000',
	'blanchedalmond','#FFEBCD',
	'blueviolet','#8A2BE2',
	'blue','#0000FF',
	'brown','#A52A2A',
	'burlywood','#DEB887',
	'cadetblue','#5F9EA0',
	'chartreuse','#7FFF00',
	'chocolate','#D2691E',
	'coral','#FF7F50',
	'cornflowerblue','#6495ED',
	'cornsilk','#FFF8DC',
	'crimson','#DC143C',
	'cyan','#00FFFF',
	'darkblue','#00008B',
	'darkcyan','#008B8B',
	'darkgoldenrod','#B8860B',
	'darkgray','#A9A9A9',
	'darkgreen','#006400',
	'darkgrey','#A9A9A9',
	'darkkhaki','#BDB76B',
	'darkmagenta','#8B008B',
	'darkolivegreen','#556B2F',
	'darkorange','#FF8C00',
	'darkorchid','#9932CC',
	'darkred','#8B0000',
	'darksalmon','#E9967A',
	'darkseagreen','#8FBC8F',
	'darkslateblue','#483D8B',
	'darkslategray','#2F4F4F',
	'darkslategrey','#2F4F4F',
	'darkturquoise','#00CED1',
	'darkviolet','#9400D3',
	'deeppink','#FF1493',
	'deepskyblue','#00BFFF',
	'dimgray','#696969',
	'dimgrey','#696969',
	'dodgerblue','#1E90FF',
	'firebrick','#B22222',
	'floralwhite','#FFFAF0',
	'forestgreen','#228B22',
	'fuchsia','#FF00FF',
	'gainsboro','#DCDCDC',
	'ghostwhite','#F8F8FF',
	'goldenrod','#DAA520',
	'gold','#FFD700',
	'gray','#808080',
	'greenyellow','#ADFF2F',
	'green','#008000',
	'grey','#808080',
	'honeydew','#F0FFF0',
	'hotpink','#FF69B4',
	'indianred','#CD5C5C',
	'indigo','#4B0082',
	'ivory','#FFFFF0',
	'khaki','#F0E68C',
	'lavender','#E6E6FA',
	'lavenderblush','#FFF0F5',
	'lawngreen','#7CFC00',
	'lemonchiffon','#FFFACD',
	'lightblue','#ADD8E6',
	'lightcoral','#F08080',
	'lightcyan','#E0FFFF',
	'lightgoldenrodyellow','#FAFAD2',
	'lightgray','#D3D3D3',
	'lightgreen','#90EE90',
	'lightgrey','#D3D3D3',
	'lightpink','#FFB6C1',
	'lightsalmon','#FFA07A',
	'lightseagreen','#20B2AA',
	'lightskyblue','#87CEFA',
	'lightslategray','#778899',
	'lightslategrey','#778899',
	'lightsteelblue','#B0C4DE',
	'lightyellow','#FFFFE0',
	'limegreen','#32CD32',
	'lime','#00FF00',
	'linen','#FAF0E6',
	'magenta','#FF00FF',
	'maroon','#800000',
	'mediumaquamarine','#66CDAA',
	'mediumblue','#0000CD',
	'mediumorchid','#BA55D3',
	'mediumpurple','#9370DB',
	'mediumseagreen','#3CB371',
	'mediumslateblue','#7B68EE',
	'mediumspringgreen','#00FA9A',
	'mediumturquoise','#48D1CC',
	'mediumvioletred','#C71585',
	'midnightblue','#191970',
	'mintcream','#F5FFFA',
	'mistyrose','#FFE4E1',
	'moccasin','#FFE4B5',
	'navajowhite','#FFDEAD',
	'navy','#000080',
	'oldlace','#FDF5E6',
	'olivedrab','#6B8E23',
	'olive','#808000',
	'orangered','#FF4500',
	'orange','#FFA500',
	'orchid','#DA70D6',
	'palegoldenrod','#EEE8AA',
	'palegreen','#98FB98',
	'paleturquoise','#AFEEEE',
	'palevioletred','#DB7093',
	'papayawhip','#FFEFD5',
	'peachpuff','#FFDAB9',
	'peru','#CD853F',
	'pink','#FFC0CB',
	'plum','#DDA0DD',
	'powderblue','#B0E0E6',
	'purple','#800080',
	'red','#FF0000',
	'rosybrown','#BC8F8F',
	'royalblue','#4169E1',
	'saddlebrown','#8B4513',
	'salmon','#FA8072',
	'sandybrown','#F4A460',
	'seagreen','#2E8B57',
	'seashell','#FFF5EE',
	'sienna','#A0522D',
	'silver','#C0C0C0',
	'skyblue','#87CEEB',
	'slateblue','#6A5ACD',
	'slategray','#708090',
	'slategrey','#708090',
	'snow','#FFFAFA',
	'springgreen','#00FF7F',
	'steelblue','#4682B4',
	'tan','#D2B48C',
	'teal','#008080',
	'thistle','#D8BFD8',
	'tomato','#FF6347',
	'turquoise','#40E0D0',
	'violet','#EE82EE',
	'wheat','#F5DEB3',
	'white','#FFFFFF',
	'whitesmoke','#F5F5F5',
	'yellowgreen','#9ACD32',
	'yellow','#FFFF00'];
	
	var nonneg = '(?:\\d*\\.\\d+|\\d+)';
	var num = '\\-?' + nonneg;
	var hex = '[0-9A-Fa-f]';
	var hexcolor = '\\#(?:' + hex + '{6}|' + hex + '{3})';
	var nonneg_or_pct = '(?:' + nonneg + '%?)';
	var num_or_pct = '(?:' + num + '%?)';
	var angle = '(?:' + num + 'deg)';
	var len_or_pct = '(?:' + num + '(?:in|cm|mm|pt|pc|px|%)|0)';	
	var posn_component = '(?:' + len_or_pct + '|(?:left|center|right|top|bottom))';
	var posn = '\\s*' + posn_component + '(?:\\s*' + posn_component + ')?';
	var extent_keyword = '(?:closest-side|farthest-side|closest-corner|farthest-corner|contain|cover)';
	var extent = '(?:' + extent_keyword + '|(?:' + len_or_pct + '(?:\\s+' + len_or_pct + '\\s*)?))';
	var extent_grouped = '(?:(' + extent_keyword + ')|(?:(' + len_or_pct + ')(?:\\s+(' + len_or_pct + ')\\s*)?))';
	CssUtils.regex_extent_grouped = new RegExp(extent_grouped);
	var shape = 'circle|ellipse';
	var side = '(?:\\s*left\\s*|\\s*right\\s*|\\s*top\\s*|\\s*bottom\\s*){1,2}';
	var to_side = 'to\\s+(' + side + ')';
	var dir = '(?:' + to_side + '|(' + side + ')|(' + angle + '))';
	var dir_strict = '(?:' + to_side + '|(' + angle + '))';
	var optional_dir = '(?:' + dir + '\\s*,\\s*)?';
	var colorfunc3 = '(?:rgb|hsl)\\s*\\(\\s*' + nonneg_or_pct + '\\s*,\\s*' + nonneg_or_pct + '\\s*,\\s*' + nonneg_or_pct + '\\s*\\)';
	var colorfunc4 = '(?:rgba|hsla)\\s*\\(\\s*' + nonneg_or_pct + '\\s*,\\s*' + nonneg_or_pct + '\\s*,\\s*' + nonneg_or_pct + '\\s*,\\s*' + nonneg + '\\s*\\)';
	var shape_and_or_extent = '(?:\\s*(' + shape + ')\\s*(' + extent + ')\\s*|\\s*(' + extent + ')\\s*(' + shape+ ')\\s*|\\s*(' + shape + ')\\s*|\\s*(' + extent + ')\\s*)';
	var posn_and_or_angle = '(?:\\s*(' + posn + ')\\s*(' + angle + ')\\s*|\\s*(' + posn + ')\\s*|\\s*(' + angle + ')\\s*)';
	var posn_and_or_angle_opt_comma = '(?:\\s*' + posn_and_or_angle + '\\s*,\\s*)?';
	var shape_and_or_extent_opt_comma = '(?:\\s*' + shape_and_or_extent + '\\s*,\\s*)?';
	
	CssUtils.regex_num = new RegExp('^' + num + '$');
	CssUtils.regstr_angle = '^\\s*' + dir_strict + '\\s*$';
	CssUtils.regstr_len_or_pct = '^\\s*' + len_or_pct + '\\s*$';
	CssUtils.regstr_posn = '^\\s*' + posn + '\\s*$';
	CssUtils.regstr_shape = '^\\s*' + shape + '\\s*$';
	CssUtils.regstr_extent = '^\\s*' + extent + '\\s*$';
	
	var colornames = '(?:';
	for (var i=0; i<cssColorNames.length; i+=2){
		if(i!=0){
			colornames += '|';
		}
		var colorname = cssColorNames[i];
		colornames += colorname;
	}
	colornames += ')';
	
	var color = '(?:' + colornames + '|' + hexcolor + '|' + colorfunc3 + '|' + colorfunc4 + ')';
	var colorstop = '(?:' + color + '(?:\\s+' + len_or_pct + ')?)';
	CssUtils.colorstop_first = '(?:\\s*(' + color + ')\\s*(' + len_or_pct + ')?\\s*,?(.*))';
	CssUtils.regex_colorstop_first = new RegExp(CssUtils.colorstop_first);
	var colorstops = '(' + colorstop + '(?:\\s*,\\s*' + colorstop + ')*' + ')';

	var linearfunc = '(?:-moz-linear-gradient|-webkit-linear-gradient|-ms-linear-gradient|-o-linear-gradient|linear-gradient)';
	var radialfunc = '(?:-moz-radial-gradient|-webkit-radial-gradient|-ms-radial-gradient|-o-radial-gradient|radial-gradient)';
	
	var singlequotedUrl = '\\\'([^\\\']*)\\\'*';
	var doublequotedUrl = '\\\"([^\\\"]*)\\\"';
	var unquotedUrl = '([^\\\'\\\"]*)';
	var urlValue = '(?:' + singlequotedUrl + '|' + doublequotedUrl + '|' + unquotedUrl + ')';
	
	CssUtils.url = '^\\s*' + '(url)' + '\\s*\\(\\s*' + urlValue + '\\s*\\)\\s*$';
	CssUtils.regex_url = new RegExp(CssUtils.url);
	CssUtils.regstr_stop_color = '\\s*' + color + '\\s*';
	CssUtils.regstr_stop_pos = '\\s*' + len_or_pct + '\\s*';

	CssUtils.linear_gradient = '^\\s*(' + linearfunc + ')\\s*\\(\\s*' + optional_dir + '\\s*' + colorstops + '\\s*\\)\\s*$';
	CssUtils.regex_linear = new RegExp(CssUtils.linear_gradient);

//FIXME: Why posn_and_or_angle_opt_comma ????
//FIXME: Actually should have 2 separate regexes, one for circle (with only one possible value for extent)
//  and another for ellipse (with two possible values for extent)
	CssUtils.radial_gradient = '^\\s*(' + radialfunc + ')\\s*\\(\\s*' + posn_and_or_angle_opt_comma + '\\s*' + shape_and_or_extent_opt_comma + '\\s*' + colorstops + '\\s*\\)\\s*$';
	CssUtils.regex_radial = new RegExp(CssUtils.radial_gradient);
	
	var coord = '(?:top|bottom|left|right|center|' + num_or_pct + ')';
	var point = '(?:\\s*' + coord + '\\s+' + coord + '\\s*)';
	var point_grouped = '(?:\\s*(' + coord + ')\\s+(' + coord + ')\\s*)';
	CssUtils.regex_webkit_point_grouped = new RegExp(point_grouped);
	var comma_point = '(?:\\s*,\\s*(' + point + ')\\s*)';
	var comma_radius = '(?:\\s*,\\s*(' + nonneg + ')\\s*)';
	
	// Note: following regex doesn't account for spec constraint where if stop value is a number it must be between 0 and 1.0
	var colorstopfunc = '(?:color-stop\\s*\\(\\s*' + num_or_pct + '\\s*,\\s*' + color + '\\s*\\)\\s*)';
	var colorstopfunc_grouped = '(?:(color-stop)\\s*\\(\\s*(' + num_or_pct + ')\\s*,\\s*(' + color + ')\\s*\\)\\s*)';
	var fromfunc = '(?:from\\s*\\(\\s*' + color + '\\s*\\)\\s*)';
	var fromfunc_grouped = '(?:(from)\\s*\\(\\s*(' + color + ')\\s*\\)\\s*)';
	var tofunc = '(?:to\\s*\\(\\s*' + color + '\\s*\\)\\s*)';
	var tofunc_grouped = '(?:(to)\\s*\\(\\s*(' + color + ')\\s*\\)\\s*)';
	var stopfunc = '(?:' + colorstopfunc + '|' + fromfunc + '|' + tofunc + ')';
	var stopfunc_grouped = '(?:' + colorstopfunc_grouped + '|' + fromfunc_grouped + '|' + tofunc_grouped + ')';
	var comma_stopfunc = '(?:\\s*,\\s*' + stopfunc + '\\s*)';
	var comma_stopfunc_grouped = '(?:\\s*,\\s*' + stopfunc_grouped + '\\s*)';
	var comma_stopfuncs = '(' + comma_stopfunc + '+)';
	var comma_stopfuncs_first = comma_stopfunc_grouped + '(.*)';
	CssUtils.regex_webkit_comma_stopfuncs_first = new RegExp(comma_stopfuncs_first);
	
	CssUtils.webkit_linear_gradient_orig = '(?:\\s*(-webkit-gradient)\\s*\\(\\s*(linear)\\s*' + comma_point + comma_point + comma_stopfuncs + '\\s*\\)\\s*)';
	CssUtils.regex_webkit_linear_gradient_orig = new RegExp(CssUtils.webkit_linear_gradient_orig);

	CssUtils.webkit_radial_gradient_orig = '(?:\\s*(-webkit-gradient)\\s*\\(\\s*(radial)\\s*' + '(?:' + comma_point + comma_radius + comma_point + comma_radius + '?)' + comma_stopfuncs + '\\s*\\)\\s*)';
	CssUtils.regex_webkit_radial_gradient_orig = new RegExp(CssUtils.webkit_radial_gradient_orig);

	parseColorStops = function(allstops){
		var stops = [];
		do {
			var result = allstops.match(CssUtils.regex_colorstop_first);
			if(result){
				stops.push({ color:result[1], pos:result[2] });
				allstops = result[3];
			}
		} while(result);
		return stops;
	};

	parseWebKitColorStops = function(allstops){
		var stops = [];
		var colorstops = [];
		var from;
		var to;
		do {
			var result = allstops.match(CssUtils.regex_webkit_comma_stopfuncs_first);
			// result[1]=> 'color-stop'
			// result[2]=> <posn> (for 'color-stop()')
			// result[3]=> <color> (for 'color-stop()')
			// result[4]=> 'from'
			// result[5]=> <color> (for 'from')
			// result[6]=> 'to'
			// result[7]=> <color> (for 'from')
			// result[8]=> remainder of string
			if(result){
				if(result[4]){
					from = { color:result[5] };
				}else if(result[6]){
					to = { color:result[7] };
				}else{
					var pos = result[2].match(CssUtils.regex_num) ? (result[2]*100)+'%' : result[2];
					colorstops.push({ color:result[3], pos:pos });
				}
				allstops = result[8];
			}
		} while(result);
		if(from){
			stops.push(from);
		}
		for(var i=0; i<colorstops.length; i++){
			stops.push(colorstops[i]);
		}
		if(to){
			stops.push(to);
		}
		return stops;
	};
	
	webKitPosnAddPx = function(posn){
		var result = posn.match(CssUtils.regex_webkit_point_grouped);
		var s;
		if(result){
			var coord1 = result[1];
			if(coord1.match(/^\d+$/)){
				coord1 += 'px';
			}
			var coord2 = result[2];
			if(coord2.match(/^\d+$/)){
				coord2 += 'px';
			}
			s = coord1 + ' ' + coord2;
			return s;
		}else{
			return posn;
		}
	};

	/**
	 * Parses many different background-image syntaxes, including:
	 *   url() function
	 *   W3C's official syntax for linear-gradient() and radial-gradient()
	 *   Vendor prefixes for W3C's official syntax (e.g., -moz-linear-gradient)
	 *   Original WebKit syntax for gradients (e.g., -webkit-gradient(linear, ...))
	 *   
	 *  @param {string} propValue  String to parse
	 *  @returns {object}   An object which holds all of the various pieces extracted from the string
	 */
	CssUtils.parseBackgroundImage = function(propValue){
		var o = {};
		var result = propValue.match(/^\s*$/);
		if(result){
			o.type = 'emptystring';
		}else{	
			var result = propValue.match(/^\s*none\s*$/);
			if(result){
				o.type = 'none';
			}else{
				var result = propValue.match(CssUtils.regex_url);
				if(result){
					o.type = 'url';
					// result[1]=>'url', result[2]=>single quoted, [3]=>double quoted, [4]=>unquoted
					o.func = result[1];
					o.url = result[2] ? result[2] : (result[3] ? result[3] : result[4]);
				}else{
					result = propValue.match(CssUtils.regex_webkit_linear_gradient_orig);
					if(result){
						o.type = 'linear';
						// result[1]=> '-webkit-gradient'
						// result[2]=> <type> (in this case, 'linear')
						// result[3]=> <point>
						// result[4]=> <point>
						// result[5]=> all color stops with leading comma
						o.func = result[1];
						o.webkitGradType = result[2];
						o.webKitPosn1 = result[3];
						o.webKitPosn2 = result[4];
						// Convert from WebKit values to W3C values
						var wkPosn1 = o.webKitPosn1;
						var wkPosn2 = o.webKitPosn2;
						var L1 = (wkPosn1.indexOf('left')>=0);
						var T1 = (wkPosn1.indexOf('top')>=0);
						var R1 = (wkPosn1.indexOf('right')>=0);
						var B1 = (wkPosn1.indexOf('bottom')>=0);
						var L2 = (wkPosn2.indexOf('left')>=0);
						var T2 = (wkPosn2.indexOf('top')>=0);
						var R2 = (wkPosn2.indexOf('right')>=0);
						var B2 = (wkPosn2.indexOf('bottom')>=0);
						if(T1 && B2 && ((L1 && L2) || (R1 && R2))){
							o.angle = 'to bottom';
						}else if(B1 && T2 && ((L1 && L2) || (R1 && R2))){
							o.angle = 'to top';
						}else if(L1 && R2 && ((T1 && T2) || (B1 && B2))){
							o.angle = 'to right';
						}else if(L2 && R1 && ((T1 && T2) || (B1 && B2))){
							o.angle = 'to left';
						}else if(L1 && T1 && R2 && B2){
							o.angle = 'to bottom right';
						}else if(L1 && B1 && R2 && T2){
							o.angle = 'to top right';
						}else if(R1 && T1 && L2 && B2){
							o.angle = 'to bottom left';
						}else if(R1 && B1 && L2 && T2){
							o.angle = 'to top left';
						}
						o.stops = parseWebKitColorStops(result[5]);
					}else{
						result = propValue.match(CssUtils.regex_webkit_radial_gradient_orig);
						if(result){
							o.type = 'radial';
							// result[1]=> '-webkit-gradient'
							// result[2]=> <type> (in this case, 'radial')
							// result[3]=> <point>
							// result[4]=> <radius>
							// result[5]=> <point>
							// result[6]=> <radius>
							// result[7]=> all color stops with leading comma
							o.func = result[1];
							o.webkitGradType = result[2];
							o.webKitPosn1 = result[3];
							o.webKitRadius1 = result[4];
							o.webKitPosn2 = result[5];
							o.webKitRadius2 = result[6];
							// Normalize into W3C values
							o.shape = (o.webKitPosn1==o.webKitPosn2) ? 'circle' : 'ellipse';
							// W3C spec doesn't support different center points, 
							// so ignore o.webKitPosn2 and o.webKitRadius1
							// WebKit old-style coordinates didn't have 'px', need to add them
							o.posn = webKitPosnAddPx(o.webKitPosn1);
							o.extent = o.webKitRadius2 ? o.webKitRadius2 + 'px' : (o.webKitRadius1 ? o.webKitRadius1 + 'px' : 'farthest-corner');
							o.stops = parseWebKitColorStops(result[7]);
						}else{
							result = propValue.match(CssUtils.regex_linear);
							if(result){
								o.type = 'linear';
								// result[1]=> 'linear-gradient' | '-webkit-linear-gradient' | ...
								// result[2]=> <side> when using 'to <side>'
								// result[3]=> <side> when just saying <side>
								// result[4]=> <angle>
								// result[5]=> all color stops
								o.func = result[1];
								o.angle = result[2] ? 'to '+result[2] : (result[3] ? 'to '+result[3] : result[4]);
								o.stops = parseColorStops(result[5]);
							}else{
								result = propValue.match(CssUtils.regex_radial);
								if(result){
									o.type = 'radial';
									// result[1]=> 'radial-gradient' | '-webkit-radial-gradient' | ...
									// result[2]=> <posn> when using <posn> <angle>
									// result[3]=> <angle> when using <posn> <angle>
									// result[4]=> <posn> when using <posn> but no <posn>
									// result[5]=> <angle> when using <angle> but no posn>
									// result[6]=> <shape> when using <shape> <extent>
									// result[7]=> <extent> when using <shape> <extent>
									// result[8]=> <extent> when using <extent> <shape>
									// result[9]=> <shape> when using <extent> <shape>>
									// result[10]=> <shape> when using <shape> with no <extent>
									// result[11]=> <extent> when using <extent> with no <shape>
									// result[12]=> all color stops
									o.func = result[1];
									o.posn = result[2] ? result[2] : result[4];
									o.angle = result[3] ? result[3] : result[5];
									o.shape = result[6] ? result[6] : (result[9] ? result[9] : result[10]);
									o.extent = result[7] ? result[7] : (result[8] ? result[8] : result[11]);
									o.stops = parseColorStops(result[12]);
								}
							}
						}
					}
				}			
			}
		}
		if(!result){
			o.type = 'unknown';
		}
		return o;

	};
	
	/**
	 * Using the same data structure generated by parseBackgroundImage,
	 * builds an array of strings that contains various background-image syntaxes
	 * that will work across multiple browsers. The CSS style rules
	 * should include all of these strings in the same order as in the array
	 * to ensure proper result across the various browsers. The array is necessary 
	 * due to the complexities around browser support for CSS3 gradients.
	 * For example, the returned array might have something like:
	 *   ['-webkit-linear-gradient(...)','-moz-linear-gradient(...)',...,'linear-gradient(...)']
	 * The CSS style attribute (or style rule within a stylesheet) should be set up as follows:
	 *   background-image:-webkit-linear-gradient(...); ...; background-image:linear-gradient(...); 
	 * 
	 * @returns [string]
	 */
	CssUtils.buildBackgroundImage = function(o){
		var a = [];
		if(o.type == 'emptystring'){
			a.push('');
		}else if(o.type == 'none'){
			a.push('none');
		}else if(o.type == 'url'){
			if(typeof o.url == 'string' && o.url.length>0){
				a.push("url('" + o.url + "')");
			}
		}else if(o.type == 'linear' || o.type == 'radial'){
			// build strings for w3c stop syntax and old-style webkit stop syntax
			var w3c_stops = '';
			var webkit_from, webkit_to;
			var webkit_colorstops = [];
			for(var i=0; i<o.stops.length; i++){
				var stop = o.stops[i];
				var pos = (typeof stop.pos == 'string' && stop.pos.length>0) ? stop.pos : '';
				if(i>0){
					w3c_stops += ', ';
				}
				w3c_stops += stop.color;
				if((i>0 && i<o.stops.length-1) ||	// intermediate stop
					(i==0 && !(pos.length == 0 || pos == '0%' || (pos-0) == 0)) || // first stop
					(i==o.stops.length-1 && !(pos.length == 0 || pos == '100%' || (pos-0) == 1))) {
					w3c_stops += ' ' + pos;
				}
				if(i==0 && (pos.length == 0 || pos == '0%' || (pos-0) == 0)){
					webkit_from = 'from(' + stop.color+ ')';
				}else if(i==o.stops.length-1 && (pos.length == 0 || pos == '100%' || (pos-0) == 1)){
					webkit_to = 'to(' + stop.color + ')';
				}else{
					webkit_colorstops.push('color-stop(' + pos + ', ' + stop.color + ')');
				}
			}
			var webkit_stops = '';
			var first_added = false;
			if(webkit_from){
				webkit_stops += webkit_from;
				first_added = true;
			}
			if(webkit_to){
				if(first_added){
					webkit_stops += ', ';
				}
				webkit_stops += webkit_to;
				first_added = true;
			}
			for(var i=0; i<webkit_colorstops.length; i++){
				if(first_added){
					webkit_stops += ', ';
				}
				webkit_stops += webkit_colorstops[i];
				first_added = true;				
			}
			if(o.type == 'linear'){
				var w3c = '(';
				var angle = o.angle;
				var angle_result = (typeof angle == 'string' && angle.length>0) ? angle.match(new RegExp(CssUtils.regstr_angle)) : null;
				if(!angle_result){
					angle = 'to bottom';
				}
				if(angle != 'to bottom'){
					w3c += angle + ',';
				}
				var webkit = '(linear,';
				var L = (angle.indexOf('left')>=0);
				var T = (angle.indexOf('top')>=0);
				var R = (angle.indexOf('right')>=0);
				var B = (angle.indexOf('bottom')>=0);
				if(L && T){
					webkit += ' right bottom, left top, ';
				}else if(L && B){
					webkit += ' right top, left bottom, ';
				}else if(R && T){
					webkit += ' left bottom, right top, ';
				}else if(R && B){
					webkit += ' left top, right bottom, ';
				}else if(L){
					webkit += ' right top, left top, ';
				}else if(R){
					webkit += ' left top, right top, ';
				}else if(T){
					webkit += ' left bottom, left top, ';
				}else if(B){
					webkit += ' left top, left bottom, ';
				}else{
					// Convert a W3C angle in degrees into a pair of WebKit percentages
					var w3c_degrees = parseFloat(angle_result[4]);
					// W3C gradients have 0% pointing up and clockwise being positive
					// Convert to mathematical degrees
					var normal_math_degrees = 90 - w3c_degrees;
					var radians = normal_math_degrees * 180 / Math.PI;
					var cos = Math.cos(radians);
					var sin = Math.sin(radians);
					if(cos >= 0 && sin >= 0){	// towards top/right
						webkit += '0% 100%,';
						if(Math.abs(cos) > Math.abs(sin)){	// set x to 100%
							webkit += '100% ' + ((1-(Math.abs(sin)/Math.abs(cos)))*100)+'%';
						}else{	// set y to 100%
							webkit += ((Math.abs(cos)/Math.abs(sin))*100)+'%' + ' 100%';
						}
					}else if(cos >= 0 && sin < 0){	// towards bottom/right
						webkit += '0% 0%,';
						if(Math.abs(cos) > Math.abs(sin)){	// set x to 100%
							webkit += '100% ' + ((Math.abs(-sin)/Math.abs(cos))*100)+'%';
						}else{	// set y to 100%
							webkit += ((Math.abs(cos)/Math.abs(sin))*100)+'%' + ' 100%';
						}
					}else if(cos < 0 && sin >= 0){	// towards top/left
						webkit += '100% 100%,';
						if(Math.abs(cos) > Math.abs(sin)){	// set x to 0%
							webkit += '0% ' + ((1-(Math.abs(sin)/Math.abs(cos)))*100)+'%';
						}else{	// set y to 100%
							webkit += ((Math.abs(cos)/Math.abs(sin))*100)+'%' + ' 100%';
						}
					}else{ // if(cos < 0 && sin < 0) ==> towards bottom/left
						webkit += '100% 0%,';
						if(Math.abs(cos) > Math.abs(sin)){	// set x to 0%
							webkit += '0% ' + ((Math.abs(-sin)/Math.abs(cos))*100)+'%';
						}else{	// set y to 100%
							webkit += ((Math.abs(cos)/Math.abs(sin))*100)+'%' + ' 100%';
						}
					}
					webkit += ', ';
				}
				w3c += w3c_stops + ')';
				webkit += webkit_stops + ')';
				a.push('-webkit-gradient' + webkit);
				a.push('-o-linear-gradient' + w3c);
				a.push('-ms-linear-gradient' + w3c);
				a.push('-moz-linear-gradient' + w3c);
				a.push('-webkit-linear-gradient' + w3c);
				a.push('linear-gradient' + w3c);
			}else{	// radial
				var w3c = '(';
				if(o.posn != 'center' && o.posn != 'center center'){
					w3c += o.posn + ', ';
				}
				if(o.shape != 'circle'){
					w3c += o.shape + ', ';
				}
				if(o.extent != 'farthest-corner'){
					w3c += o.extent + ', ';
				}
				// NOTE: purposely don't even try to map W3C radial gradients
				// to old-style WebKit radial gradients, figuring that newer browsers
				// will propagate that support the W3C syntax, radial gradients aren't used
				// very much, and attempting to map would take a whole ton of code and
				// even then the result wouldn't have lots of problems
				var webkit = '(radial, center center, 10, center center, ';
				
				w3c += w3c_stops + ')';
				webkit += webkit_stops + ')';
				a.push('-webkit-gradient' + webkit);
				a.push('-o-radial-gradient' + w3c);
				a.push('-ms-radial-gradient' + w3c);
				a.push('-moz-radial-gradient' + w3c);
				a.push('-webkit-radial-gradient' + w3c);
				a.push('radial-gradient' + w3c);
			}
		}
//FIXME: Unknown
		return a;
	};
	
}());	





