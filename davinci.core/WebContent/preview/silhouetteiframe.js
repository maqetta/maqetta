/*
	Low-level utilities for showing an HTML iframe inside of an SVG device silhouette.
	The caller must pass argument 'rootNode' through the constructor that
	points to a DIV that looks exactly like this:
	
	<div class="silhouette_div_container">
		<span class="silhouetteiframe_object_container"></span>
		<iframe src="..." class="silhouetteiframe_iframe"></iframe>
	</div>
	
	NOTE: The DIV and SPAN must be present when the constructor is called.
	It is possible to add the IFRAME after the constructor is called, but the
	IFRAME must be present before any functions are called which trigger rendering.
	Here are some things that trigger rendering:

	* Invoke constructor and pass non-null svgfilename within the constructor args
	* Call setSVGFilename() with non-null svgfilename
	* Call updateObjectElement(), setScaleFactor() or setOrientation() when
		svgfilename isn't null
		
	Note that there are no Dojo dependencies in this code except for the
	dojo.provide() and dojo.declare() wrappers. 
	Everything inside is library-independent.

*/

dojo.provide('preview.silhouetteiframe');

dojo.declare("preview.silhouetteiframe", null, {

	rootNode:null,
	svgfilename:undefined,
	orientation:'portrait',
	scalefactor:1,
	margin:0,
	_object_elem:null,
	_silhouette_div_container_orig_style:{},
	_silhouetteiframe_iframe_orig_style:{},
	
	constructor: function(args){
		var rootNode = this.rootNode = args.rootNode;
		if(!rootNode){
			console.log('preview.silhouetteiframe.buildRendering(): Missing required parameter rootNode');
			return;
		}
		if(!this.verifyDOMTree(false)){
			return;
		}
		this._isWebKit = navigator.userAgent.indexOf("WebKit") != -1;
		if(args.svgfilename){
			this.svgfilename = args.svgfilename;
		}
		if(args.orientation){
			this.orientation = args.orientation;
		}
		if(args.scalefactor){
			this.scalefactor = args.scalefactor;
		}
		if(args.margin){
			this.margin = args.margin;
		}
		
		// Save old 'style' attribute values so we can restore later if device==none
		this._silhouette_div_container_orig_style={};
		var style=rootNode.style;
		for(var i=0; i<style.length; i++){
			this._silhouette_div_container_orig_style[style.item(i)] = style[style.item(i)];
		}
		var silhouetteiframe_iframes = rootNode.querySelectorAll(".silhouetteiframe_iframe");
		if(silhouetteiframe_iframes.length>0){
			this._init_silhouetteiframe_iframe_orig_style();
		}else{
			this._silhouetteiframe_iframe_orig_style=null; // if no iframe yet, can't grab initial style properties
		}
		
		rootNode._silhouetteiframe = this; // Attach "this" object to rootNode
		this.addStyleDeclarations();
		this.updateObjectElement();
    },
    
	_init_silhouetteiframe_iframe_orig_style: function(){
		this._silhouetteiframe_iframe_orig_style={};
		var silhouetteiframe_iframe = this.rootNode.querySelectorAll(".silhouetteiframe_iframe")[0];
		var style=silhouetteiframe_iframe.style;
		for(var i=0; i<style.length; i++){
			this._silhouetteiframe_iframe_orig_style[style.item(i)] = style[style.item(i)];
		}
	},
	
	verifyDOMTree: function(iframeElementMustBePresent){
		var rootNode = this.rootNode;
		if(rootNode && rootNode.children && rootNode.children.length){
			var spanNode=rootNode.children[0];
		}else{
			console.log('ERROR. preview.silhouetteiframe.verifyDOMTree(): no children on rootNode');
			return false;
		}
		if(iframeElementMustBePresent){
			if(rootNode.children.length<2){
				console.log('ERROR. preview.silhouetteiframe.verifyDOMTree(): iframe child not present');
				return false;
			}
			var iframeNode=rootNode.children[1];
		}
		if(rootNode.nodeName != 'DIV' || rootNode.className.indexOf('silhouette_div_container')==-1 ||
				!spanNode || spanNode.nodeName != 'SPAN' || spanNode.className.indexOf('silhouetteiframe_object_container')==-1 ||
				(iframeElementMustBePresent &&
					(!iframeNode || iframeNode.nodeName != 'IFRAME' || iframeNode.className.indexOf('silhouetteiframe_iframe')==-1))){
			console.log('ERROR. preview.silhouetteiframe.preview.silhouetteiframe.verifyDOMTree(): incorrect DOM tree on rootNode');
			return false;
		}
		return true;
	},
	
	addStyleDeclarations: function(){
		// Only add style declarations if not already there
		var style_elems = document.querySelectorAll('style.silhouetteiframe_styles');
		if(style_elems.length==0){
			if(!document.head){
				var head_elem = document.createElement('head');
				var html_elem = document.documentElement;
				html_elem.insertBefore(head_elem, html_elem.firstChild);
			}
			var style_elem = document.createElement('style');
			style_elem.setAttribute('type','text/css');
			style_elem.setAttribute('class','silhouetteiframe_styles');
			style_elem.innerHTML = '.silhouetteiframe_div_container { display:inline-block; text-align:left; }\n'+
					'.silhouetteiframe_iframe { position:absolute; top:0px; left:0px; border:none; }';
			document.head.appendChild(style_elem);
		}
	},
	
	_restoreStyle: function(style, orig_style){
		if(style){
			for(var i=style.length-1; i>=0; i--){
				style.removeProperty(style.item(i));
			}
			if(orig_style){
				// Restore any element.style properties from original template
				for(var i in orig_style){
					style[i] = orig_style[i];
				}
			}
		}
	},

	updateObjectElement: function(){
		var silhouetteiframe_object_containers = document.querySelectorAll(".silhouetteiframe_object_container",this.rootNode);
		if(silhouetteiframe_object_containers.length==0){
			return;
		}
		var silhouetteiframe_object_container = silhouetteiframe_object_containers[0];
		silhouetteiframe_object_container.innerHTML = '';
		
		this.object_elem = null;
		if(this.svgfilename){
			var rootNode = this.rootNode;
			if(!this.verifyDOMTree(true)){
				return;
			}
			// null means we haven't stashed away the iframe's element.style
			if(this._silhouetteiframe_iframe_orig_style === null){
				this._init_silhouetteiframe_iframe_orig_style();
			}
			silhouetteiframe_object_container.innerHTML = '<object class="silhouetteiframe_object" data="'+
				this.svgfilename+'" type="image/svg+xml" '+
				'onload="event.target.parentNode.parentNode._silhouetteiframe.svgloadhandler(event.target)"></object>';
		}else{
			// Restore element.style on the rootNode and iframe node
			this._restoreStyle(this.rootNode.style, this._silhouette_div_container_orig_style);			
			var silhouetteiframe_iframes = document.querySelectorAll(".silhouetteiframe_iframe",this.rootNode);
			if(silhouetteiframe_iframes.length>0){
				var silhouetteiframe_iframe = silhouetteiframe_iframes[0];
				this._restoreStyle(silhouetteiframe_iframe.style, this._silhouetteiframe_iframe_orig_style);
			}			
		}
	},

	svgloadhandler: function(object_elem){
		this._object_elem = object_elem;
		this._silhouette_reset_size_position(false);
	},

	setSVGFilename: function(svgfilename){
		this.svgfilename = svgfilename;
		this.updateObjectElement();
	},

	setScaleFactor: function(scalefactor){
		this.scalefactor = scalefactor;
		if(this._isWebKit){
			// Overcome WebKit bug where dynamic scaling in presence of CSS rotate transform
			// causes misalignment of OBJECT holding SVG. Force recreation of OBJECT tag.
			this.updateObjectElement();
		}else{
			this._silhouette_reset_size_position(false);
		}
	},

	setOrientation: function(orientation){
		this.orientation = orientation;
		this._silhouette_reset_size_position(true);
	},

	_silhouette_reset_size_position: function(doAnimations) {
		var object_elem = this._object_elem;
		var orientation = this.orientation;
		var scalefactor = this.scalefactor;
		
		// Extract DeviceRect and ScreenRect values from SVG file
		// Silhouette SVGs must have 2 <rect> elements, 
		// one with id="DeviceRect", one with id="ScreenRect"
		if(!object_elem)
			return;
		var svg_doc = object_elem.getSVGDocument();
		if(!svg_doc)
			return;
		var svg_elem = svg_doc.documentElement;
		// Note: in future, maybe multiple silhouettes at once
		var iframe_elems = document.querySelectorAll(".silhouetteiframe_iframe");
		if(iframe_elems.length<=0)
			return;
		var iframe_elem = iframe_elems[0];
		var device_elems = svg_doc.querySelectorAll("#DeviceRect");
		if(device_elems.length<=0)
			return;
		var device_elem = device_elems[0];
		var screen_elems = svg_doc.querySelectorAll("#ScreenRect");
		if(screen_elems.length<=0)
			return;
		var screen_elem = screen_elems[0];
		// HundredPixelRect really should be there, but don't die if it isn't
		var hundredpixel_elems = svg_doc.querySelectorAll("#HundredPixelRect");
		var hundredpixel_elem;
		if(hundredpixel_elems.length>0){
			hundredpixel_elem = hundredpixel_elems[0];
		}else{
			console.log('WARNING: Missing #HundredPixelRect');
		}
		if(scalefactor<=0)
			return;

		var silhouetteiframe_div_container = this.rootNode;

		var device_x = device_elem.getAttribute("x")-0;	
		var device_y = device_elem.getAttribute("y")-0;	
		var device_width = device_elem.getAttribute("width")-0;	
		var device_height = device_elem.getAttribute("height")-0;
		var screen_x = screen_elem.getAttribute("x")-0;	
		var screen_y = screen_elem.getAttribute("y")-0;	
		var screen_width = screen_elem.getAttribute("width")-0;	
		var screen_height = screen_elem.getAttribute("height")-0;
		var screen_offset_x = screen_x - device_x;
		var screen_offset_y = screen_y - device_y;

		var scale_adjust_x, scale_adjust_y;
		if(hundredpixel_elem){
			var hundredpixel_width = hundredpixel_elem.getAttribute("width")-0;	
			var hundredpixel_height = hundredpixel_elem.getAttribute("height")-0;
			if(hundredpixel_width>0 && hundredpixel_height>0){
				scale_adjust_x = (100/hundredpixel_width)*scalefactor;
				scale_adjust_y = (100/hundredpixel_height)*scalefactor;
			}
		}
		// If #HundredPixelWidth rect not there, or hundredpixel_width<=0
		if(!scale_adjust_x){
			// Overcome Illustrator bug where it generates SVG files that
			// assume 72px/in versus browsers assuming 96px/in
			var ai_scale_adjust = 4/3;
			scale_adjust_x = scale_adjust_y = ai_scale_adjust * scalefactor;
		}

		obj_style = object_elem.style;
		obj_style.overflow = 'hidden';

		var scaled_device_width = device_width * scale_adjust_x;
		var scaled_device_height = device_height * scale_adjust_y;
		var scaled_screen_width = screen_width * scale_adjust_x;
		var scaled_screen_height = screen_height * scale_adjust_y;
		var scaled_screen_offset_x = screen_offset_x * scale_adjust_x;

		// Increase sizes for HTML elements to deal with Webkit round-off errors
		// that sometimes cause scrollbars to appear.
		// Just adding 1 or 2 (or even 10) doesn't do the trick, so adjust by 20.
		var margin_adjust = (this._isWebKit) ? 20 : this.margin;
		var adj_scaled_device_width = scaled_device_width + margin_adjust;
		var adj_scaled_device_height = scaled_device_height + margin_adjust;

		var svg_ns="http://www.w3.org/2000/svg";
		var xlink_ns="http://www.w3.org/1999/xlink";
		var unique='_aqzpqtxv';	// use ids that are unlikely to appear in an SVG silhouette doc
		var g1_id='g1'+unique, g2_id='g2'+unique, a1_id='a1'+unique, a2_id='a2'+unique;     
		var g1_elem=svg_doc.getElementById(g1_id);
		var g2_elem, a1_elem, a2_elem;
		if(g1_elem){
			// if g1_elem is already in doc, then we are updating an SVG file
			// that was loaded previously and therefore already is set up
			// with wrapper <g> elements and <animateTransform> elements.
			g2_elem=svg_doc.getElementById(g2_id);
			a1_elem=svg_doc.getElementById(a1_id);
			a2_elem=svg_doc.getElementById(a2_id);
			if(!g2_elem || !a1_elem || !a2_elem)
				return;
		}else{
			// Move all children of <svg> to be descendants of 2 nested <g> elements
			// that will be children of <svg>. Then add two <animateTransform> elements
			// so DOM looks like this:
			// <svg...>
			//   <g id="<g1_id>">    -- This <g> will be target of <animateTransform> elems
			//     <g id="<g2_id>">  -- This <g> will get a 'transform' attribute
			//       ...elements that originally were children of <svg>...
			//     </g>
			//   </g>
			//   <animateTransform id="<a1_id>" .../>
			//   <animateTransform id="<a2_id>".../>
			// </svg>
			g1_elem=svg_doc.createElementNS(svg_ns,'g');
			g1_elem.id=g1_id;
			g2_elem=svg_doc.createElementNS(svg_ns,'g');
			g2_elem.id=g2_id;
			g1_elem.appendChild(g2_elem);
			var prevChild = null;
			for(var i=svg_elem.childNodes.length-1;i>=0;i--){
				prevChild=g2_elem.insertBefore(svg_elem.childNodes[i],prevChild);
			}
			svg_elem.appendChild(g1_elem);
			// inner func for initializing the two <animateTransform> elems
			var setupAnimateTransform = function(elem_id){
				var at_elem=svg_doc.createElementNS(svg_ns,'animateTransform');
				at_elem.id=elem_id;
				at_elem.setAttributeNS(xlink_ns,'href','#'+g1_id);
				at_elem.setAttribute('attributeName','transform');
				at_elem.setAttribute('begin','indefinite');
				at_elem.setAttribute('end','indefinite');
				at_elem.setAttribute('dur','1s');
				svg_elem.appendChild(at_elem);
				return at_elem;
			}
			// First <animateTransform> is a translate with additive='replace' to set a new 'transform' value
			a1_elem = setupAnimateTransform(a1_id);
			a1_elem.setAttribute('type','translate');
			a1_elem.setAttribute('additive','replace');
			// Second <animateTransform> is a rotate with additive='sum' to append a second transform
			a2_elem = setupAnimateTransform(a2_id);
			a2_elem.setAttribute('type','rotate');
			a2_elem.setAttribute('additive','sum');
		}
		
		var div_style = silhouetteiframe_div_container.style;
		div_style.position="relative";
		div_style.overflow="hidden";
		div_style.marginLeft = margin_adjust+"px";
		div_style.marginTop = margin_adjust+"px";
		
		var ifr_style = iframe_elem.style;
		var ifr_html = iframe_elem.contentDocument.documentElement;
		var iht_style = ifr_html.style;
		var ifr_body = iframe_elem.contentDocument.body;
		var iby_style = ifr_body.style;
		iht_style.overflow = "hidden";
		ifr_style.overflow = "hidden";
		iby_style.transformOrigin = iby_style.WebkitTransformOrigin = iby_style.MozTransformOrigin = iby_style.msTransformOrigin = 'left top';
		iby_style.transform = iby_style.WebkitTransform = iby_style.MozTransform = iby_style.msTransform = 'scale('+scalefactor+')';
		// If you scale the BODY, then width/height of 100% also gets scaled, 
		// so have to set width/height to reciprocal
		iby_style.width=(100/scalefactor)+"%";
		iby_style.height=(100/scalefactor)+"%";
		
		var ffadjust=1;	//FIXME: Pretty sure we can delete this variable, but need further FF testing first
		if(orientation!=="landscape"){   // "portrait"
			// Note that these following 3 attributes SHOULDN'T BE NECESSARY
			// but Safari implements these 3 attributes on outermost <svg> INCORRECTLY	
			svg_elem.setAttribute("width",scaled_device_width+"px");
			svg_elem.setAttribute("height",scaled_device_height+"px");
			svg_elem.setAttribute("viewBox",0+" "+0+" "+(scaled_device_width*ffadjust)+" "+(scaled_device_height*ffadjust));
			
			var scaled_screen_offset_y = screen_offset_y * scale_adjust_y;
			ifr_style.marginLeft = scaled_screen_offset_x+"px";
			ifr_style.marginTop = scaled_screen_offset_y+"px";
			ifr_style.width = scaled_screen_width+"px";
			ifr_style.height = scaled_screen_height+"px";
			g1_elem.setAttribute('transform','translate(0 0) rotate(0)');
			g2_elem.setAttribute('transform','scale('+scale_adjust_x+','+scale_adjust_y+') translate(-'+device_x+' -'+device_y+')');
			// Firefox mysteriously crashes if you change animation values
			// but don't actually run animations, so we will run animations always
			// but if doAnimations if false, set 'from' value to be same as 'to' value
			if(doAnimations){
				a1_elem.setAttribute('from',scaled_device_height+',0');
				a2_elem.setAttribute('from','90');
			}else{
				a1_elem.setAttribute('from','0,0');
				a2_elem.setAttribute('from','0');
			}
			a1_elem.setAttribute('to','0,0');
			a2_elem.setAttribute('to','0');
			obj_style.width = adj_scaled_device_width+"px";
			obj_style.height = adj_scaled_device_height+"px";
			div_style.width=adj_scaled_device_width+"px";
			div_style.height=adj_scaled_device_height+"px";
			
		}else{		// "landscape"
			// Note that these following 3 attributes SHOULDN'T BE NECESSARY
			// but Safari implements these 3 attributes on outermost <svg> INCORRECTLY	
			svg_elem.setAttribute("width",scaled_device_height+"px");
			svg_elem.setAttribute("height",scaled_device_width+"px");
			svg_elem.setAttribute("viewBox",0+" "+0+" "+scaled_device_height+" "+scaled_device_width);

			ifr_style.marginLeft = ((device_height - screen_height - screen_offset_y) * scale_adjust_y)+"px";
			ifr_style.marginTop = scaled_screen_offset_x+"px";
			ifr_style.width = scaled_screen_height+"px";
			ifr_style.height = scaled_screen_width+"px";
			g1_elem.setAttribute('transform','translate('+scaled_device_height+' 0) rotate(90)');
			g2_elem.setAttribute('transform','scale('+scale_adjust_x+','+scale_adjust_y+') translate(-'+device_x+' -'+device_y+')');
			// Firefox mysteriously crashes if you change animation values
			// but don't actually run animations, so we will run animations always
			// but if doAnimations if false, set 'from' value to be same as 'to' value
			if(doAnimations){
				a1_elem.setAttribute('from','0,0');
				a2_elem.setAttribute('from','0');
			}else{
				a1_elem.setAttribute('from',scaled_device_height+',0');
				a2_elem.setAttribute('from','90');
			}
			a1_elem.setAttribute('to',scaled_device_height+',0');
			a2_elem.setAttribute('to','90');
			obj_style.width = adj_scaled_device_height+"px";
			obj_style.height = adj_scaled_device_width+"px";
			div_style.width=adj_scaled_device_height+"px";
			div_style.height=adj_scaled_device_width+"px";
		}
		if(a1_elem.beginElement){
			a1_elem.beginElement();
			a2_elem.beginElement();
		}
	}

});
