define(["dojo/_base/kernel","dojo/_base/lang", "dojo/_base/declare", "dojo/on"],function(dojo,dlang,declare,listen){
	return dojo.declare(null, {
		postCreate: function(params,node){
			this.inherited(arguments);
			var hash=window.location.hash;
			this._startView= ((hash && hash.charAt(0)=="#")?hash.substr(1):hash)||this.defaultView;

			listen(this.domNode, "startTransition", dojo.hitch(this, "onStartTransition"));
			listen(window,"popstate", dojo.hitch(this, "onPopState"));
		},
		startup: function(){
			this.inherited(arguments);
		},

		onStartTransition: function(evt){
			console.log("onStartTransition", evt.detail.href, history.state);
			if (evt.preventDefault){
				evt.preventDefault();
			}

			dojo.when(this.transition(evt.detail.target, dojo.mixin({reverse: false},evt.detail)), dojo.hitch(this, function(){
				history.pushState(evt.detail,evt.detail.href, evt.detail.url);
			}))
	
		},

		/*
		onHashChange: function(evt){
			var target = window.location.hash.substr(1);;
			var evt = {target: window.location.hash, url: "#" + target,title:null};
			//this.onStartTransition(evt);
		},
		*/

		onPopState: function(evt){
			console.log("evt: ",evt, evt.state);
			var state = evt.state;
			if (!state){

				if(!this._startView && window.location.hash){
					state={
						target: (location.hash && location.hash.charAt(0)=="#")?location.hash.substr(1):location.hash,
						url: location.hash
					}		
				}else{
					state={};	
				}
			}
			console.log("Check state: ", state);	
			var target = state.target || this._startView || this.defaultView;

			if (this._startView){
				this._startView=null;
			}
			var title = state.title||null;
			var href = state.url || null;

			console.log('onPopState: ',target,title,href,  arguments);
			if (evt._sim) {
				history.replaceState(state, title, href );
			}

			/*
			dojo.when(this.transition(window.history.state, {rev: true}), dojo.hitch(this, function(){

				console.log('done transition from onPopState');
			}))
			*/
			var currentState = history.state;
			this.transition(target, dojo.mixin({reverse: true},state));	
		}
	});	
});
