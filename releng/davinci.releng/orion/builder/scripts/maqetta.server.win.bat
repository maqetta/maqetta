@ECHO OFF
echo.
echo Java version:
java -version
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo NOTE: CLOSING THIS WINDOW WILL
echo       STOP THE MAQETTA SERVER PROCESS
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo.

set port=50000
set scriptdir=%~dp0

rem #########################
rem Comment out logic to set default directories for XP and Vista
rem Instead, users directory will be in current folder
rem set usersdir=%APPDATA%
rem if "%usersdir%" == "" set usersdir=%USERPROFILE%\Application Data
rem set usersdir=%usersdir%\maqetta\users
rem #########################
set usersdir=%scriptdir%users
mkdir "%usersdir%" 2>nul
echo Using directory : %usersdir%

echo start your browser at http://localhost:%port%/maqetta
FOR /R plugins %%R IN (org.eclipse.equinox.launcher*.jar) DO SET EQUINOX=%%R
rem XXX Issue 2941 - Need to specify "-clean" flag due to possible Eclipse bug.
java -Dorg.eclipse.equinox.http.jetty.http.port=%port%  -Dmaqetta.siteConfigDirectory="%scriptdir%\siteConfig" -Dmaqetta.baseDirectory="%usersdir%" -Dorion.core.configFile="%scriptdir%\maqetta.conf" -jar "%EQUINOX%" -console -noExit -clean
