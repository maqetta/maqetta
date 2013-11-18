---
title: "Application states: Interactivity Without Programming"
---

Maqetta provides a mechanism for organizing a UI prototype into a series of  "application states" (aka "screens" or "panels") which allows a UI designer to define interactivity without programming.

* **Scenes palette: Create and manage application states** - Users define new application states and manage those states in the States palette.
* **Outline palette: Control widget visibility by state** - Authors control which widget (or including container widgets) are visible for particular application states by entering a particular state in the States palette and then turning widget visibility on/off for the given state using the eyeball icon next to the widget in the Outline palette.
* **Properties palette: Application interactivity without programming** - Authors can define define trigger events to cause state changes in the Events section of the Properties palette. Maqetta provides a dropdown menu for each event that allows an author to easily define the trigger for a state change event. For example, the author might decide that a click event on a Button widget might cause the application to switch from state A to state B. (Which likely causes the widgets that are visible in state A to disappear and the widgets that are visible in state B to appear instead.)
