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
    export buildDirectory=${MAQ_BUILD_DIR}
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
export myWS="cocoa"
export myOS="macosx"
export myArch="x86_64"

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
    cd ${maqettaCode}
    git describe >${buildDirectory}/build.level
fi

#
# Change directory to the build directory.
#
# Note: Many scripts use relative directory references making
#       running the build from this directory *imperative*.
#
# save off the current directory

currentDirectory=`pwd`

cd ${buildDirectory}

#
# Run the Ant buildAll script from the davinci.releng project.
#
launcher="`ls ${baseLocation}/plugins/org.eclipse.equinox.launcher_*.jar`"
java -Ddeployment-type="external" -jar ${launcher} -application org.eclipse.ant.core.antRunner -buildfile ${relEngDir}/buildAll.xml

cd ${currentDirectory}