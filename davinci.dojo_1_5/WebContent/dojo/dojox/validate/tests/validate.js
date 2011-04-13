dojo.provide("dojox.validate.tests.validate"); 

dojo.require("dojox.validate._base");
dojo.require("dojox.validate.check");
dojo.require("dojox.validate.us");
dojo.require("dojox.validate.ca"); 
dojo.require("dojox.validate.web");
dojo.require("dojox.validate.isbn");

tests.register("dojox.validate.tests.validate",
	[{
		name: "isText",

		setUp: function(){
			var localeList = ["en-us"];
			for(var i = 0 ; i < localeList.length; i ++){
				dojo.requireLocalization("dojo.cldr", "currency", localeList[i]);
				dojo.requireLocalization("dojo.cldr", "number", localeList[i]);
			}
		},

		runTest: function(tests){
			tests.t(dojox.validate.isValidIsbn('0596007590')); //test string input
			tests.t(dojox.validate.isValidIsbn('0-596-00759-0')); //test string input with dashes
			tests.f(dojox.validate.isValidIsbn(596007590)); //test numerical input as well
			tests.t(dojox.validate.isValidIsbn("960-425-059-0")); 
			tests.t(dojox.validate.isValidIsbn(9604250590)); //test numerical input as well
			tests.t(dojox.validate.isValidIsbn('0-9752298-0-X')); // test string with X
			tests.t(dojox.validate.isValidIsbn('0-9752298-0-x')); 
			tests.t(dojox.validate.isValidIsbn('097522980x')); 
			tests.t(dojox.validate.isValidIsbn('097522980X')); 
			tests.f(dojox.validate.isValidIsbn(596007598)); //testing failures
			tests.f(dojox.validate.isValidIsbn('059-600759-X')); //testing failures
			tests.f(dojox.validate.isValidIsbn('059600')); // too short

			tests.t(dojox.validate.isValidIsbn('9780596007591'));
			tests.t(dojox.validate.isValidIsbn('978-0-596 00759-1'));
			tests.t(dojox.validate.isValidIsbn(9780596007591));
			tests.f(dojox.validate.isValidIsbn('978059600759X'));
			tests.f(dojox.validate.isValidIsbn('978-3250-596 00759-1 '));
			tests.f(dojox.validate.isValidIsbn('3250-596 00759 '));

			tests.t(dojox.validate.isText('            x'));
			tests.t(dojox.validate.isText('x             '));
			tests.t(dojox.validate.isText('        x     '));
			tests.f(dojox.validate.isText('   '));
			tests.f(dojox.validate.isText(''));
		
			// test lengths
			tests.t(dojox.validate.isText('123456', {length: 6} ));
			tests.f(dojox.validate.isText('1234567', {length: 6} ));
			tests.t(dojox.validate.isText('1234567', {minlength: 6} ));
			tests.t(dojox.validate.isText('123456', {minlength: 6} ));
			tests.f(dojox.validate.isText('12345', {minlength: 6} ));
			tests.f(dojox.validate.isText('1234567', {maxlength: 6} ));
			tests.t(dojox.validate.isText('123456', {maxlength: 6} ));
		}
	},
	{
		name: "isIpAddress",
		runTest: function(tests){
			tests.t(dojox.validate.isIpAddress('24.17.155.40'));
			tests.f(dojox.validate.isIpAddress('024.17.155.040'));       
			tests.t(dojox.validate.isIpAddress('255.255.255.255'));       
			tests.f(dojox.validate.isIpAddress('256.255.255.255'));       
			tests.f(dojox.validate.isIpAddress('255.256.255.255'));       
			tests.f(dojox.validate.isIpAddress('255.255.256.255'));       
			tests.f(dojox.validate.isIpAddress('255.255.255.256'));       

			// test dotted hex       
			tests.t(dojox.validate.isIpAddress('0x18.0x11.0x9b.0x28'));       
			tests.f(dojox.validate.isIpAddress('0x18.0x11.0x9b.0x28', {allowDottedHex: false}) );       
			tests.t(dojox.validate.isIpAddress('0x18.0x000000011.0x9b.0x28'));       
			tests.t(dojox.validate.isIpAddress('0xff.0xff.0xff.0xff'));       
			tests.f(dojox.validate.isIpAddress('0x100.0xff.0xff.0xff'));       

			// test dotted octal       
			tests.t(dojox.validate.isIpAddress('0030.0021.0233.0050'));       
			tests.f(dojox.validate.isIpAddress('0030.0021.0233.0050', {allowDottedOctal: false}) );
			tests.t(dojox.validate.isIpAddress('0030.0000021.0233.00000050'));       
			tests.t(dojox.validate.isIpAddress('0377.0377.0377.0377'));       
			tests.f(dojox.validate.isIpAddress('0400.0377.0377.0377'));       
			tests.f(dojox.validate.isIpAddress('0377.0378.0377.0377'));       
			tests.f(dojox.validate.isIpAddress('0377.0377.0380.0377'));       
			tests.f(dojox.validate.isIpAddress('0377.0377.0377.377'));       
		
			// test decimal       
			tests.t(dojox.validate.isIpAddress('3482223595'));       
			tests.t(dojox.validate.isIpAddress('0'));       
			tests.t(dojox.validate.isIpAddress('4294967295'));       
			tests.f(dojox.validate.isIpAddress('4294967296'));       
			tests.f(dojox.validate.isIpAddress('3482223595', {allowDecimal: false}));       
		
			// test hex       
			tests.t(dojox.validate.isIpAddress('0xCF8E83EB'));       
			tests.t(dojox.validate.isIpAddress('0x0'));       
			tests.t(dojox.validate.isIpAddress('0x00ffffffff'));       
			tests.f(dojox.validate.isIpAddress('0x100000000'));
			tests.f(dojox.validate.isIpAddress('0xCF8E83EB', {allowHex: false}));       
			
			// IPv6       
			tests.t(dojox.validate.isIpAddress('fedc:BA98:7654:3210:FEDC:BA98:7654:3210'));       
			tests.t(dojox.validate.isIpAddress('1080:0:0:0:8:800:200C:417A'));
			tests.f(dojox.validate.isIpAddress('1080:0:0:0:8:800:200C:417A', {allowIPv6: false}));
		
			// Hybrid of IPv6 and IPv4
			tests.t(dojox.validate.isIpAddress('0:0:0:0:0:0:13.1.68.3'));
			tests.t(dojox.validate.isIpAddress('0:0:0:0:0:FFFF:129.144.52.38'));
			tests.f(dojox.validate.isIpAddress('0:0:0:0:0:FFFF:129.144.52.38', {allowHybrid: false}));
			
		}
	},
	{
		name: "isUrlTest",
		runTest: function(tests){ 
			
			tests.t(dojox.validate.isUrl('www.yahoo.com'));
			tests.t(dojox.validate.isUrl('http://www.yahoo.com'));
			tests.t(dojox.validate.isUrl('https://www.yahoo.com'));
			tests.f(dojox.validate.isUrl('http://.yahoo.com'));
			tests.f(dojox.validate.isUrl('http://www.-yahoo.com'));
			tests.f(dojox.validate.isUrl('http://www.yahoo-.com'));
			tests.t(dojox.validate.isUrl('http://y-a---h-o-o.com'));
			tests.t(dojox.validate.isUrl('http://www.y.com'));
			tests.t(dojox.validate.isUrl('http://www.yahoo.museum'));
			tests.t(dojox.validate.isUrl('http://www.yahoo.co.uk'));
			tests.f(dojox.validate.isUrl('http://www.micro$oft.com'));
		
			tests.t(dojox.validate.isUrl('http://www.y.museum:8080'));
			tests.t(dojox.validate.isUrl('http://12.24.36.128:8080'));
			tests.f(dojox.validate.isUrl('http://12.24.36.128:8080', {allowIP: false} ));
			tests.t(dojox.validate.isUrl('www.y.museum:8080'));
			tests.f(dojox.validate.isUrl('www.y.museum:8080', {scheme: true} ));
			tests.t(dojox.validate.isUrl('localhost:8080', {allowLocal: true} ));
			tests.f(dojox.validate.isUrl('localhost:8080', {} ));
			tests.t(dojox.validate.isUrl('http://www.yahoo.com/index.html?a=12&b=hello%20world#anchor'));
			tests.t(dojox.validate.isUrl('http://www.yahoo.xyz'));
			tests.t(dojox.validate.isUrl('http://www.yahoo.com/index.html#anchor'));
			tests.t(dojox.validate.isUrl('http://cocoon.apache.org/2.1/'));
		}
	},
	{
		name: "isEmailAddress",
		runTest: function(tests) {
			tests.t(dojox.validate.isEmailAddress('x@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x@yahoo'));
			tests.t(dojox.validate.isEmailAddress('x.y.z.w@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x..y.z.w@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x.@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('.x@yahoo.com'));
			tests.t(dojox.validate.isEmailAddress('azAZ09!#$%.&\'*+-/=?_`{|}y@yahoo.com'));
			tests.t(dojox.validate.isEmailAddress('x=y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x(y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x)y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x<y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x>y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x[y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x]y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x:y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x;y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x@y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x\\y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x,y@yahoo.com'));
			tests.f(dojox.validate.isEmailAddress('x\"y@yahoo.com'));
			tests.t(dojox.validate.isEmailAddress('x@z.com'));
			tests.t(dojox.validate.isEmailAddress('x@yahoo.x'));
			tests.t(dojox.validate.isEmailAddress('x@yahoo.museum'));
			tests.t(dojox.validate.isEmailAddress("o'mally@yahoo.com"));
			tests.t(dojox.validate.isEmailAddress("o''mally@yahoo.com"));
			tests.t(dojox.validate.isEmailAddress("'mally@yahoo.com"));
			tests.t(dojox.validate.isEmailAddress("fred&barney@stonehenge.com"));
			tests.t(dojox.validate.isEmailAddress("fred&&barney@stonehenge.com"));
		
			// local addresses
			tests.t(dojox.validate.isEmailAddress("fred&barney@localhost", {allowLocal: true} ));
			tests.f(dojox.validate.isEmailAddress("fred&barney@localhost"));
		
			// addresses with cruft
			tests.t(dojox.validate.isEmailAddress("mailto:fred&barney@stonehenge.com", {allowCruft: true} ));
			tests.t(dojox.validate.isEmailAddress("<fred&barney@stonehenge.com>", {allowCruft: true} ));
			tests.f(dojox.validate.isEmailAddress("mailto:fred&barney@stonehenge.com"));
			tests.f(dojox.validate.isEmailAddress("<fred&barney@stonehenge.com>"));
	
			// local addresses with cruft
			tests.t(dojox.validate.isEmailAddress("<mailto:fred&barney@localhost>", {allowLocal: true, allowCruft: true} ));
			tests.f(dojox.validate.isEmailAddress("<mailto:fred&barney@localhost>", {allowCruft: true} ));
			tests.f(dojox.validate.isEmailAddress("<mailto:fred&barney@localhost>", {allowLocal: true} ));
		}
	},
	{
		name: "isEmailsAddressList",
		runTest: function(tests) {
			tests.t(dojox.validate.isEmailAddressList(
				"x@yahoo.com \n x.y.z.w@yahoo.com ; o'mally@yahoo.com , fred&barney@stonehenge.com \n" )
			);
			tests.t(dojox.validate.isEmailAddressList(
				"x@yahoo.com \n x.y.z.w@localhost \n o'mally@yahoo.com \n fred&barney@localhost", 
				{allowLocal: true} )
			);
			tests.f(dojox.validate.isEmailAddressList(
				"x@yahoo.com; x.y.z.w@localhost; o'mally@yahoo.com; fred&barney@localhost", {listSeparator: ";"} )
			);
			tests.t(dojox.validate.isEmailAddressList(
					"mailto:x@yahoo.com; <x.y.z.w@yahoo.com>; <mailto:o'mally@yahoo.com>; fred&barney@stonehenge.com", 
					{allowCruft: true, listSeparator: ";"} )
			);
			tests.f(dojox.validate.isEmailAddressList(
					"mailto:x@yahoo.com; <x.y.z.w@yahoo.com>; <mailto:o'mally@yahoo.com>; fred&barney@stonehenge.com", 
					{listSeparator: ";"} )
			);
			tests.t(dojox.validate.isEmailAddressList(
					"mailto:x@yahoo.com; <x.y.z.w@localhost>; <mailto:o'mally@localhost>; fred&barney@localhost", 
					{allowLocal: true, allowCruft: true, listSeparator: ";"} )
			);
		}
	},
	{
		name: "getEmailAddressList",
		runTest: function(tests) {
			var list = "x@yahoo.com \n x.y.z.w@yahoo.com ; o'mally@yahoo.com , fred&barney@stonehenge.com";
			tests.is(4, dojox.validate.getEmailAddressList(list).length);

			var localhostList = "x@yahoo.com; x.y.z.w@localhost; o'mally@yahoo.com; fred&barney@localhost";
			tests.is(0, dojox.validate.getEmailAddressList(localhostList).length);
			tests.is(4, dojox.validate.getEmailAddressList(localhostList, {allowLocal: true} ).length);
		}
	},
	{
		name: "isInRangeInt",
		runTest: function(tests) {
			// test integers
			tests.f(dojox.validate.isInRange( '0', {min: 1, max: 100} ));
			tests.t(dojox.validate.isInRange( '1', {min: 1, max: 100} ));
			tests.f(dojox.validate.isInRange( '-50', {min: 1, max: 100} ));
//			tests.t(dojox.validate.isInRange( '+50', {min: 1, max: 100} )); //TODO: dojo.number.parse does not support plus sign
			tests.t(dojox.validate.isInRange( '100', {min: 1, max: 100} ));
			tests.f(dojox.validate.isInRange( '101', {min: 1, max: 100} ));
		}
	},
	{
		name:"isInRangeReal",
		runTest: function(tests){
	
			tests.f(dojox.validate.isInRange( '0.9', {min: 1.0, max: 10.0, locale: 'en-us'} ));
			tests.t(dojox.validate.isInRange( '1.0', {min: 1.0, max: 10.0, locale: 'en-us'} ));
			tests.f(dojox.validate.isInRange( '-5.0', {min: 1.0, max: 10.0, locale: 'en-us'} ));
//			tests.t(dojox.validate.isInRange( '+5.50', {min: 1.0, max: 10.0, locale: 'en-us'} )); //TODO: dojo.number.parse does not support plus sign
			tests.t(dojox.validate.isInRange( '10.0', {min: 1.0, max: 10.0, locale: 'en-us'} ));
			tests.f(dojox.validate.isInRange( '10.1', {min: 1.0, max: 10.0, locale: 'en-us'} ));
// TODO: dojo.number.parse does not support scientific notation at this time
//			tests.f(dojox.validate.isInRange( '5.566e28', {min: 5.567e28, max: 6.000e28, locale: 'en-us'} ));
//			tests.t(dojox.validate.isInRange( '5.7e28', {min: 5.567e28, max: 6.000e28, locale: 'en-us'} ));
//			tests.f(dojox.validate.isInRange( '6.00000001e28', {min: 5.567e28, max: 6.000e28, locale: 'en-us'} ));
//			tests.f(dojox.validate.isInRange( '10.000.000,12345e-5', {decimal: ",", max: 10000000.1e-5, locale: 'de-de'} ));
//			tests.f(dojox.validate.isInRange( '10.000.000,12345e-5', {decimal: ",", min: 10000000.2e-5, locale: 'de-de'} ));
			tests.t(dojox.validate.isInRange('1,500,000', { min: 0, locale: 'en-us'}));
			tests.f(dojox.validate.isInRange('1,500,000', { min: 1000, max: 20000, locale: 'en-us'}));
		}
	},
	{	
		name: "isUsPhoneNumber",
		runTest: function(tests) {
			tests.t(dojox.validate.us.isPhoneNumber('(111) 111-1111'));
			tests.t(dojox.validate.us.isPhoneNumber('(111) 111 1111'));
			tests.t(dojox.validate.us.isPhoneNumber('111 111 1111'));
			tests.t(dojox.validate.us.isPhoneNumber('111.111.1111'));
			tests.t(dojox.validate.us.isPhoneNumber('111-111-1111'));
			tests.t(dojox.validate.us.isPhoneNumber('111/111-1111'));
			tests.f(dojox.validate.us.isPhoneNumber('111 111-1111'));
			tests.f(dojox.validate.us.isPhoneNumber('111-1111'));
			tests.f(dojox.validate.us.isPhoneNumber('(111)-111-1111'));
		
			// test extensions
			tests.t(dojox.validate.us.isPhoneNumber('111-111-1111 x1'));
			tests.t(dojox.validate.us.isPhoneNumber('111-111-1111 x12'));
			tests.t(dojox.validate.us.isPhoneNumber('111-111-1111 x1234'));
		}
	},
	{
		name: "isUsSocialSecurityNumber",
		runTest: function(tests) {
			tests.t(dojox.validate.us.isSocialSecurityNumber('123-45-6789'));
			tests.t(dojox.validate.us.isSocialSecurityNumber('123 45 6789'));
			tests.t(dojox.validate.us.isSocialSecurityNumber('123456789'));
			tests.f(dojox.validate.us.isSocialSecurityNumber('123-45 6789'));
			tests.f(dojox.validate.us.isSocialSecurityNumber('12345 6789'));
			tests.f(dojox.validate.us.isSocialSecurityNumber('123-456789'));
		}
	},
	{
		name:"isUsZipCode",
		runTest: function(tests) {
			tests.t(dojox.validate.us.isZipCode('12345-6789'));
			tests.t(dojox.validate.us.isZipCode('12345 6789'));
			tests.t(dojox.validate.us.isZipCode('123456789'));
			tests.t(dojox.validate.us.isZipCode('12345'));
		}
	},
	{
		name:"isCaZipCode",
		runTest: function(tests) {
			tests.t(dojox.validate.ca.isPostalCode('A1Z 3F3'));
			tests.f(dojox.validate.ca.isPostalCode('1AZ 3F3'));
			tests.t(dojox.validate.ca.isPostalCode('a1z 3f3'));
			tests.f(dojox.validate.ca.isPostalCode('xxxxxx'));
			tests.f(dojox.validate.ca.isPostalCode('A1Z3F3')); 
			
		}
	},
	{
		name:"isUsState",
		runTest: function(tests) {
			tests.t(dojox.validate.us.isState('CA'));
			tests.t(dojox.validate.us.isState('ne'));
			tests.t(dojox.validate.us.isState('PR'));
			tests.f(dojox.validate.us.isState('PR', {allowTerritories: false} ));
			tests.t(dojox.validate.us.isState('AA'));
			tests.f(dojox.validate.us.isState('AA', {allowMilitary: false} ));
		}
	}
]);
