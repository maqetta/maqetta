How to update the *_oam.json files to contain latest descriptive metadata
extracted from Dojo's doc system
-------------------------------

This folder contains some Node.js utilities that should be run occasionally
to update the *_oam.json files so that they contain the latest descriptive
metadata extracted from the dojo documentation system.

Instructions:

(1) Install Node.js, along with sax and jsdom. Some supplemental notes from experience:
*  Had to install Node.js (which was simple)
*  Then I couldn't get jsdom@0.2.3 to install successfully in local ./node-modules.
*  Instead, I installed latest versions (sax, jsdom) and manually installed node-gyp
*  before jsdom (although not sure this was necessary), and could only get things working
*  by installing everything globally (-g) via sudo. Still got a warning message
*  on installing jsdom about optional module contextify not installing correctly,
*  but contextify doesn't seem to be necessary for this app.
*  So that Node finds the globally installed modules, had to edit ~/.profile to add this line 
*    export NODE_PATH="/usr/local/lib/node_modules"


(2) Off in a side directory, follow the instructions at:

   https://github.com/wkeese/api-viewer/blob/master/README.rst

After running the ./parse.sh step, there should be a js-doc-parse/details.xml file

(3) Replace the details.xml file in this folder with the one you just created

(4) Run this command:

node update_descriptive_metadata.js details.xml ../../metadata

