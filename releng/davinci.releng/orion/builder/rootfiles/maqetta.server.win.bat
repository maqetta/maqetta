@ECHO OFF
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo NOTE: CLOSING THIS WINDOW WILL
echo       STOP THE MAQETTA SERVER PROCESS
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo.

:: set versionstring to null initially
set versionstring=
for /f "tokens=*" %%i in ('java -version 2^>^&1') do (
	for /f "delims=" %%j in ('echo %%i ^| find /c "version"') do (
		:: skip any lines that don't have string "version" in them
		if "%%j"=="1" (
			set j1=%%j
			:: 3rd token is version#, quoted
            for /f "tokens=3 delims= " %%k in ('echo %%i') do (
				set k1=%%k
			)
		)
	)
)
set versionstring=%k1%
if "%versionstring%" == "" goto warning

:: Remove quotes in version number
for /f %%a in ('echo %%versionstring%%') do set k2=%%~a
:: pull first and second tokens
set major=
for /f "tokens=1 delims=." %%t in ('echo %%k2%%') do (
	:: grab first token
	set major=%%t
)
if "%major%" == "" goto warning
set minor=
for /f "tokens=2 delims=." %%t in ('echo %%k2%%') do (
	:: grab second token
	set minor=%%t
)
if "%minor%" == "" goto warning

:: build a 2-dijit numeric out of version#, eg 16 for Java 1.6
set /a javaversion=%major%%minor%
if %javaversion% lss 16 (
	echo You need Java version 1.6 or greater. You have Java version %versionstring%
	pause
	goto end
)
goto javaversionok
:warning
echo WARNING: Could not determine what version of Java you have.

:javaversionok

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
echo Start your browser at http://localhost:%port%/maqetta

FOR /R plugins %%R IN (org.eclipse.equinox.launcher*.jar) DO SET EQUINOX=%%R
rem XXX Issue 2941 - Need to specify "-clean" flag due to possible Eclipse bug.
java -Dorg.eclipse.equinox.http.jetty.http.port=%port% -Dmaqetta.siteConfigDirectory="%scriptdir%\siteConfig" -Dorion.core.configFile="%scriptdir%\maqetta.conf" -jar "%EQUINOX%" -console -noExit -clean -data "%usersdir%"

:end

