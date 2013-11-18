---
title: Maqetta Release 10
date: 2013-04-29 14:15 -05:00
tags:
---

We have updated Maqetta.org with ***Maqetta Release 10***. There are a large number of improvements in this release ([read the full release notes](http://app.maqetta.org/maqetta/app/docs/index.html#releasenotes/release10)).

We are not aware of any migration issues and believe that content create in Release 9 should work with Release 10.

#### Release 10 highlights:

* **Upload ZIP from local file system** - With Release 10, we have added an the ability to upload a ZIP file from your local file system into your cloud workspace. Maqetta will expand the contents of the ZIP and store the embedded files within a target folder in your cloud workspace.
* **Clone existing project and "Save as project template"** - With Release 10, we have added a series of features that make it more convenient to work with projects. The two main new features are the ability to clone an existing project, and the ability to save the current project as a "project template" that you or your colleagues can use in the future.
* **Files palette UI changes** - changes to toolbar and context menus - With Release 10, the File palette has a redesigned toolbar, and the context menu has been changed.
* **Several new clipart icons** - Release 10 adds the following new clipart images: Cellphone, Computer, Copy, Delete, Edit, Error, Fatal, Folder, GraphBar, GraphLine, GraphPie, Info, Laptop, Paste, ProgressBar, Record, Refresh, Save, Server, Table, Tablet, WaitingPending, Warning.
* **onChange event support** - The onChange event has been added to the Events palette.
* **Source edits are now undo-able** - If you change HTML source code in the Maqetta source editor (either in source view or one of the split views), those changes are now undoable. 
* **Source editing improvements for mobile applications** - We fixed some problems when doing source editing of multi-view mobile applications.
* **Can now re-order application states using drag/drop** - In the Scenes palette, you can now re-order application states by dragging one of the existing application states to a new position.
* **Updated to Eclipse Orion 2.0** - Maqetta now builds on top of Orion 2.0 (upgraded from v0.5). A few new features are available in the source editor, such as bracket matching and a folding ruler for comments when editing JS and CSS. For more information, please visit the Orion website.
* **Different behavior when Publishing a review** - In previous releases, when you created a new review and clicked on the Publish button in the Create Review wizard, the application would open up a review session within the author's running copy of Maqetta. With Release 10, we no longer open a review session when clicking on Publish. The user has to open review HTML files manually.
* **User actual name** - In various parts of the UI, Maqetta now shows the user's real name (e.g., John Smith) instead of the user's email (john...@example.com).
* **Widget-specific date properties now include date picker** - Any widget-specific properties that are specified as holding a date value now will present a popup date picker in the "Widget" section of the properties palette.
* **Small "x" icon added to widget palette filter box** - There is now a small "x" that appears in the filter box for the widget palette whenever there is at least one character typed into the filter box. The "x" icon clears the filter box.
* **Enhanced SmartInput**
	* \- Setting multiple fields from SmartInput - For example dojo TextBox supports the HTML placeHolder attribute, SmartInput for all dojo TextBox now lets the user set the TextBox value and placeHolder attributes.
	* \- Setting Date and Time fields from SmartInput using date and time pickers - For example dojo DateTextBox SmartInput now uses a date picker for setting the value feild.
* **Theme Editor support for simulating CSS Pseudo-class behaviors** - For example the user can now select the HTML button, select the Hover from the states palette and set the :hover CSS Pseudo-class in the claro theme.
* **Save As Widget Improvements - old custom widgets not supported** -
The Save As Widget feature has been "experimental", and with Release 10 continues to be experimental, but in Release 10 there have been improvements and bug fixes. The improvements required some significant coding changes, and the coding changes resulted in lack of backwards-compatible support for custom widgets created in previous versions. 

<br>
**Downloads** are available from the main [downloads page](//maqetta.org/downloads/).