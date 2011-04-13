#!/bin/sh
# Make sure user has Java 1.6 installed
javaversion=`java -version 2>&1 | grep "java version"`
if [ -z "$javaversion" ]; then
	echo Unable to determine which version of Java is installed on this machine
else
	majorversionnumber=`echo "$javaversion" | sed 's/^[^0-9]*\([0-9][0-9]*\)\..*$/\1/'`
	minorversionnumber=`echo "$javaversion" | sed 's/^[^0-9]*[0-9][0-9]*\.\([0-9][0-9]*\).*$/\1/'`
	echo Java version=$majorversionnumber.$minorversionnumber
	if [[ $majorversionnumber -lt 1 || $minorversionnumber -lt 5 ]]; then
		echo
		echo !!!!!!!!!!!!!!
		echo CANNOT LAUNCH MAQETTA SERVER - Maqetta requires Java 1.5.
		echo	
		echo You can download JRE 1.6 at http://w3.hursley.ibm.com/java/jim/ibmsdks/latest/index.html
		echo !!!!!!!!!!!!!!
		echo
		exit
	fi
fi

echo
echo !!!!!!!!!!!!!!
echo NOTE: CLOSING THIS WINDOW WILL 
echo       STOP THE MAQETTA SERVER PROCESS
echo !!!!!!!!!!!!!
echo
port=50000
scriptdir=`dirname "$0"`
# usersdir="$HOME/Library/Application Support/maqetta/users"
usersdir="$scriptdir"/users

# Convert to absolute file name
D=`dirname "$usersdir"`
B=`basename "$usersdir"`

jarFilePath=`ls "$scriptdir"/plugins/org.eclipse.equinox.launcher*.jar`
echo Using jar: "$jarFilePath"

absusersdir="`cd \"$D\" 2>/dev/null && pwd || echo \"$D\"`/$B"
echo Using directory: "$absusersdir"

echo Start your browser at: http://localhost:$port/maqetta
mkdir -p "$absusersdir"
java -Dorg.eclipse.equinox.http.jetty.http.port=$port  -Dorg.eclipse.equinox.http.jetty.context.path=/maqetta -Dmaqetta.localInstall=true "-Dmaqetta.baseDirectory=$absusersdir" -jar "$jarFilePath" -console -noExit
