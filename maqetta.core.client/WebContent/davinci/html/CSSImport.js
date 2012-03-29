/**
 * @class davinci.html.CSSImport
 * @constructor
 * @extends davinci.html.CSSElement
 */
define([
	"dojo/_base/declare",
	"davinci/html/CSSElement",
	"davinci/model/Path",
	"davinci/html/CSSFile"
], function(declare, CSSElement, Path, CSSFile) {

return declare("davinci.html.CSSImport", CSSElement, {

	constructor: function() {
		this.elementType = "CSSImport";
	},

	getCSSFile: function() {
		return this.parent;
	},

	setUrl: function(url) {
		this.url = url;
	},

	visit: function(visitor) {
		if (!visitor.visit(this)) {
			for ( var i = 0; i < this.children.length; i++ ) {
				this.children[i].visit(visitor);
			}
			if (this.cssFile) {
				this.cssFile.visit(visitor);
			}
		}
		if (visitor.endVisit) {
			visitor.endVisit(this);
		}
	},
	
	getText: function(context) {
		s = "@import ";
		if (this.isURL) {
			s += 'url("' + this.url + '");';
		} else {
			s += '"' + this.url + '";';
		}

		return s;
	},
	
	close: function(includeImports) {
		require(["dojo/_base/connect"], function(connect) {
			connect.publish("davinci/model/closeModel", [this]);
		});
		if (this.connection) {
			dojo.disconnect(this.connection);
		}
		delete this.connection;
	},

	load: function(includeImports) {
		var p = this.parent;
		while (p && !(p.url || p.fileName)) {
			p = p.parent;
		}

		var path = new Path(p.url || p.fileName);
		path = path.getParentPath().append(this.url);
		var myUrl = path.toString();
		this.cssFile = new CSSFile({
			url : myUrl,
			loader : this.loader || p.loader,
			includeImports : this.parent.includeImports || includeImports
		});
		this.cssFile.relativeURL = this.url;
		this.connection = dojo.connect(this.cssFile, 'onChange', this.parent, 'onChange');
	}

});
});


