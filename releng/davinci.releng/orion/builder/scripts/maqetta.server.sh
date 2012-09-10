#!/bin/bash

print_help() {
	echo "Usage: ./maqetta.server.mac.command"
	echo ""
	echo "Options:"
	echo "  -h, --help                  show this message"
	echo ""
	echo " => Further options are read from 'maqetta.conf' file."
}

while [ "${1+isset}" ]; do
	case "$1" in
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

#
# Check minimum Java version. Must be >= 1.5
#
check_java() {
	javaversion=`java -version 2>&1 | grep "java version"`
	if [ -z "$javaversion" ]; then
		echo Unable to determine which version of Java is installed on this machine
	else
		majorversionnumber=`echo "$javaversion" | sed 's/^[^0-9]*\([0-9][0-9]*\)\..*$/\1/'`
		minorversionnumber=`echo "$javaversion" | sed 's/^[^0-9]*[0-9][0-9]*\.\([0-9][0-9]*\).*$/\1/'`
		echo Java version=$majorversionnumber.$minorversionnumber
		if [[ $majorversionnumber -lt 1 || $minorversionnumber -lt 5 ]]; then
			echo "Error: Maqetta requires Java 1.5"
			exit 1
		fi
	fi
}

MAQ_BASE=`dirname "$0"`
JAVA_ARGS=""
# XXX Issue 2941 - Need to specify "-clean" flag due to possible Eclipse bug.
APP_ARGS="-console -noExit -clean"

#
# Function which reads in configuration options
#
read_conf()
{
	# check for configuration file
	MAQ_CONFIG=$MAQ_BASE/maqetta.conf
	test -r $MAQ_CONFIG || { echo "$MAQ_CONFIG not found"; exit 1; }

	# Some props (such as 'admin' password) **must** be in a config file; passing
	# them on the command line won't work.
	JAVA_ARGS="${JAVA_ARGS} -Dorion.core.configFile=${MAQ_CONFIG}"

	# read config
	while read line
	do
		key=${line%%=*}
		val=${line#*=}

		case "$key" in
			"maqetta.baseDirectory")
				base_dir=$val
				# also pass in as "-data" property
				APP_ARGS="${APP_ARGS} -data ${val}"
				;;
			"maqetta.extra_java_args")
				extra_java_args=$val
				continue	# don't add to JAVA_ARGS
				;;
			"org.eclipse.equinox.http.jetty.http.port")
				port=$val
				;;
		esac

		JAVA_ARGS="${JAVA_ARGS} -D${line}"

	done < <(grep -v "^#" ${MAQ_CONFIG} | grep -v "^\s*$")

	# get jar path
	jarFilePath=`ls "$MAQ_BASE"/plugins/org.eclipse.equinox.launcher*.jar`
	JAR_FILE="-jar ${jarFilePath}"
}

do_start() {
	echo
	echo !!!!!!!!!!!!!!
	echo "NOTE: CLOSING THIS WINDOW WILL "
	echo "      STOP THE MAQETTA SERVER PROCESS"
	echo !!!!!!!!!!!!!
	echo

	if [ -z $base_dir ]; then
		base_dir="$MAQ_BASE"/users
		# Convert to absolute file name
		D=`dirname "$base_dir"`
		B=`basename "$base_dir"`
		base_dir="`cd \"$D\" 2>/dev/null && pwd || echo \"$D\"`/$B"
		# set default value
		JAVA_ARGS="${JAVA_ARGS} -Dmaqetta.baseDirectory=${base_dir}"
		APP_ARGS="${APP_ARGS} -data ${base_dir}"
	fi
	mkdir -p "$base_dir"
	echo "Using directory: ${base_dir}"

	if [ -z $port ]; then
		# defaults to 8080
		port=8080
	fi
	echo "Start your browser at: http://localhost:$port/maqetta"

	echo
	echo "Type \"exit\" or Ctrl-C to stop the server."
	echo

	java $JAVA_ARGS ${extra_java_args} $JAR_FILE $APP_ARGS
}


check_java
read_conf
do_start
