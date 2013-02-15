#! /bin/sh
# 
# Take a platform-specific Maqetta-Orion build archive and
# create a platform-independent archive, by removing the 
# platform specific bits.

print_help() {
	echo "Usage: ./make-neutral-build.sh maqetta-orion-I20120101-1234-linux.gtk.zip [-o maqetta-orion-I20120101-1234]"
	exit 1
}

if [ $# -eq 0 ]; then
	print_help
fi

ARCHIVE=$1

if [ $# -ne 1 ]; then
	if [ $2 != "-o" ]; then
		print_help
	fi
	NEWNAME=$3
fi

# create a temporary directory
timestamp=`date "+%Y%m%d%H%M"`
TMPDIR=__tmp_$timestamp
mkdir -p $TMPDIR

# unzip the archive
unzip -qq $ARCHIVE -d $TMPDIR

# remove the OS-specific files
cd $TMPDIR/maqetta
rm -r about.html about_files libcairo-swt.so maqetta.orion maqetta.ini orion orion.ini plugins/org.eclipse.equinox.launcher.gtk.* plugins/org.eclipse.core.filesystem.linux.*

# create a new archive
cd ..
if [ -z $NEWNAME ]; then
	NEWNAME=maqetta-orion-${timestamp}
fi
#tar cpjf ../$NEWNAME.tar.bz2 maqetta
zip -r -q -9 ../$NEWNAME.zip maqetta

# cleanup
cd ..
rm -r $TMPDIR
