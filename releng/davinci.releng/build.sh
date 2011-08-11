#! /bin/sh

# Path to eclipse directory inclusive. The application directory is
# usually, but not always, named 'eclipse'. It has sub-directories
# /configuration, /features, /plugins, etc. No trailing slash.
#
# Run Dojo build or not

dojoBuild=true

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
    export MAQETTA_BUILD_DIR="/tmp"
fi

echo "Using ${MAQETTA_BUILD_DIR} for build out directory.."

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
    export relEngDir="${MAQETTA_BUILD_DIR}/repository/maqetta/releng/davinci.releng"
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
# Set deployment type, default to "external"
#

if [ ! ${MAQETTA_DEPLOYMENT} ]
then
    MAQETTA_DEPLOYMENT="external"
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
    if [ ! -d ${MAQETTA_BUILD_DIR}/repository ]
    then
        echo "Making repository directory"
        mkdir -p ${MAQETTA_BUILD_DIR}/repository
    fi

    #
    # If '.git' directory exists we need only pull
    #
    if [ -d ${MAQETTA_BUILD_DIR}/repository/maqetta/.git ]
    then
        echo "Doing 'git pull'..."
        cd ${MAQETTA_BUILD_DIR}/repository/maqetta
        git pull
    else
        echo "Cloning repository. This may take a few moments..."
        cd ${MAQETTA_BUILD_DIR}/repository
        git clone ${gitRepository}
    fi
    echo "Done fetching maqetta core."
    #
    # Save repository revision level for later referrence
    #
    cd ${MAQETTA_BUILD_DIR}/repository/maqetta
    git describe >${MAQETTA_BUILD_DIR}/build.level
else
    if [ ! -e ${MAQETTA_BUILD_DIR}/repository/maqetta ]
    then
        #
        # Create symlink to 'maqettaCode' repo at ${MAQETTA_BUILD_DIR}/repository/maqetta -- Eclipse
        # build system requires that.
        #
        if [ ! -d ${MAQETTA_BUILD_DIR}/repository ]
        then
            mkdir -p ${MAQETTA_BUILD_DIR}/repository
        fi
        cd ${MAQETTA_BUILD_DIR}/repository
        ln -s ${maqettaCode} maqetta
    fi
    
    cd ${maqettaCode}
    git describe >${MAQETTA_BUILD_DIR}/build.level
fi

# Retrieve external equinox dependancies

equinoxGitRepo="git://git.eclipse.org/gitroot/equinox/rt.equinox.bundles.git/"

# Stable version of equinox to checkout 
equinoxBranch="remotes/origin/R3_6_maintenance"

# Set up for and pull down the latest code from GitHub
#
export equinoxRepo=${MAQETTA_BUILD_DIR}/repository/rt.equinox.bundles
#
if [ ! -f ${equinoxRepo}/.git ]
then
      echo "Cloning Equinox repository. This may take a few moments..."
      cd ${MAQETTA_BUILD_DIR}/repository
      git clone ${equinoxGitRepo}
fi

echo "Switching Equinox to branch ${equinoxBranch}..."
cd ${equinoxRepo}
git checkout ${equinoxBranch}


#
# Change directory to the build directory.
#
# Note: Many scripts use relative directory references making
#       running the build from this directory *imperative*.
#

cd ${MAQETTA_BUILD_DIR}

#
# Run the Ant buildAll script from the davinci.releng project.
#
export buildDirectory=${MAQETTA_BUILD_DIR}
echo "Starting ${MAQETTA_DEPLOYMENT} build...."
launcher="`ls ${baseLocation}/plugins/org.eclipse.equinox.launcher_*.jar`"
java -Ddeployment-type=${MAQETTA_DEPLOYMENT} -DdojoBuild=${dojoBuild} -jar ${launcher} -application org.eclipse.ant.core.antRunner -buildfile ${relEngDir}/buildAll.xml -consoleLog

#
# save exit code for later
#
exitCode=$?

cd ${currentDirectory}

exit ${exitCode}