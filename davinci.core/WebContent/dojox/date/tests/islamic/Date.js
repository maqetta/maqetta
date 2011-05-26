dojo.provide("dojox.date.tests.islamic.Date");
dojo.require("dojox.date.islamic.Date");
dojo.require("dojox.date.islamic.locale");
dojo.require("dojox.date.islamic");
dojo.require("dojo.date");

dojo.requireLocalization("dojo.cldr", "gregorian");
dojo.requireLocalization("dojo.cldr", "islamic");

tests.register("dojox.date.tests.islamic.Date",
	[
		{
			// Test formatting and parsing of dates in various locales pre-built in dojo.cldr
			// NOTE: we can't set djConfig.extraLocale before bootstrapping unit tests, so directly
			// load resources here for specific locales:

			name: "date.locale",
			setUp: function() {
				var partLocaleList = ["ar","en"];

				dojo.forEach(partLocaleList, function(locale) {
					dojo.requireLocalization("dojo.cldr", "islamic", locale);
				});
			},
			runTest: function(t) {
			},
			tearDown: function() {
				//Clean up bundles that should not exist if
				//the test is re-run.
				delete dojo.cldr.nls.islamic;
			}
		},
		{
			name: "toGregorian",
			runTest: function(t) {
				var dateIslamic = new dojox.date.islamic.Date(1431, 3, 6, 15, 15, 10 ); // March 22 2010 3:15:10 PM
				var dateGregorian = dateIslamic.toGregorian();
				t.is(0, dojo.date.compare(new Date(2010, 2, 22, 15, 15, 10), dateGregorian, "date"));
			}
		},
		{
			name: "fromGregorian",
			runTest: function(t) {
				var dateIslamic = new dojox.date.islamic.Date();
				var dateGregorian = new Date(2010, 2, 22, 15, 15, 10);
				dateIslamic.fromGregorian(dateGregorian);
				t.is(0, dojox.date.islamic.compare(new dojox.date.islamic.Date(1431, 3, 6, 15, 15, 10), dateIslamic, "date"));
			}
		},
		{
			name: "getDay",
			runTest: function(t) {
				var dateTable = [
					[1431, 0, 11, 1],
					[1431, 1, 3, 2],
					[1431, 2, 10, 3],
					[1431, 3, 23, 4],
					[1431, 6, 21, 6],
					[1431, 6, 22, 0],
					[1431, 7, 15, 2]
				];
				dojo.forEach(dateTable, function(d, i) {
					var date = new dojox.date.islamic.Date(d[0], d[1], d[2]);
					t.is(d[3], date.getDay());
				});

			}
		},
		{
			name: "getDaysInIslamicMonth",
			runTest: function(t) {

				var dateTable = [
					[1430, 1, 29],
					[1420, 1, 29],
					[1422, 5, 29],
					[1431, 5, 29],
					[1430, 2, 30],
					[1431, 2, 30]
				];

				dojo.forEach(dateTable, function(d, i) {
					var date = new dojox.date.islamic.Date(d[0], d[1], 1);
					t.is(d[2], dojox.date.islamic.getDaysInMonth(date));
				});
			}
		},
		{
			name: "add_difference",
			runTest: function(t) {
				var start = [
						[1420, 1, 1422, 1],
						[1430, 2, 1435, 2],
						[1433, 0, 1434, 0],
						[1422, 2, 1420, 2],
						[1429, 3, 1427, 3],
						[1431, 4, 1431, 6],
						[1429, 7, 1429, 5],
						[1431, 3, 1431, 5],
						[1431, 3, 1431, 0],
						[1431, 1, 1431, 2],
						[1431, 9, 1431, 8]
					];
				var add = [24, 60, 12, -24, -24, 2, -2, 2, -3, 1, -1];

				var dateHijriStart, dateHijriEnd, res, dateHijriRes;
				dojo.forEach(start, function(s, i) {
					dateHijriStart = new dojox.date.islamic.Date(s[0], s[1], 1);
					dateHijriRes = dojox.date.islamic.add(dateHijriStart, "month", add[i]);

					t.is(0, dateHijriRes.getMonth() - s[3]);
					t.is(0, dateHijriRes.getFullYear() - s[2]);
				});

				//month difference
				dojo.forEach(start, function(s, i) {
					dateHijriRes = new dojox.date.islamic.Date(s[2], s[3], 1);
					dateHijriStart = new dojox.date.islamic.Date(s[0], s[1], 1);
					t.is(add[i], dojox.date.islamic.difference(dateHijriRes, dateHijriStart, "month"));
				});
			}
		},
		{
			name: "consistency_of_add_and_difference",
			runTest: function(t) {
				var dateIslamic = new dojox.date.islamic.Date(1431, 4, 6);


				var amouts = [2, 5, 6, 7, 8, 12, 18, 20, 24, 50, -3, -4, -5, -6, -7, -8, -9, -10, -50, 200, -200];
				var dateIslamicAdd;

				dojo.forEach(amouts, function(amount, i) {
					dateIslamicAdd = dojox.date.islamic.add(dateIslamic, "month", amount);
					t.is(dojox.date.islamic.difference(dateIslamicAdd, dateIslamic, "month"), amount);

					dateIslamicAdd = dojox.date.islamic.add(dateIslamic, "year", amount);
					t.is(amount, dojox.date.islamic.difference(dateIslamicAdd, dateIslamic, "year"));

					dateIslamicAdd = dojox.date.islamic.add(dateIslamic, "week", amount);
					t.is(amount, dojox.date.islamic.difference(dateIslamicAdd, dateIslamic, "week"));

					dateIslamicAdd = dojox.date.islamic.add(dateIslamic, "weekday", amount);
					t.is(amount, dojox.date.islamic.difference(dateIslamicAdd, dateIslamic, "weekday"));

					dateIslamicAdd = dojox.date.islamic.add(dateIslamic, "day", amount)
					t.is(amount, dojox.date.islamic.difference(dateIslamicAdd, dateIslamic, "day"));

					dateIslamicAdd = dojox.date.islamic.add(dateIslamic, "hour", amount);
					t.is(amount, dojox.date.islamic.difference(dateIslamicAdd, dateIslamic, "hour"));

					dateIslamicAdd = dojox.date.islamic.add(dateIslamic, "minute", amount);
					t.is(amount, dojox.date.islamic.difference(dateIslamicAdd, dateIslamic, "minute"));

					dateIslamicAdd = dojox.date.islamic.add(dateIslamic, "second", amount);
					t.is(amount, dojox.date.islamic.difference(dateIslamicAdd, dateIslamic, "second"));

					dateIslamicAdd = dojox.date.islamic.add(dateIslamic, "millisecond", amount);
					t.is(amount, dojox.date.islamic.difference(dateIslamicAdd, dateIslamic, "millisecond"));
				});

				var dateIslamicDiff = new dojox.date.islamic.Date(1431, 4, 7);
				t.is(1, dojox.date.islamic.difference(dateIslamicDiff, dateIslamic));
			}
		},
		{
			name: "getMonth_setMonth",
			runTest: function(t) {
				var dateIslamic = new dojox.date.islamic.Date(1420, 1, 1);
				for (var year = 1420; year < 1430; year++) {
					dateIslamic.setFullYear(year);
					t.is(year, dateIslamic.getFullYear());
					dateIslamic.setMonth(11);
					t.is(11, dateIslamic.getMonth());
					dateIslamic.setMonth(6);
					t.is(6, dateIslamic.getMonth());

				}
			}
		},
		{
			name: "parse_and_format",
			runTest: function(t) {

				//test Islamic and English locale

				var dates = [
							[1430, 5, 1],
							[1428, 1, 28],
							[1431, 5, 16],
							[1431, 11, 2],
							[1433, 0, 2]
						];

				var dateIslamic, dateIslamic1;
				dojo.forEach(dates, function(date, i) {
					dateIslamic = new dojox.date.islamic.Date(date[0], date[1], date[2]);

					var options = [{ formatLength: 'full', locale: 'ar' }, { formatLength: 'long', locale: 'ar' }, { formatLength: 'medium', locale: 'ar' }, { formatLength: 'short', locale: 'ar' },
						{ formatLength: 'full', locale: 'en' }, { formatLength: 'long', locale: 'en' }, { formatLength: 'medium', locale: 'en' }, { formatLength: 'short', locale: 'en'}];
					dojo.forEach(options, function(opt, i) {
						str = dojox.date.islamic.locale.format(dateIslamic, opt);
						var option = "{" + opt + ", locale:'ar'}";
						dateIslamic1 = dojox.date.islamic.locale.parse(str, opt);
						t.is(0, dojo.date.compare(dateIslamic.toGregorian(), dateIslamic1.toGregorian(), 'date'));
					});

					var pattern = ['d M yy', 'dd/MM/yy h:m:s', 'dd#MM#yy HH$mm$ss', 'dd MMMM yyyy'];
					dojo.forEach(pattern, function(pat, i) {
						options = { datePattern: pat, selector: 'date', locale: 'ar' };
						str = dojox.date.islamic.locale.format(dateIslamic, options);
						dateIslamic1 = dojox.date.islamic.locale.parse(str, options);
						t.is(0, dojo.date.compare(dateIslamic.toGregorian(), dateIslamic1.toGregorian(), 'date'));
					});
				});

				dateIslamic = new dojox.date.islamic.Date(1431, 6, 3, 15, 3, 59);
				pattern = 'HH$mm$ss';
				options = { timePattern: pattern, selector: 'time' };
				str = dojox.date.islamic.locale.format(dateIslamic, options);
				dateIslamic1 = dojox.date.islamic.locale.parse(str, options);
				var gregDate = dojo.date.locale.parse(str, options);
				t.is(0, dojo.date.compare(gregDate, dateIslamic1.toGregorian(), 'time'));

				pattern = "h:m:s";
				options = { timePattern: pattern, selector: 'time' };
				str = dojox.date.islamic.locale.format(dateIslamic, options);
				t.is(str, "3:3:59");
			}
		}
	]
);
