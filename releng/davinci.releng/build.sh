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

echo "---------------------------------------- BUILD OUTPUT CUT -----------------------------------------------------------------------------"




#################### ORION BUILD START #############################


setProperties () {

	#
	# GitHub read-only URL for Maqetta repository. This should not change.
	#
	export gitRepository="${GIT_PROTOCOL}://github.com/maqetta/maqetta.git"
	
	#
	# Directory in which to do the build. No trailing slash.
	#
	if [ -z ${MAQETTA_BUILD_DIR} ]
	then
	    export MAQETTA_BUILD_DIR="/tmp"
	fi
	
	echo "Using ${MAQETTA_BUILD_DIR} for build out directory.."
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
	# Set deployment type, default to "external"
	#
	
	#
	# save off the current directory
	#
	# run dojo build by default
	[ "${MAQETTA_DOJO_BUILD}" ] || MAQETTA_DOJO_BUILD=true
	export buildDirectory=${MAQETTA_BUILD_DIR}
	

	# --------------- ORION Props ---------------------
	#default values, overridden by command line
	writableBuildRoot=${MAQETTA_BUILD_DIR}
	supportDir=$writableBuildRoot/support
	mkdir $supportDir
	builderDir=${MAQETTA_BUILD_DIR}/repository/maqetta/releng/davinci.releng/orion
	basebuilderBranch=R3_7
	publish=""
	user=childsb
	resultsEmail=orion-releng@eclipse.org
	
	buildType=I
	date=$(date +%Y%m%d)
	time=$(date +%H%M)
	timestamp=$date$time
	buildDirectory=$writableBuildRoot/$buildType$timestamp
	buildLabel=$buildType$date-$time
	javaHome=/shared/common/sun-jdk1.6.0_21_x64
	#Properties for compilation boot classpaths
	JAVA60_HOME=/Library/Java/Home
	JAVA50_HOME=/Library/Java/Home
	JAVA14_HOME=/Library/Java/Home
	#j2se142="/Library/Java/Home/lib/dt.jar:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/charsets.jar:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/jsee.jar:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/dt.jar:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/jce.jar:/System/Library/Frameworks/JavaVM.framework/Frameworks/JavaRuntimeSupport.framework/Resources/Java/JavaRuntimeSupport.jar"
	j2se142="/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/classes.jar:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/jce.jar:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/jsse.jar:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/ui.jar:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/alt-rt.jar:/System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/alt-string.jar"
	
	j2se150=${j2se142}
	javase160=${j2se142}
	#j2se142="/Library/Java/Home/lib/dt.jar:/Library/Java/Home/lib/deploy.jar:/Library/Java/Home/lib/apple_provider.jar:"
	#j2se150="$JAVA50_HOME/jre/lib/rt.jar:$JAVA50_HOME/jre/lib/jsse.jar:$JAVA50_HOME/jre/lib/jce.jar:$JAVA50_HOME/jre/lib/charsets.jar"
	#javase160="$JAVA60_HOME/jre/lib/resources.jar:$JAVA60_HOME/jre/lib/rt.jar:$JAVA60_HOME/jre/lib/jsse.jar:$JAVA60_HOME/jre/lib/jce.jar:$JAVA60_HOME/jre/lib/charsets.jar"
}


updateBaseBuilder () {
	cd ${supportDir}
    if [[ ! -d org.eclipse.releng.basebuilder_${basebuilderBranch} ]]; then
        echo "[start - `date +%H\:%M\:%S`] Get org.eclipse.releng.basebuilder_${basebuilderBranch}"
        cmd="cvs -d :pserver:anonymous@dev.eclipse.org:/cvsroot/eclipse $quietCVS ex -r $basebuilderBranch -d org.eclipse.releng.basebuilder_${basebuilderBranch} org.eclipse.releng.basebuilder"
        #cmd="git clone git://dev.eclipse.org/org.eclipse.releng/org.eclipse.releng.basebuilder.git -b ${basebuilderBranch} org.eclipse.releng.basebuilder_${basebuilderBranch}"
        echo $cmd
        $cmd
        echo "[finish - `date +%H\:%M\:%S`] Done getting org.eclipse.releng.basebuilder_${basebuilderBranch}"
    fi

    echo "[`date +%H\:%M\:%S`] Getting org.eclipse.releng.basebuilder_${basebuilderBranch}"
    rm org.eclipse.releng.basebuilder
    ln -s ${supportDir}/org.eclipse.releng.basebuilder_${basebuilderBranch} org.eclipse.releng.basebuilder
    echo "....... linking base builder: ${supportDir}/org.eclipse.releng.basebuilder_${basebuilderBranch} org.eclipse.releng.basebuilder"
    echo "[`date +%H\:%M\:%S`] Done setting org.eclipse.releng.basebuilder"
	
	
}


