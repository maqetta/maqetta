#! /bin/sh
#
# Orion/Maqetta build script. 
#

#################### ORION BUILD START #############################

setProperties () {
	if  [ ! -z ${gitHttp} ]
	then
	    GIT_PROTOCOL="http"
	else
	    GIT_PROTOCOL="git"
	fi

	#
	# GitHub read-only URL for Maqetta repository. This should not change.
	#
	export gitRepository="${GIT_PROTOCOL}://github.com/maqetta/maqetta.git"
	
	#
	# Directory in which to do the build. No trailing slash.
	#
	if [ -z ${MAQETTA_BUILD_DIR} ]
	then
	    export MAQETTA_BUILD_DIR="/tmp/maqetta-build"
	fi
	
	if [ -z ${MAQETTA_BUILD_DIR} ]
	then	
		mkdir ${MAQETTA_BUILD_DIR}
	fi
	
	echo "Using ${MAQETTA_BUILD_DIR} for build out directory.."
	if  [ ! -z ${externalTag} ] 
	then
	  echo "Using external tag: ${externalTag}"
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
	#[ "${MAQETTA_DOJO_BUILD}" ] || 
	export MAQETTA_DOJO_BUILD=true
	export buildDirectory=${MAQETTA_BUILD_DIR}
	

	# --------------- ORION Props ---------------------
	#default values, overridden by command line
	writableBuildRoot=${MAQETTA_BUILD_DIR}
	supportDir=$writableBuildRoot/support
	mkdir -p $supportDir
	builderDir="${relEngDir}/orion/builder"
	relEngDir="${relEngDir}/orion"
	
	basebuilderBranch=R3_8
	publish=""
	user=childsb
	resultsEmail=orion-releng@eclipse.org
	
	buildType=I
	date=$(date +%Y%m%d)
	time=$(date +%H%M)
	timestamp=$date$time
	buildDirectory=$writableBuildRoot/$buildType$timestamp
	buildLabel=$buildType$date-$time
	#Properties for compilation boot classpaths
	export javaHome=/usr/lib/jvm/java-1.6.0-openjdk-1.6.0.0.x86_64
	JAVA60_HOME=/usr/lib/jvm/java-1.6.0-openjdk-1.6.0.0.x86_64
	JAVA50_HOME=/usr/lib/jvm/java-1.6.0-openjdk-1.6.0.0.x86_64
	j2se150="$JAVA50_HOME/jre/lib/rt.jar:$JAVA50_HOME/jre/lib/jsse.jar:$JAVA50_HOME/jre/lib/jce.jar:$JAVA50_HOME/jre/lib/charsets.jar"
	javase160="$JAVA60_HOME/jre/lib/resources.jar:$JAVA60_HOME/jre/lib/rt.jar:$JAVA60_HOME/jre/lib/jsse.jar:$JAVA60_HOME/jre/lib/jce.jar:$JAVA60_HOME/jre/lib/charsets.jar"

}


updateBaseBuilder () {
	cd ${supportDir}
    if [ ! -d org.eclipse.releng.basebuilder_${basebuilderBranch} ]; then
        echo "[start - `date +%H\:%M\:%S`] Get org.eclipse.releng.basebuilder_${basebuilderBranch}"
        #cmd="git clone git://dev.eclipse.org/org.eclipse.releng/org.eclipse.releng.basebuilder.git -b ${basebuilderBranch} org.eclipse.releng.basebuilder_${basebuilderBranch}"
        cmd="wget --no-verbose -O __bb.tar.gz http://git.eclipse.org/c/platform/eclipse.platform.releng.basebuilder.git/snapshot/${basebuilderBranch}.tar.gz"
        echo $cmd
        $cmd
        tar xpzf __bb.tar.gz
        rm __bb.tar.gz
        mv ${basebuilderBranch} org.eclipse.releng.basebuilder_${basebuilderBranch}
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
	    	git checkout --force ${externalTag}
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
}

build() {
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
	# java -Ddeployment-type=${MAQETTA_DEPLOYMENT} -DdojoBuild=${MAQETTA_DOJO_BUILD} -jar ${launcher} -application org.eclipse.ant.core.antRunner -buildfile ${relEngDir}/orion/buildAll.xml -consoleLog
	launcherJar=$supportDir/$( find org.eclipse.releng.basebuilder/ -name "org.eclipse.equinox.launcher_*.jar" | sort | head -1 )
	
	cmd="java -enableassertions -jar $launcherJar \
				-application org.eclipse.ant.core.antRunner \
				-buildfile ${relEngDir}/buildAll.xml \
				-Dbuilder=$builderDir \
				-Dbase=$writableBuildRoot \
				-DbuildType=$buildType -Dtimestamp=$timestamp -DbuildLabel=$buildLabel \
				-DgitUser=$user \
				-Ddeployment-type=${MAQETTA_DEPLOYMENT} \
				-DdojoBuild=${MAQETTA_DOJO_BUILD} \
				$tagMaps $compareMaps $fetchTag $publish \
				-DJ2SE-1.5=$j2se150 \
				-DJavaSE-1.6=$javase160"
	$cmd
}

tagRepositories() {
	#do this for I builds and if -noTag was not specified
	if [ "$buildType" == "I" -a -z "$noTag" ]; then 
		pushd $writableBuildRoot/gitClones
	
		#pull the server first to get the latest map files before updating with new tags
		cd $writableBuildRoot/gitClones/org.eclipse.orion.server
		git pull
	
		cd $writableBuildRoot/repository/maqetta
		git pull

		cd $writableBuildRoot/gitClones
		/bin/bash $writableBuildRoot/gitClones/git-map.sh \
			$writableBuildRoot/gitClones \
			$writableBuildRoot/gitClones/org.eclipse.orion.server/releng/org.eclipse.orion.releng \
			git://git.eclipse.org/gitroot/orion/org.eclipse.orion.server.git \
			git://git.eclipse.org/gitroot/orion/org.eclipse.orion.client.git > maps.txt
			
		grep -v ^OK maps.txt | grep -v ^Executed >run.txt
		/bin/bash run.txt
		
		mkdir $writableBuildRoot/$buildType$timestamp
		cp report.txt $writableBuildRoot/$buildType$timestamp
		
		cd $writableBuildRoot/gitClones/org.eclipse.orion.server
		git add releng/org.eclipse.orion.releng/maps/orion.map
		git commit -m "Releng build tagging for $buildType$timestamp"
		git tag -f $buildType$timestamp   #tag the map file change
		
		git push
		git push --tags
	
		popd
	fi
}

currentDirectory=`pwd`
setProperties
updateBaseBuilder
populateGit
build
#
# save exit code for later
#
exitCode=$?

cd ${currentDirectory}

exit ${exitCode}
