define(function(){
	return {
		computeTotalAngle: function(start, end, orientation){
			if(start == end){
				return 360;
			}else{
				return this.computeAngle(start, end, orientation, 360);
			}
		},
		
		modAngle: function(angle, base){
			if(base == undefined){
				base = 6.28318530718;
			}
			if(angle >= base){
				do {
					angle -= base;
				}
				while (angle >= base);
			}else{
				while (angle < 0){
					angle += base;
				}
			}
			return angle;
		},
		
		computeAngle: function(startAngle, endAngle, orientation, base){
			if(base == undefined){
				base = 6.28318530718;
			}
			
			var totalAngle;
			
			if(endAngle == startAngle){
				return base;
			}
			
			if(orientation == "clockwise"){
				if(endAngle < startAngle){
					totalAngle = base - (startAngle - endAngle);
				}else{
					totalAngle = endAngle - startAngle;
				}
			}
			else{
				if(endAngle < startAngle){
					totalAngle = startAngle - endAngle;
				}else{
					totalAngle = base - (endAngle - startAngle);
				}
			}
			return this.modAngle(totalAngle, base);
		},
		
		toRadians: function(deg){
			return deg * Math.PI / 180;
		},
		
		toDegrees: function(rad){
			return rad * 180 / Math.PI;
		}
	}
});
