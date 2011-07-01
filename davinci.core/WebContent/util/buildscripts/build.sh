#!/bin/sh

java -classpath ../shrinksafe/js.jar:../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main build.js "$@"

# if you experience an "Out of Memory" error, you can increase it as follows:
#java -Xms256m -Xmx256m -classpath ../shrinksafe/js.jar:../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main  build.js "$@"
