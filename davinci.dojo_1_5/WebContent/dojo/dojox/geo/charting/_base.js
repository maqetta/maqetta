dojo.provide("dojox.geo.charting._base");

dojo.require("dojo.NodeList-traverse");
dojo.require("dojox.gfx.matrix");
dojo.require("dijit.Tooltip");

(function(){
	var dgc = dojox.geo.charting;
	dgc.showTooltip = function(/*String*/innerHTML, /*dojox.gfx.shape*/ gfxObject, /*String[]?*/ position){
		var arroundNode = dgc._normalizeArround(gfxObject);
		return dijit.showTooltip(innerHTML, arroundNode, position);
	};

	dgc.hideTooltip = function( /*dojox.gfx.shape*/gfxObject){
		return dijit.hideTooltip(gfxObject);
	};

	dgc._normalizeArround = function(gfxObject){
		var bbox = dgc._getRealBBox(gfxObject);
		//var bbox = gfxObject.getBoundingBox();
		//get the real screen coords for gfx object
		var realMatrix = gfxObject._getRealMatrix() || {xx:1,xy:0,yx:0,yy:1,dx:0,dy:0};
		var point = dojox.gfx.matrix.multiplyPoint(realMatrix, bbox.x, bbox.y);
		var gfxDomContainer = dojo.coords(dgc._getGfxContainer(gfxObject));
		gfxObject.x = dojo.coords(gfxDomContainer,true).x + point.x,
		gfxObject.y = dojo.coords(gfxDomContainer,true).y + point.y,
		gfxObject.width = bbox.width * realMatrix.xx,
		gfxObject.height = bbox.height * realMatrix.yy
		return gfxObject;
	};

	dgc._getGfxContainer = function(gfxObject){
		return (new dojo.NodeList(gfxObject.rawNode)).parents("div")[0];
	};

	dgc._getRealBBox = function(gfxObject){
		var bboxObject = gfxObject.getBoundingBox();
		if(!bboxObject){//the gfx object is group
			var shapes = gfxObject.children;
			var bboxObject = dojo.clone(dgc._getRealBBox(shapes[0]));
			dojo.forEach(shapes, function(item){
				var nextBBox = dgc._getRealBBox(item);
				bboxObject.x = Math.min(bboxObject.x, nextBBox.x);
				bboxObject.y = Math.min(bboxObject.y, nextBBox.y);
				bboxObject.endX = Math.max(bboxObject.x + bboxObject.width, nextBBox.x + nextBBox.width);
				bboxObject.endY = Math.max(bboxObject.y + bboxObject.height, nextBBox.y + nextBBox.height);
			});
			bboxObject.width = bboxObject.endX - bboxObject.x;
			bboxObject.height = bboxObject.endY - bboxObject.y;
		}
		return bboxObject;
	};
})();
