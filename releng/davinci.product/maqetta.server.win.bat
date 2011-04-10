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
set port=8080
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

FOR /F "tokens=*" %%R IN ('dir /b plugins\org.eclipse.equinox.launcher*.jar') DO SET EQUINOX=%%R
java -Dorg.eclipse.equinox.http.jetty.http.port=%port%  -Dorg.eclipse.equinox.http.jetty.context.path=/maqetta "-Dmaqetta.baseDirectory=%usersdir%" -jar "%scriptdir%plugins\%EQUINOX%" -console -noExit
