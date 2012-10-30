#! /bin/sh
#
# External build script.  This build script calls out to the external build for the majority of work
#

print_help() {
    echo "Usage: $0 [OPTION]..."
    echo ""
    echo "Options:"
    echo " -t, --tag <tag>          tag to build"
    echo " --git-http               use HTTP protocol when cloning from git"
    echo " -h, --help               show this message"
    echo ""
}

# parse options
while [ "${1+isset}" ]; do
    case "$1" in
        -et|--externalTag)
            externalTag=$2
            shift 2
            ;;
        -t|--tag)
            externalTag=$2
            shift 2
            ;;
        --git-http)
            gitHttp=1
            shift 1
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

if  [ ! -z ${externalTag} ] 
then
  echo "Using external tag: ${externalTag}"
fi

if  [ ! -z ${gitHttp} ] 
then
    GIT_PROTOCOL="http"
else
    GIT_PROTOCOL="git"
fi

#
# Path to eclipse directory inclusive. The application directory is
# usually, but not always, named 'eclipse'. It has sub-directories
# /configuration, /features, /plugins, etc. No trailing slash.
#

if [ -z ${ECLIPSE_HOME} ]
then
	export baseLocation="/path/to/eclipse"
else
	export baseLocation=${ECLIPSE_HOME}
fi

# run dojo build by default
if [ -z "${MAQETTA_DOJO_BUILD}" ] 
then
	export MAQETTA_DOJO_BUILD=true
fi

#
# GitHub read-only URL for Maqetta repository. This should not change.
#
export gitRepository="${GIT_PROTOCOL}://github.com/maqetta/maqetta.git"

echo "Using ${baseLocation} Eclipse for build..."
#
# Directory in which to do the build. No trailing slash.
#
if [ -z ${MAQETTA_BUILD_DIR} ]
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
export relEngDir="${MAQETTA_BUILD_DIR}/repository/maqetta/releng/davinci.releng"
#
# Windowing System, Operating System and processor Architecture settings
#
# Note: See ${baseLocation}/plugins/org.eclipse.equinox.launcher.xxx.yyy.xxx/
#       to determine your settings, they should be similar to 'cocoa.macosx.x86_64'
#
export myWS=${MAQETTA_WS:=cocoa}
export myOS=${MAQETTA_OS:=macosx}
export myArch=${MAQETTA_ARCH:=x86_64}

#
# Set deployment type, default to "external"
#

#
# save off the current directory
#
currentDirectory=`pwd`

if [ -z ${maqettaCode} ]
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
    if [ ! -z ${externalTag} ]
    then
    	echo ""
    	echo "Switching to tag ${externalTag}"
    	cd ${MAQETTA_BUILD_DIR}/repository/maqetta
    	git checkout ${externalTag}
    fi
    #
    # Save repository revision level for later referrence
    #
    cd ${MAQETTA_BUILD_DIR}/repository/maqetta
    git log -1 | head -1 >${MAQETTA_BUILD_DIR}/build.level
    
    echo "Initializing and updating submodules..."
	git submodule update --init --recursive
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
    git log -1 | head -1 >${MAQETTA_BUILD_DIR}/build.level
fi

# Retrieve external equinox dependancies

equinoxGitRepo="${GIT_PROTOCOL}://git.eclipse.org/gitroot/equinox/rt.equinox.bundles.git/"

# Stable version of equinox to checkout 
equinoxBranch="R3_6_maintenance"

# Set up for and pull down the latest code from GitHub
#
export equinoxRepo=${MAQETTA_BUILD_DIR}/repository/rt.equinox.bundles
#
if [ ! -e ${equinoxRepo}/.git ]
then
      echo "Cloning Equinox repository. This may take a few moments..."
      cd ${MAQETTA_BUILD_DIR}/repository
      git clone ${equinoxGitRepo}
fi

echo "Switching Equinox to branch ${equinoxBranch}..."
cd ${equinoxRepo}
git checkout -f -B ${equinoxBranch} remotes/origin/${equinoxBranch}


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
echo "Starting ${MAQETTA_DEPLOYMENT:=external} build...."
launcher="`ls ${baseLocation}/plugins/org.eclipse.equinox.launcher_*.jar`"
java -Ddeployment-type=${MAQETTA_DEPLOYMENT} -DdojoBuild=${MAQETTA_DOJO_BUILD} -jar ${launcher} -application org.eclipse.ant.core.antRunner -buildfile ${relEngDir}/buildAll.xml -consoleLog

#
# save exit code for later
#
exitCode=$?

cd ${currentDirectory}

exit ${exitCode}
