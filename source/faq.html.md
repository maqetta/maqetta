---
title: Frequently Asked Questions
---

*In May 2013, active development of the Maqetta open source project [stopped](https://groups.google.com/forum/#!msg/maqetta-users/dLGzdERrkG8/PQ9Xv25eRD8J), and in February 2014, the free web hosting service for the Maqetta application at Maqetta.org [became unavailable](https://groups.google.com/forum/#!msg/maqetta-users/0M0da6576Cg/_2i6SbvFTqAJ).*

General
-------

#### What is Maqetta?

Maqetta is an open source technology initiative at Dojo Foundation that provides WYSIWYG visual authoring of HTML5 user interfaces for HTML5 (desktop and mobile). The Maqetta application itself is authored in HTML, and therefore runs in the browser without requiring additional plugins or downloads. (See [Project Summary](overview/summary.html))

#### What is the target use case and who is the target user?

The primary target use case for Maqetta is user interface design, where non-programmers or lightweight-programmers create UI mockups or actual running applications.

#### How do I report bugs and how do I request features?

You can log bugs and/or request features using the [Maqetta Issue Tracker at GitHub](https://github.com/maqetta/maqetta/issues).

If you notice a security issue with the site, please send an email that reports the security problem to: [maqetta-security@googlegroups.com](mailto:maqetta-security@googlegroups.com)

#### Can I install Maqetta on my own web server (or localhost)?

Absolutely. The Maqetta team places milestone builds as ZIP and WAR files that can be downloaded and installed on standard web servers, such as Apache or Java servers. There are simple server launch scripts for Windows, Mac and Linux that you can run (or double-click from Explorer/Finder). The ZIP file contains auto-launches the server (which uses Jetty, an open source, lightweight JEE server).

#### Can I use my favorite JavaScript library with Maqetta, or do I have to use Dojo?

The Maqetta team has gone to great lengths to architect the code to be toolkit independent. It uses industry standard [OpenAjax Widgets](http://www.openajax.org/member/wiki/OpenAjax_Metadata_1.0_Specification_Widget_Overview) as the way to package up widget metadata, and this format works with most popular (HTML/JavaScript/CSS) widget libraries.

The current release contains a large number of Dojo widgets (both desktop-focused Dijit widgets and a comprehensive set of mobile dojo widgets). The Maqetta team has implemented proof-of-concept support for widgets from the jQuery and YUI libraries to confirm that the architecture is toolkit independent.

The current release does not have all extension points completed yet that would allow site administrators and/or users to configure their version of Maqetta to use a particular JavaScript library, a particular widget library or a particular CSS styling theme. These extension points are planned for the future. With the current release, to include different libraries or widgets than what ships by default, you'll need to download the source code and make various source code changes. Adding built-in support for other widget libraries is high on the list of potential future enhancements.

#### Who owns Maqetta, and how is it licensed?

Maqetta's original technologies were donated by IBM to Dojo Foundation as an open source project, under Dojo's liberal and commercial-friendly open source licensing terms.

#### If I use the application hosted on Maqetta.org, are my files safe and secure?

The Maqetta application that you can run from the Maqetta.org site is available on an as-is basis with no guarantees about suitability, reliability, performance, security, data preservation, or anything else. While the Maqetta project will try to keep the application running on a continuous basis and preserve user data, the publicly hosted application might become unavailable at any time, temporarily or permanently, and your data might be deleted without notice. In the current release, there is no permissions system to prevent other web users from seeing your data, and there is no backup system on any of your data.

If you notice a security issue with the site, please send an email that reports the security problem to: [maqetta-security@googlegroups.com](mailto:maqetta-security@googlegroups.com)

#### Why the name "Maqetta" and how to pronounce it?

"Maqetta" is a spelling variation of the Spanish word for mock-up ("maqueta"). The team members pronounce the name as if the "q" were a "k".


Technology
----------

#### What technologies were used to create the Maqetta Designer application?

The Maqetta Designer application is built using 100% open standards technologies.

The vast majority of the code is client-side HTML, JavaScript and CSS that runs in the browser. The application makes some use of new "HTML5" features and CSS3 features in various points. The current plan is that the application will make increasing use of HTML5 features under the hood, where features such as web sockets, worker threads and local storage have been discussed by the project team. The project uses some SVG (for the mobile device silhouettes and drawing tools).

The Maqetta application has a relatively simple server that is implemented using Java and OSGi, using various technologies from Eclipse Foundation. There are build scripts that create various distributions, where one build script creates a simple Jetty-based server and another build script creates a WAR file. Because the server's main operations are to respond to a set of REST APIs, theoretically, the server could be re-written in other server programming languages.

#### What JavaScript libraries are used to build Maqetta?

The Maqetta application uses the Dojo Toolkit extensively. The Maqetta application uses the Dijit library for much of its user interface and uses the Claro CSS theme for its styling.

#### What widget technologies are used?

The Maqetta application uses the [OpenAjax Widgets](http://www.openajax.org/member/wiki/OpenAjax_Metadata_1.0_Specification_Widget_Overview) standard for "widget metadata", which provides a thin wrapper definition for any widgets that appear in the Maqetta widget palette. Maqetta uses a JSON version of OpenAjax Widgets, where the JSON is the result of a conversion string from the OpenAjax Widgets XML format.

#### Relationship to Eclipse Orion

The current release of uses Eclipse Orion 2.0 [Orion open source project](http://www.eclipse.org/orion/) for core functionality in the Maqetta server, particularly for user management and workspace management functionality. On the client, Maqetta uses Orion's source editor for all of Maqetta's source code editing features. You can expose the Orion user interface by issuing an Open->Orion Navigator command from the Maqetta visual page editor. 

#### Can the theme editor support other CSS themes?

The Maqetta theme editor is designed to support arbitrary CSS themes, not just Dojo/Dijit themes such as Claro. The project's goal is to provide a general-purpose CSS theme editor component which can work with themes from various JavaScript toolkits (Dojo, jQuery, YUI, etc) and CSS themes that are independent of JavaScript toolkits.

That said, not all of the extension points for the theme editor have been programmed yet. With the current release, Maqetta is hardcoded to only know about the Claro and Sketch themes. At this point, adding support for new CSS themes in the Maqetta theme editor requires downloading the open source and customizing the logic manually. In the future, the project team plans on making it easier to customize and extend the theme editor.

The primary extensibility mechanism for the theme editor is the theme metadata format, which has some initial documentation at [Theme Editor Technical Documentation](http://app.maqetta.org/maqetta/app/docs/index.html#techdocs/themeEditor). The goal is that a developer just needs to create theme metadata that sits alongside his existing theme (consisting of one or more CSS files).


Community
---------

#### How do I use the discussion groups?

The project team has selected to use Google Groups for our discussion groups. Google provides a simple web dashboard for posting and reading community discussions. Feel free to post to these forums using any device with email capability after you request membership permission using for the associated Forum Web Page.

<span style="text-decoration: underline;"> Users' Discussion Group</span>

Intended for web developers who are interested in or currently using the Maqetta UI mockup tool.

*   Google Group: Maqetta Users
*   Email Address: [maqetta-users@googlegroups.com](mailto:maqetta-users@googlegroups.com)
*   Web Address: [http://groups.google.com/group/maqetta-users](http://groups.google.com/group/maqetta-users)

<span style="text-decoration: underline;"> Developers' Discussion Group</span>

Intended for software developers who are interested in or currently contributing to the Maqetta UI mockup tool open source project.

*   Google Group: Maqetta Developers
*   Email Address: [maqetta-devs@googlegroups.com](mailto:maqetta-devs@googlegroups.com)
*   Web Address: [http://groups.google.com/group/maqetta-devs](http://groups.google.com/group/maqetta-devs)

#### How do I report bugs and how do I request features?

You can log bugs and/or request features using the [Maqetta Issue Tracker at GitHub](https://github.com/maqetta/maqetta/issues).


Browsers
--------

#### Does Maqetta run on IE and older versions of browsers?

It is important to distinguish between which browsers are supported by the HTML applications you create in Maqetta and which browsers you can use to run the Maqetta authoring application.

With Maqetta, you can <span style="text-decoration: underline;">create HTML pages</span> that will run on most modern browsers, including older versions of IE. Maqetta is just a visual authoring tool for creating HTML+CSS pages. The key thing to produce cross-browser HTML pages with Maqetta is to use JavaScript toolkits that support the target browsers you need to support, and use the same techniques as you would if hand-coding HTML to only use HTML and CSS features that work across all of our target browsers.

However, <span style="text-decoration: underline;">to run Maqetta</span>, you have to use the most recent releases of Chrome, Firefox or Mac Safari. Maqetta requires various HTML5 features from the browser. IE9 and IE10 are not supported yet.

#### Does Maqetta run on tablets such as the iPad?

The current release does not support running the Maqetta application on a tablet device.
