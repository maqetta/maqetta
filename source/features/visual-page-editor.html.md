---
title: Visual Page Editor
---

This article provides a feature summary for the visual page editor that is one of the key features in the Maqetta application.

Drag and drop page assembly, on-screen visual editing
-----------------------------------------------------

* **Drag/drop from Widget palette** - Users can assemble a user interface by dragging and dropping components from the Widget palette.
* **Drag/drop images from Files palette** - Users can create HTML &lt;img&gt; elements by dragging an image file from the Files palette and dropping that image onto the visual canvas.
* **Drag/drop rearrangement/moving on the canvas or in Outline palette** - Users can move widgets around relative to each other by first selecting a particular widget and then dragging it to a different location. When dragging on the canvas for widgets that have positioned using flow layout, the application will show a vertical bar at speculative drop points. For absolute layout, if snap lines are activated via Settings-&gt;Preferences-&gt;HTML-&gt;Visual Editor, then snap lines may show potential snap points. You can also rearrange widgets via drag/drop in the Outline palette.
* **Resizing widgets** - Most widgets are resizable. (Note: some widgets do not support resizing because they are designed to be as large as the content inside). To resize a widget, first select the widget, and then drag on the corner nobs or selection box edges.
* **Data popup control** - For many widgets, the principal data value for the widget (e.g., the text inside of a Button) can be modified directly on the canvas via the data popup control that Maqetta presents upon double-clicking on a widget, or in some cases, when the widget is created initially. For certain widgets, the  data popup sometimes allows quick entry of data for complex widgets, such as the drop-down menu values.
* **Controlling/changing a widget's parent** - Maqetta includes a preference (off by default) that will show candidate parents when dragging a new widget onto the canvas or dragging an existing widget. You can use number keys during the drag operation to select which widget should become the parent of the widget you are dragging.

## Toolbar for common editing operations

* **Cut/Copy/Paste/Delete** - The toolbar allows the users to cut/copy/paste the currently selected widget(s).
* **Undo/Redo** - The toolbar allows operations to be backed out and supports the ability to undo multiple operations (i.e., not just the last operation).
* **Preview in browser** - Users can click on the Preview in Browser icon to display the HTML page they are creating directly in the browser (i.e., outside of the Maqetta visual editor).
* **Save and Save As** - Save writes over the previous version of a particular file. Save As allows the user to same the current file under a different name.
* **Switch theme** - The author can view the application using different CSS styling themes. For Dojo widgets, Maqetta offers two standard themes (Claro and Sketch) and provides an ability to create themes from an existing theme.
* **Flow vs absolute layout** - The HTML visual editor defaults to flow layout where HTML pages are constructed using normal HTML/CSS layout where widgets stack left-to-right and top-to-bottom starting from the top/left corner of the page. Users can alternative go into absolute positioning mode where all new widgets are positioned at particular (x,y) locations on the page and therefore do not participate in the HTML page's primary text flow.
* **Sticky note** - User's can add annotative textual comments to their HTML pages. These instructional notes are particular useful for UI mockups to provide supplemental information about the page so that reviewers can better understand author intent and so that developers can see supplemental details about the user interface design.These "sticky notes" current appear as yellow boxes that overlay the rest of the web page.
* **View modes: source vs design vs split** - Maqetta creates an internal model of the HTML and CSS content of each HTML page that a user builds. This model allows the user to edit the document either in design mode (visually), in source mode, or in split mode (where both design view and source view are visible at once).

## Widget palette: HTML elements or widget libraries

* **HTML elements** - For many user interfaces, HTML provides all of the features that a user needs. For these cases, users can assemble a user interface by dragging/dropping HTML elements from the Widget palette onto the page canvas.
* **Widget libraries** - For many other cases, users will find that it is more productive (or required by their company) to use pre-packaged user interface components (i.e., "widgets") that are included in  some popular JavaScript libraries. Maqetta currently includes various collections of Dojo widgets (Dijit and dojox.mobile).

## Customizing widgets with the Properties palette

* **Common HTML attributes** - The Properties palette allows the user to modify common HTML attributes: 'class', 'id' and 'title'.
* **Widget-specific properties** - Nearly every widget has a set of widget-specific properties. (Defined using an industry standard for widget metadata: [ OpenAjax Widgets](http://www.openajax.org/member/wiki/OpenAjax_Metadata_1.0_Specification_Widget_Overview).)
* **Events** - Users can defined run-time interactivity by defining the actions that should occur with particular events (e.g., onclick) on particular widgets.
* **CSS properties** - The Properties palette includes authoring support for dozens of CSS properties that are commonly used to construct HTML user interfaces.
* **Advanced CSS authoring** - Maqetta builds a full model out the CSS stylesheets used by a particular HTML page. Using this information, along with  theme metadata, Maqetta provides advanced CSS authoring that allows authors to see the prioritized list of style rules that apply to a particular property on a particular widget, where Maqetta recognizes which subnode within a widget is the appropriate target node for a particular CSS property. Maqetta provides a convenient and quick way to work with CSS classes using style rules within an application-specific CSS file that can override the default style rules for the currently active CSS theme.

## Outline palette: page hierarchy, rearranging widgets, controlling visibility

* **Viewing page hierarchy** - The Outline palette provides a hierarchical view of the widgets on the page.
* **Widget rearrangement** - The Outline palette supports drag and drop rearrangement of widgets.
* **Controlling widget visibility** - The Outline palette contains an eyeball icon to the left of each widget that controls whether that widget should be visible. This feature is mostly used in conjunction with the "states" feature where the UI mockup is organized into a discrete set of states (aka "panels" or "screens").