populateGit(){
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

	 # Retrieve external Orion dependancies

	orionGitRepoServer="http://git.eclipse.org/gitroot/orion/org.eclipse.orion.server.git"
	orionGitRepoClient="http://git.eclipse.org/gitroot/orion/org.eclipse.orion.client.git"
	
	# Stable version of equinox to checkout 
	orionBranch="master"
	
	# Set up for and pull down the latest code from GitHub
	#
	export orionServerRepo=${MAQETTA_BUILD_DIR}/repository/org.eclipse.orion.server
	export orionClientRepo=${MAQETTA_BUILD_DIR}/repository/org.eclipse.orion.client
	#
	if [ ! -e ${orionServerRepo}/.git ]
	then
	      echo "Cloning Orion Server repository. This may take a few moments..."
	      cd ${MAQETTA_BUILD_DIR}/repository
	      git clone ${orionGitRepoServer}
	fi
	if [ ! -e ${orionClientRepo}/.git ]
	then
	      echo "Cloning Orion Client repository. This may take a few moments..."
	      cd ${MAQETTA_BUILD_DIR}/repository
	      git clone ${orionGitRepoClient}
	    
	fi
	
	#mkdir $writableBuildRoot/gitClones
    #cd $writableBuildRoot/gitClones
	#echo "cloning git into ${writableBuildRoot}/gitClones"
	
	#echo "Cloning Orion Server repository. This may take a few moments..."
	#git clone http://git.eclipse.org/gitroot/orion/org.eclipse.orion.server.git
	#echo "Cloning Orion Client repository. This may take a few moments..."
	#git clone http://git.eclipse.org/gitroot/orion/org.eclipse.orion.client.git
    


}

build(){

	#
	# Change directory to the build directory.
	#
	# Note: Many scripts use relative directory references making
	#       running the build from this directory *imperative*.
	#
	
	cd ${MAQETTA_BUILD_DIR}
	
	echo "Starting ${MAQETTA_DEPLOYMENT:=external} build...."
	# launcher="`ls ${baseLocation}/plugins/org.eclipse.equinox.launcher_*.jar`"
	cd $supportDir
	# java -Ddeployment-type=${MAQETTA_DEPLOYMENT} -DdojoBuild=${MAQETTA_DOJO_BUILD} -jar ${launcher} -application org.eclipse.ant.core.antRunner -buildfile ${relEngDir}/buildAll.xml -consoleLog
	launcherJar=$supportDir/$( find org.eclipse.releng.basebuilder/ -name "org.eclipse.equinox.launcher_*.jar" | sort | head -1 )
	
	cmd="java -enableassertions -jar $launcherJar \
				-application org.eclipse.ant.core.antRunner \
				-buildfile ${relEngDir}/buildAll.xml \
				-Dbuilder=$builderDir/builder \
				-Dbase=$writableBuildRoot \
				-DbuildType=$buildType -Dtimestamp=$timestamp -DbuildLabel=$buildLabel \
				-DgitUser=$user \
				-Ddeployment-type=${MAQETTA_DEPLOYMENT} \
				-DdojoBuild=${MAQETTA_DOJO_BUILD}
				$tagMaps $compareMaps $fetchTag $publish 
				-DJ2SE-1.4=$j2se142 \
				-DJ2SE-1.5=$j2se150 \
				-DJavaSE-1.6=$javase160"
				
	
	$cmd
	
	
	
}

currentDirectory=`pwd`
#
setProperties
populateGit
#updateBaseBuilder
build
#
# save exit code for later
#
exitCode=$?

cd ${currentDirectory}

exit ${exitCode}







