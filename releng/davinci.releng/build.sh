#! /bin/sh

# Path to eclipse directory inclusive. The application directory is
# usually, but not always, named 'eclipse'. It has sub-directories
# /configuration, /features, /plugins, etc. No trailing slash.
#

if [ ! ${ECLIPSE_HOME} ]
then
	export baseLocation="/path/to/eclipse"
else
	export baseLocation=${ECLIPSE_HOME}
fi
echo "Using ${baseLocation} Eclipse for build..."
#
# Directory in which to do the build. No trailing slash.
#
if [ ! ${MAQETTA_BUILD_DIR} ]
then
    export buildDirectory="/tmp"
else
    export buildDirectory=${MAQETTA_BUILD_DIR}
fi

#
# If 'maqettaCode' is set, copy files from your local working copy instead of GitHub repository
#
# Note: This build feature SHOULD NOT be used for production builds.
#
# export maqettaCode="/Users/childsb/dev/git/maqetta"
#
# Directory containing build.xml (this should not have to be changed in most cases).
# No trailing slash.
#
if [ ${maqettaCode} ]
then
    export relEngDir="${maqettaCode}/releng/davinci.releng"
else
    export relEngDir="${buildDirectory}/repository/maqetta/releng/davinci.releng"
fi

#
# GitHub read-only URL for Maqetta repository. This should not change.
#
export gitRepository="git://github.com/maqetta/maqetta.git"

#
# Windowing System, Operating System and processor Architecture settings
#
# Note: See ${baseLocation}/plugins/org.eclipse.equinox.launcher.xxx.yyy.xxx/
#       to determine your settings, they should be similar to 'cocoa.macosx.x86_64'
#
if [ ${MAQETTA_WS} ]
then
    export myWS=${MAQETTA_WS}
else
    export myWS="cocoa"
fi
if [ ${MAQETTA_OS} ]
then
    export myOS=${MAQETTA_OS}
else
    export myOS="macosx"
fi
if [ ${MAQETTA_ARCH} ]
then
    export myArch=${MAQETTA_ARCH}
else
    export myArch="x86_64"
fi

#
# save off the current directory
#
currentDirectory=`pwd`

if [ ! ${maqettaCode} ]
then
    #
    # Set up for and pull down the latest code from GitHub
    #
    if [ ! -d ${buildDirectory}/repository ]
    then
        echo "Making repository directory"
        mkdir -p ${buildDirectory}/repository
    fi

    #
    # If '.git' directory exists we need only pull
    #
    if [ -d ${buildDirectory}/repository/maqetta/.git ]
    then
        echo "Doing 'git pull'..."
        cd ${buildDirectory}/repository/maqetta
        git pull
    else
        echo "Cloning repository. This may take a few moments..."
        cd ${buildDirectory}/repository
        git clone ${gitRepository}
    fi
    echo "Done fetching maqetta core."
    #
    # Save repository revision level for later referrence
    #
    cd ${buildDirectory}/repository/maqetta
    git describe >${buildDirectory}/build.level
else
    if [ ! -e ${buildDirectory}/repository/maqetta ]
    then
        #
        # Create symlink to 'maqettaCode' repo at ${buildDirectory}/repository/maqetta -- Eclipse
        # build system requires that.
        #
        if [ ! -d ${buildDirectory}/repository ]
        then
            mkdir -p ${buildDirectory}/repository
        fi
        cd ${buildDirectory}/repository
        ln -s ${maqettaCode} maqetta
    fi
    
    cd ${maqettaCode}
    git describe >${buildDirectory}/build.level
fi

#
# Change directory to the build directory.
#
# Note: Many scripts use relative directory references making
#       running the build from this directory *imperative*.
#

cd ${buildDirectory}

#
# Run the Ant buildAll script from the davinci.releng project.
#
launcher="`ls ${baseLocation}/plugins/org.eclipse.equinox.launcher_*.jar`"
java -Ddeployment-type="external" -jar ${launcher} -application org.eclipse.ant.core.antRunner -buildfile ${relEngDir}/buildAll.xml -consoleLog

#
# save exit code for later
#
exitCode=$?

cd ${currentDirectory}

exit ${exitCode}