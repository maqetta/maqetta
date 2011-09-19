define("dojox/calc/toFrac", ["dojo"], function(dojo) {

(function(){

	var a = [];
	var sqrts = [2,3,5,6,7,10,11,13,14,15,17,19,21,22,23,26,29,
		30,31,33,34,35,37,38,39,41,42,43,46,47,51,53,55,57,58,59,
		61,62,65,66,67,69,70,71,73,74,77,78,79,82,83,85,86,87,89,91,93,94,95,97];
	var _fracHashInitialized = false;
	var i = -3;
	var d = 2;
	var epsilon = 1e-15 / 9;

function _fracHashInit(searchNumber){
	// summary
	//	make a fairly large hash table of some fractions, sqrts, etc
	var m, mt;
	while(i < sqrts.length){
		switch(i){
			case -3:
				m = 1;
				mt = '';
				break;
			case -2:
				m = Math.PI;
				mt = 'pi';
				break;
			case -1:
				m = Math.sqrt(Math.PI);
				mt = '\u221A(pi)';
				break;
			default:
				m = Math.sqrt(sqrts[i]);
				mt = "\u221A(" + sqrts[i] + ")";
		}
		while(d <= 100){
			for(n = 1; n < (m == 1 ? d : 100); n++){
				var r = m * n / d;
				var f = dojox.calc.approx(r);
				if(!(f in a)){
					// make sure that it is simplified so that toFrac(pi) doesn't get 2*pi/2
					if(n==d){
						n=1;
						d=1;
					}
					a[f] = {n:n, d:d, m:m, mt:mt};
					if(f == searchNumber){ searchNumber = undefined; } // found number, so return and finish hash in nbackground
				}
			}
			d++;
			if(searchNumber == undefined){
				setTimeout(function(){ _fracHashInit() }, 1);
				return;
			}
		}
		d = 2;
		i++;
	}
	_fracHashInitialized = true;
}

// this 1 is standard and the other is advanced and could be a
// separate dojo.require if the user wants the function (and slow init)
function isInt(n){
	return Math.floor(n) == n;
}

// make the hash
_fracHashInit();

// advanced _fracLookup
function _fracLookup(number){
	function retryWhenInitialized(){
		_fracHashInit(number);
		return _fracLookup(number);
	}
	number = Math.abs(number);
	var f = a[dojox.calc.approx(number)];
	if(!f && !_fracHashInitialized){
		return retryWhenInitialized();
	}
	if(!f){
		var i = Math.floor(number);
		if(i == 0) { return _fracHashInitialized ? null : retryWhenInitialized(); }
		var n = number % 1;
		if(n == 0){
			return { m: 1, mt: 1, n: number, d: 1 }
		}
		f = a[dojox.calc.approx(n)];
		if(!f || f.m != 1){
			var inv = dojox.calc.approx(1 / n);
			return isInt(inv) ? { m: 1, mt: 1, n: 1, d: inv } : (_fracHashInitialized ? null : retryWhenInitialized());
		}else{
			return { m: 1, mt: 1, n: (i * f.d + f.n), d: f.d };
		}
	}
	return f;
}

// add toFrac to the calculator
dojo.mixin(dojox.calc, {
	toFrac: function(number){// get a string fraction for a decimal with a set range of numbers, based on the hash
		var f = _fracLookup(number);
		return f ? ((number < 0 ? '-' : '') + (f.m == 1 ? '' : (f.n == 1 ? '' : (f.n + '*'))) + (f.m == 1 ? f.n : f.mt) + ((f.d == 1 ? '' : '/' + f.d))) : number;
		//return f ? ((number < 0 ? '-' : '') + (f.m == 1 ? '' : (f.n == 1 ? '' : (f.n + '*'))) + (f.m == 1 ? f.n : f.mt) + '/' + f.d) : number;
	},
	pow: function(base, exponent){// pow benefits from toFrac because it can overcome many of the limitations set before the standard Math.pow
	// summary:
	//	Computes base ^ exponent
	//	Wrapper to Math.pow(base, exponent) to handle (-27) ^ (1/3)

	if(base>0||isInt(exponent)){
		return Math.pow(base, exponent);
	}else{
		var f = _fracLookup(exponent);
		if(base >= 0){
			return (f && f.m == 1)
				? Math.pow(Math.pow(base, 1 / f.d), exponent < 0 ? -f.n : f.n) // 32 ^ (2/5) is much more accurate if done as (32 ^ (1/5)) ^ 2
				: Math.pow(base, exponent);
		}else{	// e.g. (1/3) root of -27 = -3, 1 / exponent must be an odd integer for a negative base
			return (f && f.d & 1) ? Math.pow(Math.pow(-Math.pow(-base, 1 / f.d), exponent < 0 ? -f.n : f.n), f.m) : NaN;
		}
	}
}
});
/*
function reduceError(number){
	var f = _fracLookup(number);
	if(!f){ f = _fracLookup(number); }
	return f ? ((number < 0 ? -1 : 1) * f.n * f.m / f.d) : number;
}
*/
})();


return dojox.calc.toFrac;
});
