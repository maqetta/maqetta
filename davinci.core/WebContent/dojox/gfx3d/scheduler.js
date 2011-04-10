dojo.provide("dojox.gfx3d.scheduler");
dojo.provide("dojox.gfx3d.drawer");
dojo.require("dojox.gfx3d.vector");

dojo.mixin(dojox.gfx3d.scheduler, {
	zOrder: function(buffer, order){
		order = order ? order : dojox.gfx3d.scheduler.order;
		buffer.sort(function(a, b){
			return order(b) - order(a);
		});
		return buffer;
	},

	bsp: function(buffer, outline){
		// console.debug("BSP scheduler");
		outline = outline ? outline : dojox.gfx3d.scheduler.outline;
		var p = new dojox.gfx3d.scheduler.BinarySearchTree(buffer[0], outline);
		dojo.forEach(buffer.slice(1), function(item){ p.add(item, outline); });
		return p.iterate(outline);
	},

	// default implementation
	order: function(it){
		return it.getZOrder();
	},

	outline: function(it){
		return it.getOutline();
	}

});

dojo.declare("dojox.gfx3d.scheduler.BinarySearchTree", null, {
	constructor: function(obj, outline){
		// summary: build the binary search tree, using binary space partition algorithm.
		// The idea is for any polygon, for example, (a, b, c), the space is divided by 
		// the plane into two space: plus and minus. 
		// 
		// for any arbitary vertex p, if(p - a) dotProduct n = 0, p is inside the plane,
		// > 0, p is in the plus space, vice versa for minus space. 
		// n is the normal vector that is perpendicular the plate, defined as:
		//            n = ( b - a) crossProduct ( c - a )
		//
		// in this implementation, n is declared as normal, ,a is declared as orient.
		// 
		// obj: object: dojox.gfx3d.Object
		this.plus = null;
		this.minus = null;
		this.object = obj;

		var o = outline(obj);
		this.orient = o[0];
		this.normal = dojox.gfx3d.vector.normalize(o);
	},

	add: function(obj, outline){
		var epsilon = 0.5,
			o = outline(obj),
			v = dojox.gfx3d.vector,
			n = this.normal,
			a = this.orient,
			BST = dojox.gfx3d.scheduler.BinarySearchTree;

		if(
			dojo.every(o, function(item){
				return Math.floor(epsilon + v.dotProduct(n, v.substract(item, a))) <= 0;
			})
		){
			if(this.minus){
				this.minus.add(obj, outline);
			}else{
				this.minus = new BST(obj, outline);
			}
		}else if(
			dojo.every(o, function(item){ 
				return Math.floor(epsilon + v.dotProduct(n, v.substract(item, a))) >= 0; 
			})
		){
			if(this.plus){
				this.plus.add(obj, outline);
			} else {
				this.plus = new BST(obj, outline);
			}
		}else{
			/*
			dojo.forEach(o, function(item){
				console.debug(v.dotProduct(n, v.substract(item, a)));
			});
			*/
			throw "The case: polygon cross siblings' plate is not implemneted yet";
		}
	},

	iterate: function(outline){
		var epsilon = 0.5;
		var v = dojox.gfx3d.vector;
		var sorted = [];
		var subs = null;
		// FIXME: using Infinity here?
		var view = {x: 0, y: 0, z: -10000};
		if(Math.floor( epsilon + v.dotProduct(this.normal, v.substract(view, this.orient))) <= 0){
			subs = [this.plus, this.minus];
		}else{
			subs = [this.minus, this.plus];
		}

		if(subs[0]){ 
			sorted = sorted.concat(subs[0].iterate());
		}

		sorted.push(this.object);

		if(subs[1]){ 
			sorted = sorted.concat(subs[1].iterate());
		}
		return sorted;
	}

});

dojo.mixin(dojox.gfx3d.drawer, {
	conservative: function(todos, objects, viewport){
		// console.debug('conservative draw');
		dojo.forEach(this.objects, function(item){
			item.destroy();
		});
		dojo.forEach(objects, function(item){
			item.draw(viewport.lighting);
		});
	},
	chart: function(todos, objects, viewport){
		// NOTE: ondemand may require the todos' objects to use setShape
		// to redraw themselves to maintain the z-order.

		// console.debug('chart draw');
		dojo.forEach(this.todos, function(item){
			item.draw(viewport.lighting);
		});
	}
	// More aggrasive optimization may re-order the DOM nodes using the order 
	// of objects, and only elements of todos call setShape.
});
