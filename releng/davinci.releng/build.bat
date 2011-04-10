rem
rem  you must have some version of eclipse installed to build against
rem  create a directory to do the build in, build results will be in buildDirectory\result
rem

rem parent of the eclipse directory being build against
set base=C:\path\to\parent\of\eclipse 

rem name of eclipse directory (usually but not necessarily'eclipse'), has subdirs /plugin, /configuration, etc
set baseLocation=%base%\eclipse

rem version number of the launcher jar file, look at plugins/org.eclipse.equinox.launcher_*.jar, use just the number part
set launcherVersion=1.0.200.v20090520

rem directory to do the build in
set buildDirectory=c:\directory\to\build\in

rem directory containing build.xml
set relEngDir=%buildDirectory%\davinci.releng\buildAll.xml

rem url of repository
set svnRepository=https://xxxxxxxxxx

rem if maqettaCode is set, copy from your local workspace instead of svn checkout
set maqettaCode=c:\your\local\eclipse\workspace

rem svn user id (include --username)
set svnUser=--username xxxx@xxx.ibm.com

rem svn user password (include --password)
set svnPassword=--password xxxxx

rem look at plugins\org.eclipse.equinox.launcher.xxx.xxx.xxx\  (for windows, only difference is x86 vs x86_64)
set myOS=win32
set myWS=win32
set myArch=x86

cd %buildDirectory%
rem check out the build files
svn checkout --force %svnUser% %svnPassword% %svnRepository%/releng/davinci.releng 

java -jar %baseLocation%\plugins\org.eclipse.equinox.launcher_%launcherVersion%.jar    -application org.eclipse.ant.core.antRunner -buildfile %relEngDir%\buildAll.xml   