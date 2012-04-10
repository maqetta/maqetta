/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global define */
/*jslint maxerr:150 browser:true devel:true */

define("orion/editor/contentAssist", ['i18n!orion/editor/nls/messages', 'orion/textview/keyBinding', 'orion/textview/eventTarget'], function(messages, mKeyBinding, mEventTarget) {
	var Promise = (function() {
		function Promise() {
		}
		Promise.prototype.then = function(callback) {
			this.callback = callback;
			if (this.result) {
				var promise = this;
				setTimeout(function() { promise.callback(promise.result); }, 0);
			}
		};
		Promise.prototype.done = function(result) {
			this.result = result;
			if (this.callback) {
				this.callback(this.result);
			}
		};
		return Promise;
	}());

	/**
	 * @name orion.editor.ContentAssistProvider
	 * @class Interface defining a provider of content assist proposals.
	 */
	/**
	 * @methodOf orion.editor.ContentAssistProvider.prototype
	 * @name computeProposals
	 * @param {String} buffer The buffer being edited.
	 * @param {Number} offset The position in the buffer at which content assist is being requested.
	 * @param {orion.editor.ContentAssistProvider.Context} context
	 * @returns {Object[]} This provider's proposals for the given buffer and offset.
	 */
	/**
	 * @name orion.editor.ContentAssistProvider.Context
	 * @class
	 * @property {String} line The text of the line on which content assist is being requested.
	 * @property {String} prefix Any non-whitespace, non-symbol characters preceding the offset.
	 * @property {orion.textview.Selection} selection The current selection.
	 */

	/**
	 * @name orion.editor.ContentAssist
	 * @class Provides content assist for a TextView.
	 * @description Creates a <code>ContentAssist</code> for a TextView. A ContentAssist consults a set of 
	 * {@link orion.editor.ContentAssistProvider}s to obtain proposals for text that may be inserted into a
	 * TextView at a given offset.<p>
	 * A ContentAssist is generally activated by its TextView action, at which point it computes the set of 
	 * proposals available. It will re-compute the proposals in response to subsequent changes on the TextView 
	 * (for example, user typing) for as long as the ContentAssist is active. A proposal may be applied by calling 
	 * {@link #apply}, after which the ContentAssist becomes deactivated. An active ContentAssist may be deactivated
	 * by calling {@link #deactivate}.<p>
	 * A ContentAssist dispatches events when it becomes activated or deactivated, and when proposals have been computed.
	 * @param {orion.textview.TextView} textView The TextView to provide content assist for.
	 * @borrows orion.textview.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.textview.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.textview.EventTarget#dispatchEvent as #dispatchEvent
	 */
	/**
	 * Dispatched when a ContentAssist is about to be activated.
	 * @name orion.editor.ContentAssist#ActivatingEvent
	 * @event
	 */
	/**
	 * Dispatched when a ContentAssist is about to be deactivated.
	 * @name orion.editor.ContentAssist#DeactivatingEvent
	 * @event
	 */
	/**
	 * Dispatched when a ContentAssist has applied a proposal. <p>This event's <code>data</code> field gives information
	 * about the proposal that was applied.
	 * @name orion.editor.ContentAssist#ProposalAppliedEvent
	 * @event
	 */
	/**
	 * Dispatched whenever a ContentAssist has obtained proposals from its providers. <p>This event's
	 * <code>data</code> field gives information about the proposals.
	 * @name orion.editor.ContentAssist#ProposalsComputedEvent
	 * @event
	 */
	// INACTIVE --Ctrl+Space--> ACTIVE --ModelChanging--> FILTERING
	var State = {
		INACTIVE: 1,
		ACTIVE: 2,
		FILTERING: 3
	};
	function ContentAssist(textView) {
		this.textView = textView;
		this.state = State.INACTIVE;
		this.providers = [];
		var self = this;
		this.contentAssistListener = {
			onModelChanging: function(event) {
				if (self.isDeactivatingChange(event)) {
					self.setState(State.INACTIVE);
				} else {
					if (self.state === State.ACTIVE) {
						self.setState(State.FILTERING);
					}
				}
			},
			onScroll: function(event) {
				self.setState(State.INACTIVE);
			},
			onSelection: function(event) {
				var state = self.state;
				if (state === State.ACTIVE || state === State.FILTERING) {
					self.computeProposals();
					self.setState(State.FILTERING);
				}
			}
		};
		var isMac = navigator.platform.indexOf("Mac") !== -1;
		textView.setKeyBinding(isMac ? new mKeyBinding.KeyBinding(' ', false, false, false, true) : new mKeyBinding.KeyBinding(' ', true), messages.contentAssist);
		textView.setAction(messages.contentAssist, function() {
			self.activate();
			return true;
		});
	}
	ContentAssist.prototype = /** @lends orion.editor.ContentAssist.prototype */ {
		/**
		 * Applies the given proposal to the TextView.
		 * @param {Object} [proposal]
		 * @returns {Boolean} <code>true</code> if the proposal was applied; <code>false</code> if no proposal was provided.
		 */
		apply: function(proposal) {
			if (!proposal) {
				return false;
			}
			var offset = this.textView.getCaretOffset();
			var data = {
				proposal: proposal,
				start: offset,
				end: offset
			};
			this.setState(State.INACTIVE);
			var proposalText = proposal.proposal || proposal;
			this.textView.setText(proposalText, offset, offset);
			this.dispatchEvent({type: "ProposalApplied", data: data});
			return true;
		},
		activate: function() {
			if (this.state === State.INACTIVE) {
				this.setState(State.ACTIVE);
			}
		},
		deactivate: function() {
			this.setState(State.INACTIVE);
		},
		/** @returns {orion.textview.TextView} */
		getTextView: function() {
			return this.textView;
		},
		/** @returns {Boolean} */
		isActive: function() {
			return this.state === State.ACTIVE || this.state === State.FILTERING;
		},
		/** @returns {Boolean} <code>true</code> if the event describes a change that should deactivate content assist. */
		isDeactivatingChange: function(/**orion.textview.ModelChangingEvent*/ event) {
			var deletion = event.removedCharCount > 0 && event.addedCharCount === 0,
			    view = this.textView,
			    overWhitespace = (event.start+1 <= view.getModel().getCharCount()) && /^\s*$/.test(view.getText(event.start, event.start+1));
			return event.removedLineCount > 0 || (deletion && overWhitespace);
		},
		/** @private */
		setState: function(state) {
			var eventType;
			if (state === State.ACTIVE) {
				eventType = "Activating";
			} else if (state === State.INACTIVE) {
				eventType = "Deactivating";
			}
			if (eventType) {
				this.dispatchEvent({type: eventType});
			}
			this.state = state;
			this.onStateChange(state);
		},
		/** @private */
		onStateChange: function(state) {
			if (state === State.INACTIVE) {
				if (this.listenerAdded) {
					this.textView.removeEventListener("ModelChanging", this.contentAssistListener.onModelChanging);
					this.textView.removeEventListener("Scroll", this.contentAssistListener.onScroll);
					this.textView.removeEventListener("Selection", this.contentAssistListener.onSelection);
					this.listenerAdded = false;
				}
			} else if (state === State.ACTIVE) {
				if (!this.listenerAdded) {
					this.textView.addEventListener("ModelChanging", this.contentAssistListener.onModelChanging);
					this.textView.addEventListener("Scroll", this.contentAssistListener.onScroll);
					this.textView.addEventListener("Selection", this.contentAssistListener.onSelection);
					this.listenerAdded = true;
				}
				this.computeProposals();
			}
		},
		/**
		 * Computes the proposals at the TextView's current caret offset.
		 */
		computeProposals: function() {
			var self = this;
			var offset = this.textView.getCaretOffset();
			this._computeProposals(offset).then(function(proposals) {
				self.dispatchEvent({type: "ProposalsComputed", data: {proposals: proposals}});
			});
		},
		/** @private */
		getPrefixStart: function(end) {
			var index = end;
			while (index > 0 && /[A-Za-z0-9_]/.test(this.textView.getText(index - 1, index))) {
				index--;
			}
			return index;
		},
		/**
		 * @private
		 * Retrieves the proposals at the given offset.
		 * @param {Number} offset The caret offset.
		 * @returns {Promise} A promise that will provide the proposals.
		 */
		_computeProposals: function(offset) {
			var proposals = [],
			    numComplete = 0,
			    promise = new Promise(),
			    providers = this.providers;
			function collectProposals(result) {
				if (result) {
					proposals = proposals.concat(result);
				}
				if (++numComplete === providers.length) {
					promise.done(proposals);
				}
			}
			function errback() {
				if (++numComplete === providers.length) {
					promise.done(proposals);
				}
			}
			var textView = this.textView, textModel = textView.getModel();
			var buffer = textView.getText();
			var context = {
				line: textModel.getLine(textModel.getLineAtOffset(offset)),
				prefix: textView.getText(this.getPrefixStart(offset), offset),
				selection: textView.getSelection()
			};
			for (var i=0; i < providers.length; i++) {
				var provider = providers[i];
				//prefer computeProposals but support getProposals for backwards compatibility
				var proposalsFunc = provider.getProposals;
				if (typeof provider.computeProposals === "function") {
					proposalsFunc = provider.computeProposals;
				}
				var proposalsPromise = proposalsFunc.apply(provider, [buffer, offset, context]);
				if (proposalsPromise && proposalsPromise.then) {
					proposalsPromise.then(collectProposals, errback);
				} else {
					collectProposals(proposalsPromise);
				}
			}
			return promise;
		},
		/**
		 * Sets the content assist providers that this ContentAssist will consult to obtain proposals.
		 * @param {orion.editor.ContentAssistProvider[]} providers The providers.
		 */
		setProviders: function(providers) {
			this.providers = providers.slice(0);
		}
	};
	mEventTarget.EventTarget.addMixin(ContentAssist.prototype);

	/**
	 * @name orion.editor.ContentAssistMode
	 * @class Editor mode for interacting with content assist proposals.
	 * @description Creates a ContentAssistMode. A ContentAssistMode is a key mode for {@link orion.editor.Editor}
	 * that provides interaction with content assist proposals retrieved from an {@link orion.editor.ContentAssist}. 
	 * Interaction is performed via the {@link #lineUp}, {@link #lineDown}, and {@link #enter} actions. An 
	 * {@link orion.editor.ContentAssistWidget} may optionally be provided to display which proposal is currently selected.
	 * @param {orion.editor.ContentAssist} contentAssist
	 * @param {orion.editor.ContentAssistWidget} [ContentAssistWidget]
	 */
	function ContentAssistMode(contentAssist, ContentAssistWidget) {
		this.contentAssist = contentAssist;
		this.widget = ContentAssistWidget;
		this.proposals = [];
		var self = this;
		this.contentAssist.addEventListener("ProposalsComputed", function(event) {
			self.proposals = event.data.proposals;
			self.selectedIndex = self.proposals.length ? 0 : -1;
		});
	}
	ContentAssistMode.prototype = /** @lends orion.editor.ContentAssistMode.prototype */ {
		cancel: function() {
			this.getContentAssist().deactivate();
		},
		/** @private */
		getContentAssist: function() {
			return this.contentAssist;
		},
		isActive: function() {
			return this.getContentAssist().isActive();
		},
		lineUp: function() {
			this.selectedIndex = (this.selectedIndex === 0) ? this.proposals.length - 1 : this.selectedIndex - 1;
			if (this.widget) {
				this.widget.setSelectedIndex(this.selectedIndex);
			}
			return true;
		},
		lineDown: function() {
			this.selectedIndex = (this.selectedIndex === this.proposals.length - 1) ? 0 : this.selectedIndex + 1;
			if (this.widget) {
				this.widget.setSelectedIndex(this.selectedIndex);
			}
			return true;
		},
		enter: function() {
			var proposal = this.proposals[this.selectedIndex] || null;
			return this.contentAssist.apply(proposal);
		},
		tab: function() {
			if (this.widget) {
				this.widget.createAccessible(this);
				this.widget.parentNode.focus();
				return true;
			} else {
				return false;
			}
		}
	};

	/**
	 * @name orion.editor.ContentAssistWidget
	 * @class Displays proposals from a {@link orion.editor.ContentAssist}.
	 * @description Creates a ContentAssistWidget that will display proposals from the given {@link orion.editor.ContentAssist}
	 * in the given <code>parentNode</code>. Clicking a proposal will cause the ContentAssist to apply that proposal.
	 * @param {orion.editor.ContentAssist} contentAssist
	 * @param {String|DomNode} parentNode The ID or DOM node to use as the parent for displaying proposals.
	 */
	function ContentAssistWidget(contentAssist, parentNode) {
		this.contentAssist = contentAssist;
		this.parentNode = typeof parentNode === "string" ? document.getElementById(parentNode) : parentNode;
		this.textView = this.contentAssist.getTextView();
		this.textViewListenerAdded = false;
		var self = this;
		this.textViewListener = {
			onMouseDown: function(event) {
				if (event.event.target.parentElement !== self.parentNode) {
					self.contentAssist.deactivate();
				}
				// ignore the event if this is a click inside of the parentNode
				// the click is handled by the onClick() function
			}
		};
		this.contentAssist.addEventListener("ProposalsComputed", function(event) {
			self.setProposals(event.data.proposals);
			self.show();
			if (!self.textViewListenerAdded) {
				self.textView.addEventListener("MouseDown", self.textViewListener.onMouseDown);
				self.textViewListenerAdded = true;
			}
		});
		this.contentAssist.addEventListener("Deactivating", function(event) {
			self.setProposals([]);
			self.hide();
			if (self.textViewListenerAdded) {
				self.textView.removeEventListener("MouseDown", self.textViewListener.onMouseDown);
				self.textViewListenerAdded = false;
			}
			self.textViewListenerAdded = false;
		});
	}
	ContentAssistWidget.prototype = /** @lends orion.editor.ContentAssistWidget.prototype */ {
		/** @private */
		onClick: function(e) {
			this.contentAssist.apply(this.getProposal(e.target));
			this.textView.focus();
		},
		/** @private */
		createDiv: function(proposal, isSelected, parent, itemIndex) {
			var div = document.createElement("div");
			div.id = "contentoption" + itemIndex;
			div.setAttribute("role", "option");
			if (isSelected) {
				div.className = "selected";
				this.parentNode.setAttribute("aria-activedescendant", div.id);
			}
			var textNode = document.createTextNode(proposal);
			div.appendChild(textNode, div);
			parent.appendChild(div);
		},
		/** @private */
		createAccessible: function(mode) {
			if(!this._isAccessible) {
				this.parentNode.addEventListener("keydown", function(evt) {
					evt.preventDefault();
					if(evt.keyCode === 27) {return mode.cancel(); }
					else if(evt.keyCode === 38) { return mode.lineUp(); }
					else if(evt.keyCode === 40) { return mode.lineDown(); }
					else if(evt.keyCode === 13) { return mode.enter(); }
					return false;
				});
			}
			this._isAccessible = true;
		},
		/** @private */
		getDisplayString: function(proposal) {
			//for simple string content assist, the display string is just the proposal
			if (typeof proposal === "string") {
				return proposal;
			}
			//return the description if applicable
			if (proposal.description && typeof proposal.description === "string") {
				return proposal.description;
			}
			//by default return the straight proposal text
			return proposal.proposal;
		},
		/**
		 * @private
		 * @returns {Object} The proposal represented by the given node.
		 */
		getProposal: function(/**DOMNode*/ node) {
			var nodeIndex = 0;
			for (var child = this.parentNode.firstChild; child !== null; child = child.nextSibling) {
				if (child === node) {
					return this.proposals[nodeIndex] || null;
				}
				nodeIndex++;
			}
			return null;
		},
		/** Sets the index of the currently selected proposal. */
		setSelectedIndex: function(/**Number*/ index) {
			this.selectedIndex = index;
			this.selectNode(this.parentNode.childNodes[this.selectedIndex]);
		},
		/** @private */
		selectNode: function(/**DOMNode*/ node) {
			var nodes = this.parentNode.childNodes;
			for (var i=0; i < nodes.length; i++) {
				var child = nodes[i];
				if (child.className === "selected") {
					child.className = "";
				}
				if (child === node) {
					child.className = "selected";
					this.parentNode.setAttribute("aria-activedescendant", child.id);
					child.focus();
					if (child.offsetTop < this.parentNode.scrollTop) {
						child.scrollIntoView(true);
					} else if ((child.offsetTop + child.offsetHeight) > (this.parentNode.scrollTop + this.parentNode.clientHeight)) {
						child.scrollIntoView(false);
					}
				}
			}
		},
		setProposals: function(/**Object[]*/ proposals) {
			this.proposals = proposals;
		},
		show: function() {
			if (this.proposals.length === 0) {
				this.hide();
				return;
			}
			var caretLocation = this.textView.getLocationAtOffset(this.textView.getCaretOffset());
			caretLocation.y += this.textView.getLineHeight();
			this.parentNode.innerHTML = "";
			for (var i = 0; i < this.proposals.length; i++) {
				this.createDiv(this.getDisplayString(this.proposals[i]), i===0, this.parentNode, i);
			}
			this.textView.convert(caretLocation, "document", "page");
			this.parentNode.style.position = "absolute";
			this.parentNode.style.left = caretLocation.x + "px";
			this.parentNode.style.top = caretLocation.y + "px";
			this.parentNode.style.display = "block";
			this.parentNode.scrollTop = 0;

			// Make sure that the panel is never outside the viewport
			var viewportWidth = document.documentElement.clientWidth,
			    viewportHeight =  document.documentElement.clientHeight;
			if (caretLocation.y + this.parentNode.offsetHeight > viewportHeight) {
				this.parentNode.style.top = (caretLocation.y - this.parentNode.offsetHeight - this.textView.getLineHeight()) + "px";
			}
			if (caretLocation.x + this.parentNode.offsetWidth > viewportWidth) {
				this.parentNode.style.left = (viewportWidth - this.parentNode.offsetWidth) + "px";
			}
			this.parentNode.onclick = this.onClick.bind(this);
		},
		hide: function() {
			if(document.activeElement === this.parentNode) {
				this.textView.focus();
			}
			this.parentNode.style.display = "none";
			this.parentNode.onclick = null;
		}
	};
	return {
		ContentAssist: ContentAssist,
		ContentAssistMode: ContentAssistMode,
		ContentAssistWidget: ContentAssistWidget
	};
});
