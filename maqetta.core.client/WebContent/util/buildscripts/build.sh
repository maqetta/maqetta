#!/bin/sh
usage() {
cat <<-__EOF__;
builder wrapper USAGE: 
 $0 [bin=node|java] BUILDER_OPTIONS
              By default, if first argument does not start with "bin=",
               node will be used if available.
__EOF__
}

if [ "$#" = "0" ]; then
 usage
fi

for arg in $*
do
    case $arg in
    --help)
        usage
        ba="$ba $arg"
        ;;
    bin=node)
        use_node=0
        ;;
    bin=java)
        use_node=1
        ;;
    bin=*)
        echo "Invalid bin= option: only node/java is supported"
        exit 1
        ;;
    *)
        ba="$ba $arg"
        ;;
    esac
    shift
done

if [ -z "$use_node" ]; then
    which node > /dev/null 2>&1
    use_node=$?
fi

if [ "$use_node" = "0" ]; then
    cmd="node"
    cmdflags="../../dojo/dojo.js"
else
    cmd="java"
    cmdflags="-Xms256m -Xmx256m -cp ../shrinksafe/js.jar:../closureCompiler/compiler.jar:../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main  ../../dojo/dojo.js baseUrl=../../dojo"
fi

$cmd $cmdflags load=build $ba
