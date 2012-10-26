@ECHO OFF
echo.

rem defaults
set port=50000
set consolePort=-console
set smtpServer=localhost


:loop
if "%1"=="" (
	goto end
) else (
	if "%1"=="-p" (
		set port="%2"
		shift
		shift
	) else if "%1"=="--port" (
		set port="%2"
		shift
		shift
	) else if "%1"=="-m" (
		set smtpServer="%2"
		shift
		shift
	) else if "%1"=="--smtpServer" (
		set smtpServer="%2"
		shift
		shift
	) else if "%1"=="-c" (
		set consolePort="%2"
		shift
		shift
	) else if "%1"=="--consolePort" (
		set consolePort="%2"
		shift
		shift
	) else if "%1"=="-h" (
		call:printHelp
		goto:EOF
	) else if "%1"=="--help" (
		call:printHelp
		goto:EOF
	) else (
		echo Error: Unknown option: %1
		goto:EOF
	)

	goto loop
)
:end

rem Make sure user has Java 1.5 installed
for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr /i "version"') do (
	set JAVAVER=%%g
)
rem strip quotation marks
set JAVAVER=%JAVAVER:"=%

for /f "delims=. tokens=1-3" %%v in ("%JAVAVER%") do (
	set JAVAVERMAJOR=%%v
	set JAVAVERMINOR=%%w
)

if defined %JAVAVERMAJOR (
  echo Java version: %JAVAVER%
) else (
	echo Unable to determine which version of Java is installed on this machine
)

echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo NOTE: CLOSING THIS WINDOW WILL
echo       STOP THE MAQETTA SERVER PROCESS
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo.

rem #########################
rem Comment out logic to set default directories for XP and Vista
rem Instead, users directory will be in current folder
rem set usersdir=%APPDATA%
rem if "%usersdir%" == "" set usersdir=%USERPROFILE%\Application Data
rem set usersdir=%usersdir%\maqetta\users
rem #########################

FOR /R plugins %%R IN (org.eclipse.equinox.launcher*.jar) DO SET EQUINOX=%%R
echo Using jar: "%EQUINOX%"

set scriptdir=%~dp0
set usersdir=%scriptdir%users
mkdir "%usersdir%" 2>nul
echo Using directory: %usersdir%

echo.
echo start your browser at http://localhost:%port%/maqetta

rem XXX Issue 2941 - Need to specify "-clean" flag due to possible Eclipse bug.
java -Dorg.eclipse.equinox.http.jetty.http.port=%port%  -Dmaqetta.localInstall=true -Dmaqetta.baseDirectory="%usersdir%" -DloginUrl="/maqetta/welcome" -Dsmtp.mailServer=$smtpServer -jar "%EQUINOX%" %consolePort% -noExit -clean


goto :EOF

:printHelp
	echo Usage: ./maqetta.local.mac.command [OPTION]...
	echo.
	echo off
	echo Options:
	echo  -p^, --port ^<port^>           server listens on port # ^<port^>^; defaults to 50000
	echo  -m^, --smtpServer ^<hostname^> provide the hostname of an SMTP server^; defaults to localhost
	echo  -c^, --consolePort ^<port^>    enable console, listening on port number ^<port^>
	echo  -h^, --help                  show this message
  GOTO :EOF

