/**
 * @class davinci.html.HTMLElement
 * @constructor
 * @extends davinci.html.HTMLItem
 */
define([
	"dojo/_base/declare",
	"davinci/html/HTMLItem",
	"davinci/html/HTMLText",
	"davinci/html/HTMLComment",
	"davinci/html/HTMLAttribute"
], function(declare, HTMLItem, HTMLText, HTMLComment, HTMLAttribute) {

return declare("davinci.html.HTMLElement", HTMLItem, {

	constructor: function(tag) {
		this.elementType = "HTMLElement";
		this.attributes = [];
		this.tag = tag || "";
		this._fmChildLine = 0;
		this._fmChildIndent = 0;
	},

	add: function(stmt) {
		if (!this.statements) { this.statements=[]; }
		this.statements.push(stmt);
		this.onChange();
	},

	getText: function(context) {
		context = context || {};
		var s = "";
		var doFormat;
		context.indent += 2;
		s = s + "<" + this.tag;
		for (var i=0; i<this.attributes.length; i++) {
			var attrtext = this.attributes[i].getText(context);
			// noPersist attributes return empty string
			if (attrtext.length>0) {
				s=s+" "+attrtext;
			}
		}
		if (this.noEndTag) {
			s = s + "/>";
		} else {
			s = s + '>';
			s = s + this._addWS(this._fmChildLine, this._fmChildIndent);
			if (this.statements) {
				for (var i=0; i<this.statements.length; i++) {
					s = s + this.statements[i].printStatement(context, this.statements[i]);
				}
			} else if (this.script) {
				s = s + this.script;
			} else {
				if (this.children.length>0) {
					var isStyle = this.tag == "style";

					for (var i=0; i<this.children.length; i++) {
						s = s + this.children[i].getText(context);
						if (isStyle) {
							var lines = this._fmChildLine,
							indent = this._fmChildIndent || 0;
							if (i+1 == this.children.length) {
								lines = this._fmLine;
								indent = this._fmIndent;

							}
							s = s + this._addWS(lines, indent);
						}
					}
				}
			}
			if (doFormat && this.children.length>0) {
				s = s + "\n" + "                                          ".substring(0,  context.indent+1);
			}
			s = s+  "</"+this.tag +">";
		} 
		context.indent -= 2;
		s = s + this._addWS(this._fmLine, this._fmIndent);

		return s;
	},

	_formatModel: function( newElement, index, context) {

		var offset = 0;
		var lfSize = 1;		// should check if 2
		if (index == undefined)
			index = this.children.length;

		function addIndent(indent, elemChild, elem) {
			offset += (lfSize + indent);
			if (elemChild) {
				elemChild._fmChildLine = 1;
				elemChild._fmChildIndent = context.indent;
			} else {
				elem._fmLine = 1;
				elem._fmIndent = context.indent;
			}

		}

		function formatElem(elem, context) {
			elem.startOffset = offset;
			elem.wasParsed = true;
			offset += elem.tag.length + 2;
			for (var i=0; i<elem.attributes.length; i++) {
				elem.attributes[i].startOffset = offset;
				var attrtext = elem.attributes[i].getText(context);
				if (attrtext.length>0)
					offset+=1+attrtext.length;
				elem.attributes[i].endOffset=offset-1;
			}
			if (elem.noEndTag) {
				offset++;
			}
			elem.startTagOffset = offset;
			var  s= "";
			if (elem.statements) {
				for (var i=0; i<elem.statements.length; i++) {
					s = s + elem.statements[i].printStatement(context, elem.statements[i]);
				}
			} else if (elem.script) {
				s=elem.script;
			}
			if (s) {
				offset+=s.length;
			} else if (elem.children.length>0) {
				var doFormat;
				if (!davinci.html._noFormatElements[elem.tag]) {
					context.indent += 2;
					addIndent(context.indent, elem);
					doFormat=true;
				}
				var lastChild;
				for (var i=0; i<elem.children.length; i++) {
					var child = elem.children[i];
					switch (child.elementType) {
					case "HTMLElement":
						if (lastChild && lastChild.elementType != "HTMLText" && !davinci.html._noFormatElements[child.tag]) {
							addIndent(context.indent,null, lastChild);
						}
						formatElem(child,context);
						break;
					case "HTMLText":
						child.startOffset = offset;
						offset += child.value.length;
						break;
					case "HTMLComment":
						child.startOffset = offset;
						offset += child.value.length;
						offset++;
						if (child.isProcessingInstruction) {
							offset+=2;
						}
						break;
					default:
						debugger;
					}
					lastChild=child;
				}
				if (doFormat)
					context.indent -= 2;
				if (lastChild && lastChild.elementType != "HTMLText")
					addIndent(context.indent, null, lastChild);
			}
			offset += elem.tag.length + 3;
			elem.endOffset = offset - 1;
		}
		var elem1, elem2;
		if (!this.children.length || index == 0) {
			elem1 = this;
			offset = this.startTagOffset + 1;
		} else {
			elem2 = this.children[index-1];
			offset = elem2.endOffset + 1;
		}
		var startOffset = offset;
		if (!davinci.html._noFormatElements[newElement.tag]) {
			addIndent(context.indent, elem1, elem2);
			newElement._fmLine = 1;
			newElement._fmIndent = (index < this.children.length) ? context.indent : context.indent-2;
		}
		formatElem(newElement,context);
		return (offset>startOffset) ? offset-startOffset : 0;
	},

	getElementText: function(context) {
		context = context || {};
		var s = "" ;
		if (this.children.length > 0) {
			for (var i=0; i<this.children.length; i++)
				if (this.children[i].elementType!="HTMLComment") {
					s=s+this.children[i].getText(context);
				}
		} else if (this.script) {
			return this.script;
		}else if (this.statements) {
			for (var i=0;i<this.statements.length; i++) {
				s = s + this.statements[i].printStatement(context, this.statements[i]);
			}
		}
		return s;
	},

	getChildElements: function(tagName, recurse, result) {
		result = result || [];
		for (var i=0; i<this.children.length; i++) {
			if (this.children[i].tag == tagName) {
				result.push(this.children[i]);
			}
			if (recurse && this.children[i].elementType == "HTMLElement") {
				this.children[i].getChildElements(tagName, recurse, result);
			}
		}
		return result;
	},

	getChildElement: function(tagName) {
		for (var i=0; i<this.children.length; i++)
			if (this.children[i].tag == tagName) {
				return this.children[i];
			}
	},

	hasAttribute: function(name) {
		for (var i=0; i<this.attributes.length; i++) {
			if (this.attributes[i].name == name) {
				return true;
			}
		}
		return false;
	},

	getAttribute: function(name) {
		var attr = this._getAttribute(name);
		if (attr) {
			return attr.value;
		}
	},

	_getAttribute: function(name) {
		for (var i=0; i<this.attributes.length; i++) {
			if (this.attributes[i].name == name) {
				return this.attributes[i];
			}
		}
	},

	addText: function(text) {
		this.addChild(new HTMLText(text));
		this.onChange();
	},

	addComment: function(text) {
		this.addChild(new HTMLComment(text));
		this.onChange();
	},

	getLabel: function() {
		return "<" + this.tag + ">";
	},

	addAttribute: function(name, value, noPersist) {
		if (name == 'textContent') {
			this.children = [];
			this.addText(value);
			return;
		}
		var delta;
		var startOffset = (this.attributes.length > 0) ?
				this.attributes[this.attributes.length-1].endOffset + 1 :
					this.startTagOffset -(this.noEndTag ? 2 : 1);
				var attr = this._getAttribute(name);
				var add;
				if (!attr) {
					attr = new HTMLAttribute();
					add = true;
					delta = name.length + value.length + 4;
					attr.startOffset = startOffset;
					attr.endOffset = startOffset + delta - 1;
				} else {
					delta = value.length-attr.value.length;
				}
				attr.name = name;
				attr.setValue(value);
				attr.noPersist = noPersist;
				if (this.wasParsed && !noPersist && delta > 0) {
					this.getHTMLFile().updatePositions(startOffset, delta);
				}
				// delay adding til after other positions updated
				if (add) {
					this.attributes.push(attr);
				}
				this.onChange();
	},

	removeAttribute: function(name) {
		this.attributes.every(function(attr, idx, arr) {
			if (attr.name === name) {
				arr.splice(idx, 1);
				// Make sure that getHTMLFile() returns a non-null value. This
				// HTMLElement may be standalone (not part of a file); for example,
				// see code in davinci.ve.widget.createWidget().
				var file = this.getHTMLFile();
				if (!attr.noPersist && file) {
					var s = attr.getText();
					file.updatePositions(attr.startOffest, 0 - (s.length + 1));
				}
				return false; // break
			}
			return true;
		}, this);
		this.onChange();
	},

	setAttribute: function(name, value) {
		this.removeAttribute(name);
		this.addAttribute(name, value);
	},

	getUniqueID: function(noPersist) {
		var attr = this.getAttribute("id");
		if (!attr) {
			var file = this.getHTMLFile();
			if (!file.uniqueIDs) {
				file.uniqueIDs = {};
			}
			var id;
			if (!file.uniqueIDs.hasOwnProperty(this.tag)) {
				id = file.uniqueIDs[this.tag]=0;
			} else
				id = ++file.uniqueIDs[this.tag];
			this.addAttribute("id", this.tag+"_"+id,noPersist);	 
		}
	},

	findElement: function(id) {
		var attr = this.getAttribute("id");
		if (id == attr ) {
			return this;
		}
		for (var i=0; i<this.children.length; i++) {
			if (this.children[i].elementType == "HTMLElement") {
				var found = this.children[i].findElement(id);
				if (found) {
					return found;
				}
			}
		}
	},

	insertBefore: function(newChild, beforeChild) {
		var index = dojo.indexOf(this.children, beforeChild);
		if (index<0) {
			index=undefined;
		}
		this.addChild(newChild, index);
		this.onChange();
	},

	addChild: function(newChild,index, fromParser) {
		if (!fromParser && this.wasParsed) {
			if (newChild.elementType == 'HTMLElement') {
				// calculate indent
				var myIndent = this._getIndent();
				var childIndent;
				// if inserting before element, use same indent as that element
				if (index < this.children.length && this.children[index].elementType == "HTMLElement")	{
					childIndent = this.children[index]._getIndent();
				} else {
					if (this.children.length) {
						dojo.forEach(this.children, function(element){
							if (element.elementType == "HTMLElement")
								childIndent = element._getIndent();
						});
					} else {
						childIndent = myIndent+1;
					}
				}
				var indent = childIndent;
				var context = {indent:indent};
				var delta = this._formatModel(newChild,index, context);

				this.getHTMLFile().updatePositions(newChild.startOffset, delta);

			} else if (newChild.elementType == "HTMLText" || newChild.elementType.substring(0,3) == "CSS") {
				var s = newChild.getText();
				var offset = this.children.length ? this.children[this.children.length-1].endOffset : this.startTagOffset;
				var len = s.length;
				if (len > 0) {
					if (newChild.elementType!="HTMLText")
						len += this._fmChildIndent + 1;	// if css, add indent+lf
					this.getHTMLFile().updatePositions(offset+1, len);
				}
				newChild.startOffset = offset+1;
				newChild.endOffset = newChild.startOffset+s.length-1;
			}

		}
		HTMLItem.prototype.addChild.apply(this,arguments);
	},

	removeChild: function(child) {
		var index = dojo.indexOf(this.children, child);
		var lfSize = 1;
		if (index >= 0) {
			var delta = 1 + child.endOffset - child.startOffset;

			if (child.elementType == "HTMLElement") {
				if (this.children.length == 1) {
					delta += this._fmChildLine * lfSize + this._fmChildIndent;
					this._fmChildIndent -= 2;
				} else {
					if (index > 0 && this.children[index-1].elementType == "HTMLElement") {
						var prevChild = this.children[index-1];
						delta += prevChild._fmLine * lfSize + prevChild._fmIndent;
					}
					if (index+1 == this.children.length && this.children[index-1].elementType == "HTMLElement")
						this.children[index-1]._fmChildIndent -= 2;
				}
			}

			if (delta > 0 && this.wasParsed) {
				this.getHTMLFile().updatePositions(child.startOffset,0-delta);
			}
		}
		HTMLItem.prototype.removeChild.apply(this,arguments);
	},

	_textModify: function(newText, oldText) {
		var delta = newText.length-oldText.length;
		if (delta != 0 && this.wasParsed) {
			this.getHTMLFile().updatePositions( this.startOffset, delta);
		}
	}, 

	setScript: function(script) {
		this._textModify(script, this.script);
		this.script = script;

	},

	_previous: function() {
		var inx = dojo.indexOf(this.parent.children, this);
		if  (inx > 0)  {
			return this.parent.children[inx-1];
		}
	},

	_getIndent: function() {
		var prev = this._previous();
		if (prev) {
			if (prev.elementType == " HTMLText") {
				var txt = prev.value.split('\n');
				return txt[txt.length-1].length;
			} else {
				return prev._fmIndent;
			}
		} else {
			return this.parent._fmChildIndent;
		}
	},

	visit: function (visitor) {
		if (!visitor.visit(this)) {
			for (var i=0; i<this.attributes.length; i++) {
				this.attributes[i].visit(visitor);
			}
			for (var i=0; i<this.children.length; i++) {
				this.children[i].visit(visitor);
			}
		}
		if(visitor.endVisit) { visitor.endVisit(this); }
	},

	setText: function (text) {
		// clear cached values
		this.script = '';

		var options = {xmode:'outer'};
		var currentParent = this.parent;
		var result = require("davinci/html/HTMLParser").parse(text,this);

		this.errors = result.errors;
		// first child is actually the parsed element, so replace this with child
		dojo.mixin(this, this.children[0]);
		this.parent = currentParent;
		this.visit({
			visit:function(node){
				delete node.wasParsed;
			},
			rules :[]
		});
		this.onChange();
	}

});
});

