define(["dijit/_WidgetBase", "./_DataBindingMixin", "dijit/form/ValidationTextBox", "dijit/form/NumberTextBox"], function(wb, dbm, vtb, ntb){

	dojo.getObject("mvc", true, dojox);

	(function(){
		//Apply the data binding mixin to all dijits, see mixin class description for details
		dojo.extend(dijit._WidgetBase, new dojox.mvc._DataBindingMixin());

		// monkey patch dijit._WidgetBase.startup to get data binds set up
		var oldWidgetBaseStartup = dijit._WidgetBase.prototype.startup;
		dijit._WidgetBase.prototype.startup = function(){
			this._dbstartup();
			oldWidgetBaseStartup.apply(this);
		};

		// monkey patch dijit._WidgetBase.destroy to remove watches setup in _DataBindingMixin
		var oldWidgetBaseDestroy = dijit._WidgetBase.prototype.destroy;
		dijit._WidgetBase.prototype.destroy = function(/*Boolean*/ preserveDom){
			if(this._modelWatchHandles){
				dojo.forEach(this._modelWatchHandles, function(h){ h.unwatch(); });
			}
			if(this._viewWatchHandles){
				dojo.forEach(this._viewWatchHandles, function(h){ h.unwatch(); });
			}
			oldWidgetBaseDestroy.apply(this, [preserveDom]);		
		};

		// monkey patch dijit.form.ValidationTextBox.isValid to check this.inherited for isValid
		var oldValidationTextBoxIsValid = dijit.form.ValidationTextBox.prototype.isValid;
		dijit.form.ValidationTextBox.prototype.isValid = function(/*Boolean*/ isFocused){
			return (this.inherited("isValid", arguments) !== false && oldValidationTextBoxIsValid.apply(this, [isFocused]));
		};

		// monkey patch dijit.form.NumberTextBox.isValid to check this.inherited for isValid
		var oldNumberTextBoxIsValid = dijit.form.NumberTextBox.prototype.isValid;
		dijit.form.NumberTextBox.prototype.isValid = function(/*Boolean*/ isFocused){
			return (this.inherited("isValid", arguments) !== false && oldNumberTextBoxIsValid.apply(this, [isFocused]));
		};
	})();

	return dojox.mvc._patches;
});
