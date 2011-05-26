define(["dojo/_base/declare", "dojo/listen", "./transition"], function(declare,listen, transition){

	return declare("dojox.mobile.TransitionEvent", null, {
		constructor: function(target, transitionOptions, triggerEvent){
			this.transitionOptions=transitionOptions;	
			this.target = target;
			this.triggerEvent=triggerEvent||null;	
		},

		dispatch: function(){
			var opts = {bubbles:true, cancelable:true, detail: this.transitionOptions, triggerEvent: this.triggerEvent};	
			//console.log("Target: ", this.target, " opts: ", opts);

			var evt = listen.emit(this.target,"startTransition", opts);
			//console.log('evt: ', evt);
			if (evt){
				dojo.when(transition.call(this, evt), dojo.hitch(this, function(results){
					this.endTransition(results);
				}));
			}
		},

		endTransition: function(results){
			listen.emit(this.target, "endTransition" , {detail: results.transitionOptions});
		}
	});
});
