---
title: Project Summary
---

***In May 2013, active development of the Maqetta open source project [stopped](https://groups.google.com/forum/#!msg/maqetta-users/dLGzdERrkG8/PQ9Xv25eRD8J), and in February 2014, the free web hosting service for the Maqetta application at Maqetta.org [became unavailable](https://groups.google.com/forum/#!msg/maqetta-users/0M0da6576Cg/_2i6SbvFTqAJ).***

---

Maqetta is an open source technology initiative at Dojo Foundation that provides WYSIWYG tooling in the cloud for HTML5 (desktop and mobile). Maqetta allows User Experience Designers (UXD) to perform drag/drop assembly of live UI mockups.

One of Maqetta's key design goals is to create developer-ready UI mockups that promote efficient hand-off from designers to developers. The user interfaces created by Maqetta are real-life web applications that can be handed off to developers, who can then transform the application incrementally from UI mockup into final shipping application. While we expect the Maqetta-created mockups often will go through major code changes, Maqetta is designed to promote preservation of visual assets, particularly the CSS style sheets, across the development life cycle. As a result, the careful pixel-level styling efforts by the UI team will carry through into the final shipping application. To help with the designer/developer hand-off, Maqetta includes a "download into ZIP" feature to create a ZIP image that can be imported into a developer tool workspace (e.g., Eclipse IDE).

For team development, Maqetta includes a web-based review&commenting features with forum-style comments and on-canvas annotations.

Maqetta came out of an internal IBM initiative to address the visual design requirements of IBM's various UXD teams. IBM contributed Maqetta's original code to open source to foster a community that can help create and maintain a strong suite of open source HTML5 visual tools.

Maqetta includes:

* a WYSIWYG visual page editor for drawing out user interfaces
* drag/drop mobile UI authoring within an exact-dimension device silhouette, such as the silhouette of an iPhone
* simultaneous editing in either design or source views
* deep support for CSS styling (the application includes a full CSS parser/modeler)
* a mechanism for organizing a UI prototype into a series of "application states" (aka "screens" or "panels") which allows a UI designer to define interactivity without programming
* a web-based review and commenting feature where the author can submit a live UI mockup for review by his team members
* a "wireframing" feature that allows UI designers to create UI proposals that have a hand-drawn look
* a theme editor for customizing the visual styling of a collection of widgets
* export options that allow for smooth hand-off of the UI mockups into leading developer tools such as Eclipse
* Maqetta's code base has a toolkit-independent architecture that allows for plugging in arbitrary widget libraries and CSS themes.