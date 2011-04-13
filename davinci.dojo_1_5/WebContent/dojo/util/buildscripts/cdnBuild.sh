#!/bin/bash

# only run this in a pristine export of an svn tag.
# It should only be run on unix, more specifically, where sha1sum is available.

#version should be something like 0.9.0beta or 0.9.0, should match the name of the svn export.
version=$1

if [ -z $version ]; then
    echo "Please pass in a version number"
    exit 1
fi

dobuild() {
	java -classpath ../shrinksafe/js.jar:../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main build.js profile=standard releaseName=$1 cssOptimize=comments.keepLines optimize=shrinksafe stripConsole=normal loader=xdomain xdDojoPath=$3 version=$1 copyTests=false mini=true action=release xdDojoScopeName=window[\(typeof\(djConfig\)\!\=\"undefined\"\&\&djConfig.scopeMap\&\&djConfig.scopeMap[0][1]\)\|\|\"dojo\"]
	mv ../../release/$1 ../../release/$1-cdn/$2
	cd ../../release/$1-cdn/$2
	zip -rq $1.zip $1/*
	sha1sum $1.zip > sha1.txt
	cd $1
	find . -type f -exec sha1sum {} >> ../sha1.txt \;
	cd ../../../../util/buildscripts
}

# Generate locale info
cd cldr
ant
cd ..

# Setup release area
mkdir ../../release
mkdir ../../release/$version-cdn
mkdir ../../release/$version-cdn/google
mkdir ../../release/$version-cdn/aol

# Google build
dobuild $version "google" "http://ajax.googleapis.com/ajax/libs/dojo/$version"
# AOL build
dobuild $version "aol" "http://o.aolcdn.com/dojo/$version"
