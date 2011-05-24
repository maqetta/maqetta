/*This profile demonstrates how to do a custom build for the Rhino environment.
  You only need to include the "shrinksafe" prefix entry below if you want to
  be able to run the DOH unit tests directly from the release directory.
*/

hostenvType = "rhino";

dependencies = {
	layers: [
	],

	prefixes: [
		[ "dojox", "../dojox" ],
		[ "shrinksafe", "../util/shrinksafe" ]
	]
};
