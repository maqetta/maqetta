Setup
-----

To install dependencies, run:

	sudo gem install bundler
	sudo bundle install

If you are on Mac OS X, you will most likely need to first install the Command Line Tools.  Easiest way it to open up Xcode, go to Preferences > Downloads, and install the Command Line Tools.


Editing and Testing
-------------------

1. Run `middleman` in the top level directory (equivalent to `middleman server`). This will start a local web server which supports live-reloading after changes.
2. Open the local site at http://localhost:4567.
3. Make changes and review in browser.


Create News Article
-------------------

Run:

	middleman article "TITLE" [-d DATE]

If you don't specify DATE, it defaults to the current date.

New articles will be added to `/news` directory.


Set Front-page News Item
------------------------

A news item can be set on the front page, under the **Launch Maqetta** button.  This functionality is controlled by the `data/news.yml` file. Simply enter text and url.

If `text` is empty or commented out, then no news item is diplayed.


Deployment
----------

	middleman build
	middleman deploy
