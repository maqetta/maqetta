#!/bin/sh
#
# Migrate a "users" directory created by Maqetta Preview 5 for use by Preview 6.
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
	
	#
	# Change default location of 'maqetta' library; and ddd line for 'grids' library
	#
	echo "4/5. Update $libSettings"
	sed '
s|\(library id="maqetta" name="maqetta" version="0.3" virtualRoot="'"$eclipseDir"'\)"|\1lib/maqetta"|
s|\(</libraries>\)|<library id="gridx" name="gridx" version="1.0prebeta2" virtualRoot="'"$eclipseDir"'lib/dojo/gridx"/>\
\1|' <"$libSettings" >"$libSettings.new"
	mv "$libSettings.new" "$libSettings"
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
