#!/bin/bash 
#
#
# example usage - you must have your repos checked out on the branch you
# expect to tag.
#
# USAGE: repoRoot relengRoot repoURL [repoURL]*
#    repoRoot   - absolute path to a folder containing cloned git repositories
#    relengRoot - asolute path to releng project containing map files
#    repoURL    - git repository urls to tag, must match entries in the map files
# EXAMPLE: git-map.sh  \
#   /opt/pwebster/git/eclipse \
#   /opt/pwebster/workspaces/gitMigration/org.eclipse.releng \
#   git://git.eclipse.org/gitroot/platform/eclipse.platform.runtime.git \
#   git://git.eclipse.org/gitroot/platform/eclipse.platform.ui.git >maps.txt
# examine the file
# grep -v ^OK maps.txt >run.txt
# /bin/bash run.txt
#

PLATFORM=$( uname -s )

get_repo_tag () {
	REPO=$1
	REPO_DIR=$( basename $REPO .git )
	cd $ROOT/$REPO_DIR
	REPO_COMMIT=$( git rev-list -1 HEAD  )
	NEW_DATE=$( git log -1 --format="%ct" "$REPO_COMMIT" )
	if [ "$PLATFORM" == "Darwin" ]; then
		echo v$( date -u -j -f "%s" "$NEW_DATE" "+%Y%m%d-%H%M" )
	else
		echo v$( date -u --date="@$NEW_DATE"  "+%Y%m%d-%H%M" )
	fi
}

tag_repo_commit () {
	REPO=$1
	REPO_DIR=$( basename $REPO .git )
	NEW_TAG=$( get_repo_tag $REPO )
	cd $ROOT/$REPO_DIR
	REPO_COMMIT=$( git rev-list -1 HEAD  )
	if ! ( git log -1  --format="%d" "$REPO_COMMIT" | grep "[ (]$NEW_TAG[,)]" >/dev/null); then
		OLD_TAG=$( git log --pretty=oneline --decorate | grep "[ (][vI][0-9]" \
			| head -1 | sed 's/^[^(]* (.*\([vI][0-9][0-9][0-9][0-9]\)/\1/g'   | sed 's/[,)].*$//g' ) 
		SUBMISSION_ARGS="$SUBMISSION_ARGS $REPO $OLD_TAG $NEW_TAG"
		echo "#OK Executed: cd $ROOT/$REPO_DIR \; git tag \"$NEW_TAG\" \"$REPO_COMMIT\""
		cd $ROOT/$REPO_DIR ; git tag "$NEW_TAG" "$REPO_COMMIT"
	fi
}

update_map () {
	#echo update_map "$@"
	REPO=$1
	REPO_DIR=$( basename $REPO .git )
	MAP=$2
	cd $ROOT/$REPO_DIR
	grep "repo=${REPO}," "$MAP" >/tmp/maplines_$$.txt
	if [ ! -s /tmp/maplines_$$.txt ]; then
		return
	fi
	while read LINE; do
		LINE_START=$( echo $LINE | sed 's/^\([^=]*\)=.*$/\1/g' )
		PROJ_PATH=$( echo $LINE | sed 's/^.*path=//g' )
		CURRENT_TAG=$( echo $LINE | sed 's/.*tag=\([^,]*\),.*$/\1/g' )
		LAST_COMMIT=$( git rev-list -1 HEAD -- "$PROJ_PATH" )
        if [ -z "$LAST_COMMIT" ]; then
            echo "#SKIPPING $LINE_START, no commits for $PROJ_PATH"
            continue
        fi
		
		if ! ( git tag --contains $LAST_COMMIT | grep $CURRENT_TAG >/dev/null ); then
			NEW_DATE=$( git log -1 --format="%ct" "$LAST_COMMIT" )		
			if [ "$PLATFORM" == "Darwin" ]; then
				NEW_TAG=v$( date -u -j -f "%s" "$NEW_DATE" "+%Y%m%d-%H%M" )
			else
				NEW_TAG=v$( date -u --date="@$NEW_DATE"  "+%Y%m%d-%H%M" )
			fi
			
			if ! ( git log -1  --format="%d" "$LAST_COMMIT" | grep "[ (]$NEW_TAG[,)]" >/dev/null); then
				echo "#OK Executed: cd $ROOT/$REPO_DIR \; git tag \"$NEW_TAG\" \"$LAST_COMMIT\""
				cd $ROOT/$REPO_DIR ; git tag "$NEW_TAG" "$LAST_COMMIT"
			fi
			echo sed "'s/$LINE_START=GIT,tag=$CURRENT_TAG/$LINE_START=GIT,tag=$NEW_TAG/g'" $MAP \>/tmp/t1_$$.txt \; mv /tmp/t1_$$.txt $MAP
		else
			echo OK $LINE_START $CURRENT_TAG 
		fi
	done </tmp/maplines_$$.txt
	rm -f /tmp/maplines_$$.txt
	echo \( cd $ROOT/$REPO_DIR \; git push --tags \)
}


STATUS=OK
STATUS_MSG=""
LATEST_SUBMISSION=""
SUBMISSION_ARGS=""

if [ $# -lt 3 ]; then
  echo "USAGE: $0 repoRoot relengRoot repoURL [repoURL]*"
  exit 1
fi


ROOT=$1; shift
RELENG=$1; shift
REPOS="$@"



for REPO in $REPOS; do
	cd $ROOT
	tag_repo_commit $REPO
	MAPS=$( find $RELENG -name "*.map" -exec grep -l "repo=${REPO}," {} \; )
	if [ ! -z "$MAPS" ]; then
		for MAP in $MAPS; do
			update_map $REPO $MAP
		done
	fi
done

echo "/bin/bash git-submission.sh $ROOT $SUBMISSION_ARGS > report.txt"
