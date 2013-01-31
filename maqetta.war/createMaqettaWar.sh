#!/bin/sh
#
# Update an existing WAR with plugins from a new build.
# 

print_help() {
	echo "Usage: ./createMaqettaWar.sh [WAR dir] [nightly build]"
	echo ""
	echo "where:"
	echo "  [WAR dir]               dir of recent WAR build"
	echo "  [nightly build dir]     dir containing nightly build (most likely"
	echo "                           from 'orion-war' branch)"
}

war="$1"
nightly="$2"

if [ "$#" != 2 ]; then
	print_help
	exit
fi

if [ ! -d $war ]; then
	echo "[$war] is not a valid directory"
	exit
fi
if [ ! -d $nightly ]; then
	echo "[$nightly] is not a valid directory"
	exit
fi

webinf="$war/WEB-INF"
if [ ! -d "$webinf" ]; then
	echo "WAR dir does not contain a WEB-INF dir"
	exit
fi

mv "$webinf/configuration" "$webinf/configuration-old"
cp -R "$nightly/configuration" "$webinf"

bundles_info="$webinf/configuration/org.eclipse.equinox.simpleconfigurator/bundles.info"
# 1. comment out javax.servlet entries
# 2. auto-start the http.registry plugin
sed '
s|\(javax.servlet\)|#\1|
s|org.eclipse.equinox.http.registry,\(.*\),false|org.eclipse.equinox.http.registry,\1,true|
' < "$bundles_info" > "$bundles_info.new"
# 3. add entries for servletbridge plugins
echo "org.eclipse.equinox.http.servletbridge,1.0.200.201301171751,plugins/org.eclipse.equinox.http.servletbridge_1.0.200.201301171751.jar,2,true
org.eclipse.equinox.servletbridge.extensionbundle,1.2.0.201301171751,plugins/org.eclipse.equinox.servletbridge.extensionbundle_1.2.0.201301171751.jar,4,false" >> "$bundles_info.new"
mv "$bundles_info.new" "$bundles_info"

mv "$webinf/features" "$webinf/features-old"
cp -R "$nightly/features" "$webinf"
mv "$webinf"/features-old/org.eclipse.equinox.server.servletbridge* "$webinf"/features/

mv "$webinf/plugins" "$webinf/plugins-old"
cp -R "$nightly/plugins" "$webinf"
mv "$webinf"/plugins-old/*servletbridge* "$webinf"/plugins/

# cleanup
rm -r "$webinf/configuration-old"
rm -r "$webinf/features-old"
rm -r "$webinf/plugins-old"
