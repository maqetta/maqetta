#!/bin/sh

print_help() {
    echo "Usage: ./maqetta.server.mac.command [OPTION]..."
    echo ""
    echo "Options:"
    echo " -p, --port <port>           server listens on port # <port>; defaults to 50000"
    echo " -m, --smtpServer <hostname> provide the hostname of an SMTP server; defaults to localhost"
    echo " -c, --consolePort <port>    enable console, listening on port number <port>"
    echo " --webBuilder <URL>          enable Dojo Web Builder, using given URL"
    echo " -h, --help                  show this message"
}

# defaults
port=50000
consolePort="-console"
smtpServer="localhost"

# parse options
while [ "${1+isset}" ]; do
    case "$1" in
        -p|--port)
            port=$2
            shift 2
            ;;
        -m|--smtpServer)
            smtpServer=$2
            shift 2
            ;;
        -c|--consolePort)
            consolePort="-console $2"
            shift 2
            ;;
        --webBuilder)
            dwbUrl="-Dmaqetta.dojoWebBuilder=\"$2\""
            shift 2
            ;;
        -h|--help)
            print_help
            exit
            ;;
        *)
            echo "Error: Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Make sure user has Java 1.5 installed
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
java -Dorion.core.configFile=${scriptdir}/maqetta.conf "-Dmaqetta.baseDirectory=$absusersdir" -Dorg.eclipse.equinox.http.jetty.http.port=$port $dwbUrl -jar "$jarFilePath" $consolePort -noExit
