dojo.provide("dojox.date.tests.buddhist.Date");
dojo.require("dojox.date.buddhist");
dojo.require("dojox.date.buddhist.Date");
dojo.require("dojox.date.buddhist.locale");

dojo.requireLocalization("dojo.cldr", "greg"); 
dojo.requireLocalization("dojo.cldr", "buddhist");

tests.register("dojox.date.tests.buddhist.Date", 
	[
		{
			// see tests for dojo.date.locale for setup info

			name: "dojox.date.tests.posix",
			setUp: function(){
				var partLocaleList = ["th"];

				dojo.forEach(partLocaleList, function(locale){
					dojo.requireLocalization("dojo.cldr", "greg", locale);
					dojo.requireLocalization("dojo.cldr", "buddhist", locale);
				});
			},
			runTest: function(t){
			},
			tearDown: function(){
				//Clean up bundles that should not exist if
				//the test is re-run.
				delete dojo.cldr.nls.greg;
				delete dojo.cldr.nls.buddhist;
			}
		},	
		{
			name: "toGregorian",
			runTest: function(t){
				var dateBuddhist = new dojox.date.buddhist.Date(2551, 11, 19); //Buddhist.Date month 0-12
				var dateGregorian = dateBuddhist.toGregorian();
				t.is(0, dojo.date.compare(new Date(2008, 11, 19), dateGregorian, "date"));//Date month 0-11
				
				dateBuddhist = new dojox.date.buddhist.Date(2548, 3, 18); 
				dateGregorian = dateBuddhist.toGregorian();
				t.is(0, dojo.date.compare(new Date(2005, 3, 18), dateGregorian, "date"));
				
				dateBuddhist = new dojox.date.buddhist.Date(2550, 7, 10); 
				dateGregorian = dateBuddhist.toGregorian();
				t.is(0, dojo.date.compare(new Date(2007, 7, 10), dateGregorian, "date"));
				
				dateBuddhist = new dojox.date.buddhist.Date(2552, 4, 20); 
				dateGregorian = dateBuddhist.toGregorian();
				t.is(0, dojo.date.compare(new Date(2009, 4, 20), dateGregorian, "date"));
				
				dateBuddhist = new dojox.date.buddhist.Date(2553, 6, 31); 
				dateGregorian = dateBuddhist.toGregorian();
				t.is(0, dojo.date.compare(new Date(2010, 6, 31), dateGregorian, "date"));
				
				dateBuddhist = new dojox.date.buddhist.Date(2554, 9, 1); 
				dateGregorian = dateBuddhist.toGregorian();
				t.is(0, dojo.date.compare(new Date(2011, 9, 1), dateGregorian, "date"));				
			}
		},
		{
			name: "fromGregorian",
			runTest: function(t){
				var dateGregorian = new Date(2009, 3, 12);
				var dateBuddhistFromGreg = new dojox.date.buddhist.Date(dateGregorian);
				t.is(0, dojo.date.compare( dateBuddhistFromGreg.toGregorian(), dateGregorian, "date"));
				t.is(0, dojo.date.compare( dateBuddhistFromGreg.toGregorian(), dateGregorian));
				
				dateGregorian = new Date(2008, 11, 18);  //Date month 0-11
				dateBuddhistFromGreg = new dojox.date.buddhist.Date(dateGregorian);
				t.is(0, dojox.date.buddhist.compare(new dojox.date.buddhist.Date(2551, 11, 18), dateBuddhistFromGreg, "date")); //Buddhist.Date month 0-12
	
				dateGregorian = new Date(2005, 3, 18);
				dateBuddhistFromGreg = new dojox.date.buddhist.Date(dateGregorian);
				t.is(0, dojox.date.buddhist.compare(new dojox.date.buddhist.Date(2548, 3, 18), dateBuddhistFromGreg, "date"));
				
				dateGregorian = new Date(2007, 7, 10);
				dateBuddhistFromGreg = new dojox.date.buddhist.Date(dateGregorian);
				t.is(0, dojox.date.buddhist.compare(new dojox.date.buddhist.Date(2550, 7, 10), dateBuddhistFromGreg, "date"));					
				
				dateGregorian = new Date(2009, 4, 20);
				dateBuddhistFromGreg = new dojox.date.buddhist.Date(dateGregorian);
				t.is(0, dojox.date.buddhist.compare(new dojox.date.buddhist.Date(2552, 4, 20), dateBuddhistFromGreg, "date"));				
				
				dateGregorian = new Date(2010, 6, 31);
				dateBuddhistFromGreg = new dojox.date.buddhist.Date(dateGregorian);
				t.is(0, dojox.date.buddhist.compare(new dojox.date.buddhist.Date(2553, 6, 31), dateBuddhistFromGreg, "date"));	
				
				dateGregorian = new Date(2011, 9, 1);
				dateBuddhistFromGreg = new dojox.date.buddhist.Date(dateGregorian);
				t.is(0, dojox.date.buddhist.compare(new dojox.date.buddhist.Date(2554, 9, 1), dateBuddhistFromGreg, "date"));					
			}
		},
		{
			name: "compare",
			runTest: function(t){
				var dateBuddhist = new dojox.date.buddhist.Date(2552, 5, 16);
				var dateBuddhist1 = new dojox.date.buddhist.Date(2550,  10,  25);
				t.is(1, dojo.date.compare(dateBuddhist.toGregorian(), dateBuddhist1.toGregorian()));
				t.is(-1, dojo.date.compare(dateBuddhist1.toGregorian(), dateBuddhist.toGregorian()));
			}	
		},		
		{
			name: "add_and_difference",
			runTest: function(t){
				var dateBuddhist = new dojox.date.buddhist.Date(2552, 5, 16);
				var dateBuddhistLeap = new dojox.date.buddhist.Date(2551, 5, 16);
				
				var dateBuddhistAdd = dojox.date.buddhist.add(dateBuddhist, "month",  18);
				var dateBuddhistAddLeap = dojox.date.buddhist.add(dateBuddhistLeap, "month",  18);
				t.is(0, 18 - dojox.date.buddhist.difference(dateBuddhistAdd, dateBuddhist, "month"));
				t.is(0, 18 - dojox.date.buddhist.difference(dateBuddhistAddLeap, dateBuddhistLeap, "month"));
				
				var dateBuddhistAdd1= dojox.date.buddhist.add(dateBuddhist, "year", 2);
				t.is(0,  2 - dojox.date.buddhist.difference(dateBuddhistAdd1, dateBuddhist, "year"));
				t.is(0,  2 - dojox.date.buddhist.difference(dojox.date.buddhist.add(dateBuddhistLeap, "year", 2), dateBuddhistLeap, "year"));
				
				var dateBuddhistAdd2= dojox.date.buddhist.add(dateBuddhist, "week",  12);
				t.is(0, 12 - dojox.date.buddhist.difference(dateBuddhistAdd2, dateBuddhist, "week"));
				t.is(0,  12 - dojox.date.buddhist.difference(dojox.date.buddhist.add(dateBuddhistLeap, "week", 12), dateBuddhistLeap,"week"));
								
				var dateBuddhistAdd3= dojox.date.buddhist.add(dateBuddhist, "weekday", 20);
				t.is(0, 20 - dojox.date.buddhist.difference(dateBuddhistAdd3, dateBuddhist, "weekday")); 
				t.is(0,  20 - dojox.date.buddhist.difference(dojox.date.buddhist.add(dateBuddhistLeap, "weekday", 20), dateBuddhistLeap,"weekday"));
				
				var dateBuddhistAdd4= dojox.date.buddhist.add(dateBuddhist, "day", -50)
				t.is(0, -50 - dojox.date.buddhist.difference(dateBuddhistAdd4, dateBuddhist, "day")); 
				t.is(0, -50 - dojox.date.buddhist.difference(dojox.date.buddhist.add(dateBuddhistLeap, "day", -50), dateBuddhistLeap,"day"));
											
				var dateBuddhistAdd5= dojox.date.buddhist.add(dateBuddhist, "hour", 200);
				t.is(0, 200 - dojox.date.buddhist.difference(dateBuddhistAdd5, dateBuddhist, "hour"));  
				t.is(0, 200 - dojox.date.buddhist.difference(dojox.date.buddhist.add(dateBuddhistLeap, "hour", 200), dateBuddhistLeap,"hour"));
				
				var dateBuddhistAdd6= dojox.date.buddhist.add(dateBuddhist, "minute", -200);
				t.is(0, -200 - dojox.date.buddhist.difference(dateBuddhistAdd6, dateBuddhist, "minute")); 
				t.is(0, -200 - dojox.date.buddhist.difference(dojox.date.buddhist.add(dateBuddhistLeap, "minute", -200), dateBuddhistLeap,"minute")); 
				
				var dateBuddhistDiff = new dojox.date.buddhist.Date(2552, 5, 17);
				t.is(1, dojox.date.buddhist.difference(dateBuddhistDiff, dateBuddhist)); 
			}
		},
		{
			name: "parse_and_format",
			runTest: function(t){
				var dateBuddhist = new dojox.date.buddhist.Date(2552, 5, 16);
					
				var options = {formatLength:'short'};
				str= dojox.date.buddhist.locale.format(dateBuddhist, options);
				dateBuddhist1 = dojox.date.buddhist.locale.parse(str, options);
				t.is(0, dojo.date.compare(dateBuddhist.toGregorian(), dateBuddhist1.toGregorian(), 'date'));
				
				var pat = 'dd/MM/yy h:m:s';
				 options = {datePattern:pat, selector:'date'};
				 str= dojox.date.buddhist.locale.format(dateBuddhist, options);
				 dateBuddhist1 = dojox.date.buddhist.locale.parse(str, options);
				 t.is(0, dojo.date.compare(dateBuddhist.toGregorian(), dateBuddhist1.toGregorian(), 'date'));
				 
				pat = 'dd#MM#yy HH$mm$ss';
				 options = {datePattern:pat, selector:'date'};
				 str= dojox.date.buddhist.locale.format(dateBuddhist, options);
				 dateBuddhist1 = dojox.date.buddhist.locale.parse(str, options);
				  t.is(0, dojo.date.compare(dateBuddhist.toGregorian(), dateBuddhist1.toGregorian(), 'date'));
				
				
				 pat = 'HH$mm$ss';
				 options = {timePattern:pat, selector:'time'};
				 str= dojox.date.buddhist.locale.format(dateBuddhist, options);
				 dateBuddhist1 = dojox.date.buddhist.locale.parse(str, options);
				gregDate = dojo.date.locale.parse(str, options);
				t.is(0, dojo.date.compare(gregDate, dateBuddhist1.toGregorian(), 'time'));	
								 	
			}		
		}	
	]
);
