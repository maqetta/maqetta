//Changes the Dojo version in a file. Used during the release process.

var version = new String(arguments[0]);
var fileName = new String(arguments[1]);

load("jslib/logger.js");
load("jslib/fileUtil.js");
load("jslib/buildUtil.js");

var fileContents = fileUtil.readFile(fileName);
fileContents = buildUtil.changeVersion(version, fileContents);

fileUtil.saveUtf8File(fileName, fileContents);