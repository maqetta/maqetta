#! /bin/sh

#
# Directory in which to do the build. No trailing slash.
#
export buildDirectory="/Users/wayne/work/build"

#
# Path to parent directory of the eclipse application directory.
# That is, if eclipse is installed in '/usr/local/eclipse', this property
# would be set as 'base="/usr/local"'. No trailing slash.
#
export base="/path/to/eclipse/parent/directory"

#
# Path to eclipse directory inclusive. The application directory is
# usually, but not always, named 'eclipse'. It has sub-directories
# /configuration, /features, /plugins, etc. No trailing slash.
#
export baseLocation="${base}/eclipse"

#
# Version number of the launcher jar file. See ${baseLocation}/plugins/org.eclipse.equinox.launcher_*.jar.
# The launcher version is the set of alphanumeric characters between 'launcher_' and the '.' character
# before the 'jar' file name suffix.
#
launcherVersion="1.1.1.R36x_v20101122_1400"

#
# If 'maqettaCode' is set, copy files from your local working copy instead of GitHub repository
#
# Note: This build feature SHOULD NOT be used for production builds.
#
#export maqettaCode="/path/to/working/copy"

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
cd ${buildDirectory}

#
# Run the Ant buildAll script from the davinci.releng project.
#
java -jar ${baseLocation}/plugins/org.eclipse.equinox.launcher_${launcherVersion}.jar -application org.eclipse.ant.core.antRunner -buildfile ${relEngDir}/buildAll.xml