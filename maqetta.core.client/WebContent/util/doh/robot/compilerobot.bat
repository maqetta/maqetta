setlocal
set JDK14_HOME=C:\j2sdk1.4.2_19
del DOHRobot*.class
%JDK14_HOME%\bin\javac -target 1.4 -classpath %JDK14_HOME%\jre\lib\plugin.jar DOHRobot.java
rem del DOHRobot.jar
%JDK14_HOME%\bin\jar xvf DOHRobot.jar META-INF
%JDK14_HOME%\bin\jar cvf DOHRobot.jar DOHRobot*.class META-INF
rem %JDK14_HOME%\bin\jarsigner -keystore ./dohrobot DOHRobot.jar dojo <key
del DOHRobot*.class
endlocal
