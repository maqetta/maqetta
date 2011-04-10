dojo.provide("dijit._editor.plugins.EnterKeyHandling");

dojo.require("dojo.window");

dojo.declare("dijit._editor.plugins.EnterKeyHandling", dijit._editor._Plugin, {
	// summary:
	//		This plugin tries to make all browsers behave consistently w.r.t
	//		displaying paragraphs, specifically dealing with when the user presses
	//		the ENTER key.
	//
	//		It deals mainly with how the text appears on the screen (specifically
	//		address the double-spaced line problem on IE), but also has some code
	//		to normalize what attr('value') returns.
	//
	// description:
	//		This plugin has three modes:
	//
	//			* blockModeForEnter=BR
	//			* blockModeForEnter=DIV
	//			* blockModeForEnter=P
	//
	//		In blockModeForEnter=P, the ENTER key semantically means "start a new
	//		paragraph", whereas shift-ENTER means  "new line in the current paragraph".
	//		For example:
	//
	//		|	first paragraph <shift-ENTER>
	//		|	second line of first paragraph <ENTER>
	//		|
	//		|	second paragraph
	//
	//		In the other two modes, the ENTER key means to go to a new line in the
	//		current paragraph, and users [visually] create a new paragraph by pressing ENTER twice.
	//		For example, if the user enters text into an editor like this:
	//
	//		|		one <ENTER>
	//		|		two <ENTER>
	//		|		three <ENTER>
	//		|		<ENTER>
	//		|		four <ENTER>
	//		|		five <ENTER>
	//		|		six <ENTER>
	//
	//		It will appear on the screen as two paragraphs of three lines each.
	//
	//		blockNodeForEnter=BR
	//		--------------------
	//		On IE, typing the above keystrokes in the editor will internally produce DOM of:
	//
	//		|		<p>one</p>
	//		|		<p>two</p>
	//		|		<p>three</p>
	//		|		<p></p>
	//		|		<p>four</p>
	//		|		<p>five</p>
	//		|		<p>six</p>
	//
	//		However, blockNodeForEnter=BR makes the Editor on IE display like other browsers, by
	//		changing the CSS for the <p> node to not have top/bottom margins,
	//		thus eliminating the double-spaced appearance.
	//
	//		Also, attr('value') when used w/blockNodeForEnter=br on IE will return:
	//
	//		|	<p> one <br> two <br> three </p>
	//		|	<p> four <br> five <br> six </p>
	//
	//		This output normalization implemented by a filter when the
	//		editor writes out it's data, to convert consecutive <p>
	//		nodes into a single <p> node with internal <br> separators.
	//
	//		There's also a pre-filter to mirror the post-filter.
	//		It converts a single <p> with <br> line breaks
	//		into separate <p> nodes, and creates empty <p> nodes for spacing
	//		between paragraphs.
	//
	//		On FF typing the above keystrokes will internally generate:
	//
	//		|		one <br> two <br> three <br> <br> four <br> five <br> six <br>
	//
	//		And on Safari it will generate:
	//
	//		|		"one"
	//		|		<div>two</div>
	//		|		<div>three</div>
	//		|		<div><br></div>
	//		|		<div>four</div>
	//		|		<div>five</div>
	//		|		<div>six</div>
	//
	//		Thus, Safari and FF already look correct although semantically their content is a bit strange.
	//		On Safari or Firefox blockNodeForEnter=BR uses the builtin editor command "insertBrOnReturn",
	//		but that doesn't seem to do anything.
	//		Thus, attr('value') on safari/FF returns the browser-specific HTML listed above,
	//		rather than the semantically meaningful value that IE returns: <p>one<br>two</p> <p>three<br>four</p>.
	//
	//		(Note: originally based on http://bugs.dojotoolkit.org/ticket/2859)
	//
	//		blockNodeForEnter=P
	//		-------------------
	//		Plugin will monitor keystrokes and update the editor's content on the fly,
	//		so that the ENTER key will create a new <p> on FF and Safari (it already
	//		works that way by default on IE).
	//
	//		blockNodeForEnter=DIV
	//		---------------------
	//		Follows the same code path as blockNodeForEnter=P but inserting a <div>
	//		on ENTER key.  Although it produces strange internal DOM, like this:
	//
	//		|	<div>paragraph one</div>
	//		|	<div>paragraph one, line 2</div>
	//		|	<div>&nbsp;</div>
	//		|	<div>paragraph two</div>
	//
	//		it does provide a consistent look on all browsers, and the on-the-fly DOM updating
	//		can be useful for collaborative editing.

	// blockNodeForEnter: String
	//		This property decides the behavior of Enter key. It can be either P,
	//		DIV, BR, or empty (which means disable this feature). Anything else
	//		will trigger errors.
	//
	//		See class description for more details.
	blockNodeForEnter: 'BR',

	constructor: function(args){
		if(args){
			dojo.mixin(this,args);
		}
	},

	setEditor: function(editor){
		// Overrides _Plugin.setEditor().
		this.editor = editor;
		if(this.blockNodeForEnter == 'BR'){
			if(dojo.isIE){
				editor.contentDomPreFilters.push(dojo.hitch(this, "regularPsToSingleLinePs"));
				editor.contentDomPostFilters.push(dojo.hitch(this, "singleLinePsToRegularPs"));
				editor.onLoadDeferred.addCallback(dojo.hitch(this, "_fixNewLineBehaviorForIE"));
			}else{
				editor.onLoadDeferred.addCallback(dojo.hitch(this,function(d){
					try{
						this.editor.document.execCommand("insertBrOnReturn", false, true);
					}catch(e){}
					return d;
				}));
			}
		}else if(this.blockNodeForEnter){
			// add enter key handler
			// FIXME: need to port to the new event code!!
			dojo['require']('dijit._editor.range');
			var h = dojo.hitch(this,this.handleEnterKey);
			editor.addKeyHandler(13, 0, 0, h); //enter
			editor.addKeyHandler(13, 0, 1, h); //shift+enter
			this.connect(this.editor,'onKeyPressed','onKeyPressed');
		}
	},
	onKeyPressed: function(e){
		// summary:
		//		Handler for keypress events.
		// tags:
		//		private
		if(this._checkListLater){
			if(dojo.withGlobal(this.editor.window, 'isCollapsed', dijit)){
				var liparent=dojo.withGlobal(this.editor.window, 'getAncestorElement', dijit._editor.selection, ['LI']);
				if(!liparent){
					// circulate the undo detection code by calling RichText::execCommand directly
					dijit._editor.RichText.prototype.execCommand.call(this.editor, 'formatblock',this.blockNodeForEnter);
					// set the innerHTML of the new block node
					var block = dojo.withGlobal(this.editor.window, 'getAncestorElement', dijit._editor.selection, [this.blockNodeForEnter]);
					if(block){
						block.innerHTML=this.bogusHtmlContent;
						if(dojo.isIE){
							// move to the start by moving backwards one char
							var r = this.editor.document.selection.createRange();
							r.move('character',-1);
							r.select();
						}
					}else{
						console.error('onKeyPressed: Cannot find the new block node'); // FIXME
					}
				}else{
					if(dojo.isMoz){
						if(liparent.parentNode.parentNode.nodeName == 'LI'){
							liparent=liparent.parentNode.parentNode;
						}
					}
					var fc=liparent.firstChild;
					if(fc && fc.nodeType == 1 && (fc.nodeName == 'UL' || fc.nodeName == 'OL')){
						liparent.insertBefore(fc.ownerDocument.createTextNode('\xA0'),fc);
						var newrange = dijit.range.create(this.editor.window);
						newrange.setStart(liparent.firstChild,0);
						var selection = dijit.range.getSelection(this.editor.window, true);
						selection.removeAllRanges();
						selection.addRange(newrange);
					}
				}
			}
			this._checkListLater = false;
		}
		if(this._pressedEnterInBlock){
			// the new created is the original current P, so we have previousSibling below
			if(this._pressedEnterInBlock.previousSibling){
				this.removeTrailingBr(this._pressedEnterInBlock.previousSibling);
			}
			delete this._pressedEnterInBlock;
		}
	},

	// bogusHtmlContent: [private] String
	//		HTML to stick into a new empty block
	bogusHtmlContent: '&nbsp;',

	// blockNodes: [private] Regex
	//		Regex for testing if a given tag is a block level (display:block) tag
	blockNodes: /^(?:P|H1|H2|H3|H4|H5|H6|LI)$/,

	handleEnterKey: function(e){
		// summary:
		//		Handler for enter key events when blockModeForEnter is DIV or P.
		// description:
		//		Manually handle enter key event to make the behavior consistent across
		//		all supported browsers. See class description for details.
		// tags:
		//		private

		var selection, range, newrange, doc=this.editor.document,br;
		if(e.shiftKey){		// shift+enter always generates <br>
			var parent = dojo.withGlobal(this.editor.window, "getParentElement", dijit._editor.selection);
			var header = dijit.range.getAncestor(parent,this.blockNodes);
			if(header){
				if(!e.shiftKey && header.tagName == 'LI'){
					return true; // let browser handle
				}
				selection = dijit.range.getSelection(this.editor.window);
				range = selection.getRangeAt(0);
				if(!range.collapsed){
					range.deleteContents();
					selection = dijit.range.getSelection(this.editor.window);
					range = selection.getRangeAt(0);
				}
				if(dijit.range.atBeginningOfContainer(header, range.startContainer, range.startOffset)){
					if(e.shiftKey){
						br=doc.createElement('br');
						newrange = dijit.range.create(this.editor.window);
						header.insertBefore(br,header.firstChild);
						newrange.setStartBefore(br.nextSibling);
						selection.removeAllRanges();
						selection.addRange(newrange);
					}else{
						dojo.place(br, header, "before");
					}
				}else if(dijit.range.atEndOfContainer(header, range.startContainer, range.startOffset)){
					newrange = dijit.range.create(this.editor.window);
					br=doc.createElement('br');
					if(e.shiftKey){
						header.appendChild(br);
						header.appendChild(doc.createTextNode('\xA0'));
						newrange.setStart(header.lastChild,0);
					}else{
						dojo.place(br, header, "after");
						newrange.setStartAfter(header);
					}

					selection.removeAllRanges();
					selection.addRange(newrange);
				}else{
					return true; // let browser handle
				}
			}else{
				// don't change this: do not call this.execCommand, as that may have other logic in subclass
				dijit._editor.RichText.prototype.execCommand.call(this.editor, 'inserthtml', '<br>');
			}
			return false;
		}
		var _letBrowserHandle = true;

		// first remove selection
		selection = dijit.range.getSelection(this.editor.window);
		range = selection.getRangeAt(0);
		if(!range.collapsed){
			range.deleteContents();
			selection = dijit.range.getSelection(this.editor.window);
			range = selection.getRangeAt(0);
		}

		var block = dijit.range.getBlockAncestor(range.endContainer, null, this.editor.editNode);
		var blockNode = block.blockNode;

		// if this is under a LI or the parent of the blockNode is LI, just let browser to handle it
		if((this._checkListLater = (blockNode && (blockNode.nodeName == 'LI' || blockNode.parentNode.nodeName == 'LI')))){
			if(dojo.isMoz){
				// press enter in middle of P may leave a trailing <br/>, let's remove it later
				this._pressedEnterInBlock = blockNode;
			}
			// if this li only contains spaces, set the content to empty so the browser will outdent this item
			if(/^(\s|&nbsp;|\xA0|<span\b[^>]*\bclass=['"]Apple-style-span['"][^>]*>(\s|&nbsp;|\xA0)<\/span>)?(<br>)?$/.test(blockNode.innerHTML)){
				// empty LI node
				blockNode.innerHTML = '';
				if(dojo.isWebKit){ // WebKit tosses the range when innerHTML is reset
					newrange = dijit.range.create(this.editor.window);
					newrange.setStart(blockNode, 0);
					selection.removeAllRanges();
					selection.addRange(newrange);
				}
				this._checkListLater = false; // nothing to check since the browser handles outdent
			}
			return true;
		}

		// text node directly under body, let's wrap them in a node
		if(!block.blockNode || block.blockNode===this.editor.editNode){
			try{
				dijit._editor.RichText.prototype.execCommand.call(this.editor, 'formatblock',this.blockNodeForEnter);
			}catch(e2){ /*squelch FF3 exception bug when editor content is a single BR*/ }
			// get the newly created block node
			// FIXME
			block = {blockNode:dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, [this.blockNodeForEnter]),
					blockContainer: this.editor.editNode};
			if(block.blockNode){
				if(block.blockNode != this.editor.editNode &&
					(!(block.blockNode.textContent || block.blockNode.innerHTML).replace(/^\s+|\s+$/g, "").length)){
					this.removeTrailingBr(block.blockNode);
					return false;
				}
			}else{	// we shouldn't be here if formatblock worked
				block.blockNode = this.editor.editNode;
			}
			selection = dijit.range.getSelection(this.editor.window);
			range = selection.getRangeAt(0);
		}

		var newblock = doc.createElement(this.blockNodeForEnter);
		newblock.innerHTML=this.bogusHtmlContent;
		this.removeTrailingBr(block.blockNode);
		if(dijit.range.atEndOfContainer(block.blockNode, range.endContainer, range.endOffset)){
			if(block.blockNode === block.blockContainer){
				block.blockNode.appendChild(newblock);
			}else{
				dojo.place(newblock, block.blockNode, "after");
			}
			_letBrowserHandle = false;
			// lets move caret to the newly created block
			newrange = dijit.range.create(this.editor.window);
			newrange.setStart(newblock, 0);
			selection.removeAllRanges();
			selection.addRange(newrange);
			if(this.editor.height){
				dojo.window.scrollIntoView(newblock);
			}
		}else if(dijit.range.atBeginningOfContainer(block.blockNode,
				range.startContainer, range.startOffset)){
			dojo.place(newblock, block.blockNode, block.blockNode === block.blockContainer ? "first" : "before");
			if(newblock.nextSibling && this.editor.height){
				// position input caret - mostly WebKit needs this
				newrange = dijit.range.create(this.editor.window);
				newrange.setStart(newblock.nextSibling, 0);
				selection.removeAllRanges();
				selection.addRange(newrange);
				// browser does not scroll the caret position into view, do it manually
				dojo.window.scrollIntoView(newblock.nextSibling);
			}
			_letBrowserHandle = false;
		}else{ //press enter in the middle of P/DIV/Whatever/
			if(block.blockNode === block.blockContainer){
				block.blockNode.appendChild(newblock);
			}else{
				dojo.place(newblock, block.blockNode, "after");
			}
			_letBrowserHandle = false;

			// Clone any block level styles.
			if(block.blockNode.style){
				if(newblock.style){
					if(block.blockNode.style.cssText){
						newblock.style.cssText = block.blockNode.style.cssText;
					}
				}
			}
			
			// Okay, we probably have to split.
			var rs = range.startContainer;
			if(rs && rs.nodeType == 3){
				// Text node, we have to split it.
				var nodeToMove, tNode;
				var txt = rs.nodeValue;
				var startNode = doc.createTextNode(txt.substring(0, range.startOffset));
				var endNode = doc.createTextNode(txt.substring(range.startOffset, txt.length));

				// Place the split, then remove original nodes.
				dojo.place(startNode, rs, "before");
				dojo.place(endNode, rs, "after");
				dojo.destroy(rs);

				// Okay, we split the text.  Now we need to see if we're
				// parented to the block element we're splitting and if
				// not, we have to split all the way up.  Ugh.
				var parentC = startNode.parentNode;
				while(parentC !== block.blockNode){
					var tg = parentC.tagName;
					var newTg = doc.createElement(tg);
					// Clone over any 'style' data. 
					if(parentC.style){
						if(newTg.style){
							if(parentC.style.cssText){
								newTg.style.cssText = parentC.style.cssText;
							}
						}
					}

					nodeToMove = endNode;
					while(nodeToMove){
						tNode = nodeToMove.nextSibling;
						newTg.appendChild(nodeToMove);
						nodeToMove = tNode;
					}
					dojo.place(newTg, parentC, "after");
					startNode = parentC;
					endNode = newTg;
					parentC = parentC.parentNode;
				}

				// Lastly, move the split out tags to the new block.
				// as they should now be split properly.
				nodeToMove = endNode;
				if(nodeToMove.nodeType == 1 || (nodeToMove.nodeType == 3 && nodeToMove.nodeValue)){
					// Non-blank text and non-text nodes need to clear out that blank space
					// before moving the contents.
					newblock.innerHTML = "";
				}
				while(nodeToMove){
					tNode = nodeToMove.nextSibling;
					newblock.appendChild(nodeToMove);
					nodeToMove = tNode;
				}
			}
			
			//lets move caret to the newly created block
			newrange = dijit.range.create(this.editor.window);
			newrange.setStart(newblock, 0);
			selection.removeAllRanges();
			selection.addRange(newrange);
			if(this.editor.height){
				dijit.scrollIntoView(newblock);
			}
			if(dojo.isMoz){
				// press enter in middle of P may leave a trailing <br/>, let's remove it later
				this._pressedEnterInBlock = block.blockNode;
			}
		}
		return _letBrowserHandle;
	},

	removeTrailingBr: function(container){
		// summary:
		//		If last child of container is a <br>, then remove it.
		// tags:
		//		private
		var para = /P|DIV|LI/i.test(container.tagName) ?
			container : dijit._editor.selection.getParentOfType(container,['P','DIV','LI']);

		if(!para){ return; }
		if(para.lastChild){
			if((para.childNodes.length > 1 && para.lastChild.nodeType == 3 && /^[\s\xAD]*$/.test(para.lastChild.nodeValue)) ||
				para.lastChild.tagName=='BR'){

				dojo.destroy(para.lastChild);
			}
		}
		if(!para.childNodes.length){
			para.innerHTML=this.bogusHtmlContent;
		}
	},
	_fixNewLineBehaviorForIE: function(d){
		// summary:
		//		Insert CSS so <p> nodes don't have spacing around them,
		//		thus hiding the fact that ENTER key on IE is creating new
		//		paragraphs

		// cannot use !important since there may be custom user styling;
		var doc = this.editor.document;
		if(doc.__INSERTED_EDITIOR_NEWLINE_CSS === undefined){
			var style = dojo.create("style", {type: "text/css"}, doc.getElementsByTagName("head")[0]);
			style.styleSheet.cssText = "p{margin:0;}"; // cannot use !important since there may be custom user styling;
			this.editor.document.__INSERTED_EDITIOR_NEWLINE_CSS = true;
		}
		return d;
	},
	regularPsToSingleLinePs: function(element, noWhiteSpaceInEmptyP){
		// summary:
		//		Converts a <p> node containing <br>'s into multiple <p> nodes.
		// description:
		//		See singleLinePsToRegularPs().   This method does the
		//		opposite thing, and is used as a pre-filter when loading the
		//		editor, to mirror the effects of the post-filter at end of edit.
		// tags:
		//		private
		function wrapLinesInPs(el){
		  // move "lines" of top-level text nodes into ps
			function wrapNodes(nodes){
				// nodes are assumed to all be siblings
				var newP = nodes[0].ownerDocument.createElement('p'); // FIXME: not very idiomatic
				nodes[0].parentNode.insertBefore(newP, nodes[0]);
				dojo.forEach(nodes, function(node){
					newP.appendChild(node);
				});
			}

			var currentNodeIndex = 0;
			var nodesInLine = [];
			var currentNode;
			while(currentNodeIndex < el.childNodes.length){
				currentNode = el.childNodes[currentNodeIndex];
				if( currentNode.nodeType==3 ||	// text node
					(currentNode.nodeType==1 && currentNode.nodeName!='BR' && dojo.style(currentNode, "display")!="block")
				){
					nodesInLine.push(currentNode);
				}else{
					// hit line delimiter; process nodesInLine if there are any
					var nextCurrentNode = currentNode.nextSibling;
					if(nodesInLine.length){
						wrapNodes(nodesInLine);
						currentNodeIndex = (currentNodeIndex+1)-nodesInLine.length;
						if(currentNode.nodeName=="BR"){
							dojo.destroy(currentNode);
						}
					}
					nodesInLine = [];
				}
				currentNodeIndex++;
			}
			if(nodesInLine.length){ wrapNodes(nodesInLine); }
		}

		function splitP(el){
			// split a paragraph into seperate paragraphs at BRs
			var currentNode = null;
			var trailingNodes = [];
			var lastNodeIndex = el.childNodes.length-1;
			for(var i=lastNodeIndex; i>=0; i--){
				currentNode = el.childNodes[i];
				if(currentNode.nodeName=="BR"){
					var newP = currentNode.ownerDocument.createElement('p');
					dojo.place(newP, el, "after");
					if(trailingNodes.length==0 && i != lastNodeIndex){
						newP.innerHTML = "&nbsp;"
					}
					dojo.forEach(trailingNodes, function(node){
						newP.appendChild(node);
					});
					dojo.destroy(currentNode);
					trailingNodes = [];
				}else{
					trailingNodes.unshift(currentNode);
				}
			}
		}

		var pList = [];
		var ps = element.getElementsByTagName('p');
		dojo.forEach(ps, function(p){ pList.push(p); });
		dojo.forEach(pList, function(p){
			var prevSib = p.previousSibling;
			if(	(prevSib) && (prevSib.nodeType == 1) && 
				(prevSib.nodeName == 'P' || dojo.style(prevSib, 'display') != 'block')
			){
				var newP = p.parentNode.insertBefore(this.document.createElement('p'), p);
				// this is essential to prevent IE from losing the P.
				// if it's going to be innerHTML'd later we need
				// to add the &nbsp; to _really_ force the issue
				newP.innerHTML = noWhiteSpaceInEmptyP ? "" : "&nbsp;";
			}
			splitP(p);
		},this.editor);
		wrapLinesInPs(element);
		return element;
	},

	singleLinePsToRegularPs: function(element){
		// summary:
		//		Called as post-filter.
		//		Apparently collapses adjacent <p> nodes into a single <p>
		//		nodes with <br> separating each line.
		//
		// example:
		//		Given this input:
		//	|	<p>line 1</p>
		//	|	<p>line 2</p>
		//	|	<ol>
		//	|		<li>item 1
		//	|		<li>item 2
		//	|	</ol>
		//	|	<p>line 3</p>
		//	|	<p>line 4</p>
		//
		//		Will convert to:
		//	|	<p>line 1<br>line 2</p>
		//	|	<ol>
		//	|		<li>item 1
		//	|		<li>item 2
		//	|	</ol>
		//	|	<p>line 3<br>line 4</p>
		//
		//		Not sure why this situation would even come up after the pre-filter and
		//		the enter-key-handling code.
		//
		// tags:
		//		private

		function getParagraphParents(node){
			// summary:
			//		Used to get list of all nodes that contain paragraphs.
			//		Seems like that would just be the very top node itself, but apparently not.
			var ps = node.getElementsByTagName('p');
			var parents = [];
			for(var i=0; i<ps.length; i++){
				var p = ps[i];
				var knownParent = false;
				for(var k=0; k < parents.length; k++){
					if(parents[k] === p.parentNode){
						knownParent = true;
						break;
					}
				}
				if(!knownParent){
					parents.push(p.parentNode);
				}
			}
			return parents;
		}

		function isParagraphDelimiter(node){
			return (!node.childNodes.length || node.innerHTML=="&nbsp;");
		}

		var paragraphContainers = getParagraphParents(element);
		for(var i=0; i<paragraphContainers.length; i++){
			var container = paragraphContainers[i];
			var firstPInBlock = null;
			var node = container.firstChild;
			var deleteNode = null;
			while(node){
				if(node.nodeType != 1 || node.tagName != 'P' ||
						(node.getAttributeNode('style') || {/*no style*/}).specified){
					firstPInBlock = null;
				}else if(isParagraphDelimiter(node)){
					deleteNode = node;
					firstPInBlock = null;
				}else{
					if(firstPInBlock == null){
						firstPInBlock = node;
					}else{
						if( (!firstPInBlock.lastChild || firstPInBlock.lastChild.nodeName != 'BR') &&
							(node.firstChild) &&
							(node.firstChild.nodeName != 'BR')
						){
							firstPInBlock.appendChild(this.editor.document.createElement('br'));
						}
						while(node.firstChild){
							firstPInBlock.appendChild(node.firstChild);
						}
						deleteNode = node;
					}
				}
				node = node.nextSibling;
				if(deleteNode){
					dojo.destroy(deleteNode);
					deleteNode = null;
				}
			}
		}
		return element;
	}
});
