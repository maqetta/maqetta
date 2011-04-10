#! /bin/sh

#
#  you must have some version of eclipse installed to build against
#

# parent of the eclipse directory being build against
export base="/path/to/applications/directory"

# name of eclipse directory  (usually but not necessarily'eclipse'), has subdirs /plugin, /configuration, etc
export baseLocation="${base}/eclipse"

# version number of the launcher jar file, look at  baseLocation/plugins/org.eclipse.equinox.launcher_*.jar, use just the number part
launcherVersion="1.1.1.R36x_v20101122_1400"

# directory to do the build in
export buildDirectory="/path/to/build/directory"

# directory containing build.xml (this should not have to be changed in most cases)
export relEngDir="${buildDirectory}/davinci.releng"

# url of repository
export svnRepository="https://xxxxxxxx.com/davinci/trunk"

# svn user id (include --username)
export svnUser="--username xxxx@xxx.ibm.com"

# svn user password (include --password)
export svnPassword="--password xxxxx"


# if maqettaCode is set, copy from your local workspace instead of svn checkout
#export maqettaCode="/path/to/your/local/eclipse/workspace"


# look at baseLocation/plugins/org.eclipse.equinox.launcher.xxx.yyy.xxx/  will be something like cocoa.macos.x86_64 
export  myOS="xxx"
export myWS="yyy"
export myArch="zzz"

cd ${buildDirectory}
# check out the build files
svn checkout --force ${svnUser} ${svnPassword} ${svnRepository}/releng/davinci.releng 



java -jar ${baseLocation}/plugins/org.eclipse.equinox.launcher_${launcherVersion}.jar -application org.eclipse.ant.core.antRunner -buildfile ${relnEngDir}buildAll.xml   