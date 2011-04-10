#!/bin/bash

#version should be something like 0.9.0beta or 0.9.0
version=$1
#svnUserName is the name you use to connect to Dojo's subversion.
svnUserName=$2
#The svn revision number to use for tag. Should be a number, like 11203
svnRevision=$3

#If no svnRevision number, get the latest one from he repo.
if [ "$svnRevision" = "" ]; then
	svnRevision=`svn info http://svn.dojotoolkit.org/src/util/trunk/buildscripts/build_release.sh | grep Revision | sed 's/Revision: //'`
fi

tagName=release-$version
buildName=dojo-$tagName

echo "This is a RELEASE build for Dojo, you probably meant to run build.sh"
read -p "If you mean to create a tag for Dojo $version from r$svnRevision ... press a key to continue."

#Make the SVN tag.
svn mkdir -m "Using r$svnRevision to create a tag for the $version release." https://svn.dojotoolkit.org/src/tags/$tagName
svn copy -r $svnRevision https://svn.dojotoolkit.org/src/dojo/trunk  https://svn.dojotoolkit.org/src/tags/$tagName/dojo -m "Using r$svnRevision to create a tag for the $version release."
svn copy -r $svnRevision https://svn.dojotoolkit.org/src/dijit/trunk https://svn.dojotoolkit.org/src/tags/$tagName/dijit -m "Using r$svnRevision to create a tag for the $version release."
svn copy -r $svnRevision https://svn.dojotoolkit.org/src/dojox/trunk https://svn.dojotoolkit.org/src/tags/$tagName/dojox -m "Using r$svnRevision to create a tag for the $version release."
svn copy -r $svnRevision https://svn.dojotoolkit.org/src/util/trunk  https://svn.dojotoolkit.org/src/tags/$tagName/util -m "Using r$svnRevision to create a tag for the $version release."
svn copy -r $svnRevision https://svn.dojotoolkit.org/src/demos/trunk https://svn.dojotoolkit.org/src/tags/$tagName/demos -m "Using r$svnRevision to create a tag for the $version release."

#Check out the tag
mkdir ../../build
cd ../../build
svn co https://svn.dojotoolkit.org/src/tags/$tagName $buildName
cd $buildName/util/buildscripts

#Update the dojo version in the tag
java -jar ../shrinksafe/js.jar changeVersion.js $version ../../dojo/_base/_loader/bootstrap.js
cd ../../dojo
svn commit -m "Updating dojo version for the tag. \!strict" _base/_loader/bootstrap.js

#Erase the SVN dir and replace with an exported SVN contents.
cd ../..
rm -rf ./$buildName/
svn export http://svn.dojotoolkit.org/src/tags/$tagName $buildName

# clobber cruft that we don't want in builds
rm -rf ./$buildName/dijit/themes/noir
rm -rf ./$buildName/dijit/bench

#Make a shrinksafe bundle
shrinksafeName=$buildName-shrinksafe
cp -r $buildName/util/shrinksafe $buildName/util/$shrinksafeName
cd $buildName/util
zip -rq $shrinksafeName.zip $shrinksafeName/
tar -zcf $shrinksafeName.tar.gz $shrinksafeName/
mv $shrinksafeName.zip ../../
mv $shrinksafeName.tar.gz ../../
cd ../..
rm -rf $buildName/util/$shrinksafeName

#Make a -demos bundle (note, this is before build. Build profile=demos-all if you want to release them)
# the -demos archives are meant to be extracted from the same folder -src or release archives, and have
# a matching prefixed folder in the archive
demoName=$buildName-demos
zip -rq $demoName.zip $buildName/demos/
tar -zcf $demoName.tar.gz $buildName/demos/
# prevent demos/ from appearing in the -src build
rm -rf $buildName/demos

#Make a src bundle
srcName=$buildName-src
mv $buildName $srcName
zip -rq $srcName.zip $srcName/
tar -zcf $srcName.tar.gz $srcName/
mv $srcName $buildName

#Run the build.
cd $buildName/util/buildscripts/
chmod +x ./build.sh
./build.sh profile=standard version=$1 releaseName=$buildName cssOptimize=comments.keepLines optimize=shrinksafe.keepLines action=release 
# remove tests and demos, but only for the actual release:
chmod +x ./clean_release.sh
./clean_release.sh ../../release $buildName
cd ../../release/

#Pause to allow manual process of packing Dojo.
currDir=`pwd`
echo "You can find dojo in $currDir/$buildName/dojo/dojo.js"
read -p "Build Done. If you want to pack Dojo manually, do it now, then press Enter to continue build packaging..."

#Continuing with packaging up the release.
zip -rq $buildName.zip $buildName/
tar -zcf $buildName.tar.gz $buildName/
mv $buildName.zip ../../
mv $buildName.tar.gz ../../

#copy compressed and uncompressed Dojo to the root
cp $buildName/dojo/dojo.js* ../../

# remove the testless release build, and unpack a -src archive to rebuild from
cd ../../
rm -rf $buildName/
tar -xzvf $srcName.tar.gz
cd $srcName/util/buildscripts/

# build the version that will be extracted and live on downloads.dojotoolkit.org (with tests)
./build.sh action=release version=$1 profile=standard cssOptimize=comments.keepLines releaseName=$buildName copyTests=true mini=false

# cleanup the -src extraction, moving the newly built tree into place. 
cd ../../release
mv $buildName ../../
cd ..
rm -rf release/

# generate api.xml and api.json
cd util/docscripts/
php -q generate.php
mv api.* ../../../../build/
cd ../../../../

# make a folder structure appropriate for directly extracting on downloads.dojotoolkit.org
mv build release-$1
rm -rf release-$1/$srcName/
cd release-$1

# md5sum the release files
for i in *.zip; do md5sum $i > $i.md5; done
for i in *.gz; do md5sum $i > $i.md5; done
for i in *.js; do md5sum $i > $i.md5; done

# pack up the whole thing for easy copying
cd ..
tar -czvf dj-$1-dtk.tar.gz release-$1

#Finished.
outDirName=`pwd`
echo "Build complete. Files are in: $outDirName"
echo "A copy/paste command to push files to downloads.dojotoolkit.org with permission:"
echo "scp dj-$1-dtk.tar.gz download.dojotoolkit.org:/srv/www/vhosts/download.dojotoolkit.org"
echo "... then extract in place and rm dj-$1-dtk.tar.gz"
cd ../util/buildscripts
