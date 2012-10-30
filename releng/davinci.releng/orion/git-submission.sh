#!/bin/bash
#
# When the map file has been updated, this can be used to generate
# the releng build submission report
# USAGE: git-submission.sh repoRoot repoURL last_tag build_tag [repoURL...] >report.txt
#


ROOT=$1; shift
rm -f /tmp/proj_changed_$$.txt /tmp/bug_list_$$.txt

while [ $# -gt 0 ]; do
	REPO="$1"; shift
	REPO_DIR=$( basename $REPO .git )
	LAST_TAG="$1"; shift
	BUILD_TAG="$1"; shift
	cd $ROOT/$REPO_DIR
	git diff --name-only ${LAST_TAG} ${BUILD_TAG} | cut -f2 -d/ | sort -u >>/tmp/proj_changed_$$.txt
	 
	
	git log --first-parent ${LAST_TAG}..${BUILD_TAG} \
		| grep '[Bb]ug[^0-9]*[0-9][0-9][0-9][0-9][0-9]*[^0-9]'  \
		| sed 's/.*[Bb]ug[^0-9]*\([0-9][0-9][0-9][0-9][0-9]*\)[^0-9].*$/\1/g' >>/tmp/bug_list_$$.txt
done

rm -f /tmp/bug_info_$$.txt

for BUG in $( cat /tmp/bug_list_$$.txt | sort -n -u ); do
	BUGT2=/tmp/buginfo_${BUG}_$$.txt
	curl -k https://bugs.eclipse.org/bugs/show_bug.cgi?id=${BUG}\&ctype=xml >$BUGT2 2>/dev/null
	TITLE=$( grep short_desc $BUGT2 | sed 's/^.*<short_desc.//g' | sed 's/<\/short_desc.*$//g' )
    STATUS=$( grep bug_status $BUGT2 | sed 's/^.*<bug_status.//g' | sed 's/<\/bug_status.*$//g' )
    if [ RESOLVED = "$STATUS" -o VERIFIED = "$STATUS" ]; then
        STATUS=$( grep '<resolution>' $BUGT2 | sed 's/^.*<resolution.//g' | sed 's/<\/resolution.*$//g' )
    fi
    echo + Bug $BUG - $TITLE \(${STATUS}\) >>/tmp/bug_info_$$.txt
done

echo The build contains the following changes:
cat /tmp/bug_info_$$.txt
echo ""
echo The following projects have changed:
cat /tmp/proj_changed_$$.txt | sort -u