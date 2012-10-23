#!/bin/bash
#
# Migrate a "users" directory created by Maqetta Preview 6 for use by Preview 7.
#
# NOTE: This script MUST be run from the Maqetta 'users' directory
#

users=`pwd`

function migrate_project {
	path=$1
	libSettings="$path/.settings/libs.settings"

	# If this is an Eclipse project (check for presense of .project file), then
	# we need to create library paths beginning with "WebContent/".
	if [[ -f "$path/.project" ]]; then
		eclipseDir="WebContent/"
	else
		eclipseDir=""
	fi

	mainFolder="$path/$eclipseDir"
	
	#
	# Change default location of 'maqetta' library; and add line for 'grids' library
	#
	echo "4. Update $libSettings"
	sed '
s|id="dojo" name="dojo" version="1.7"|id="dojo" name="dojo" version="1.8"|
s|id="DojoThemes" name="DojoThemes" version="1.7"|id="DojoThemes" name="DojoThemes" required="true" version="1.8"|
s|id="gridx" name="gridx" version="[^"]*"|id="gridx" name="gridx" version="1.0.0"|
s|id="html" name="html" version="0.8"|id="html" name="html" required="true" version="0.8"|
s|id="maqetta" name="maqetta" version="0.3"|id="maqetta" name="maqetta" required="true" version="0.3"|
s|<library id="jquery-ui" name="jquery-ui" version="1.8.11" virtualRoot="[^"]*"/>||
s|<library id="yui" name="yui" version="2.8.2r1" virtualRoot="[^"]*"/>||
s|\(</libraries>\)|<library id="maqettaSamples" name="maqettaSamples" required="true" version="1.0" virtualRoot="'"$eclipseDir"'samples"/>\
\1|
s|\(</libraries>\)|<library id="zazl" name="zazl" required="true" version="0.3.0" virtualRoot="'"$eclipseDir"'lib/zazl"/>\
\1|
' <"$libSettings" >"$libSettings.new"
	mv "$libSettings.new" "$libSettings"

	#
	# Remove Sample files
	#
	echo "5. Remove samples"
	rm -f "${mainFolder}Sample1.html"
	rm -f "${mainFolder}Sample2.html"
	rm -f "${mainFolder}Sample3-Mobile.html"
	rm -f "${mainFolder}SampleBanner.jpg"
	rm -f "${mainFolder}SampleJs.js"
	rm -rf "${mainFolder}sample_data"

	#
	# Remove 'maqetta' library files script tags
	#
	echo "6. Edit HTML files"
	find "$mainFolder" \( -name "*.html" -o -name "*.html.workingcopy" \) \
			-exec sed -i '
s|<script type="text/javascript" src="[\./]*/maqetta/maqetta.js"></script>||
s|<script type="text/javascript" src="[\./]*/maqetta/States.js"></script>||
' {} \;

	#
	# Update version in Dojo path.
	#
	themesFolder="${mainFolder}themes"
	if [[ -d "$themesFolder" ]]; then
		echo "7. Update dojo-theme-editor.html"
		find "$themesFolder" -name dojo-theme-editor.html \
				-exec sed -i 's|/maqetta/app/static/lib/dojo/1.7|/maqetta/app/static/lib/dojo/1.8|g' {} \;
	fi
}

function migrate_workspace {
	path=$1
	name=`basename "$path"`
	re="_Guest_[0-9]+"
	if [[ "$name" =~ $re ]]; then
		echo "2. delete guest workspace $path"
		rm -r "$path"
	else
		#
		# migrating user workspace
		#
		
		echo "3. delete $path/.review"
		rm -rf "$path/.review"

		# migrate project
		for i in "$path"/*; do
			if [[ -d "$i" ]]; then
				migrate_project "$i"
			fi
		done
	fi
}

#
# delete top-level <users>/.review
#
echo "1. delete top-level $users/.review dir"
rm -rf "$users/.review"

# migrate user workspaces
for i in "$users"/*; do
	if [[ -d "$i" ]]; then
		migrate_workspace "$i"
	fi
done

