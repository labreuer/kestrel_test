//// <reference path="../wwwroot/js/go-debug.d.ts" />
import * as go from '../node_modules/gojs/release/go-debug-module.js';

export function init_person(div, url) {

  let $ = go.GraphObject.make;  // for conciseness in defining templates

  let d_person = $(go.Diagram, div,  // create a Diagram for the DIV HTML element
    {
      "undoManager.isEnabled": true  // enable undo & redo
    });

  // define a simple Node template
  d_person.nodeTemplate =
    $(go.Node, "Auto",  // the Shape will go around the TextBlock
      $(go.Shape, "RoundedRectangle", { strokeWidth: 0, fill: "white" },
        // Shape.fill is bound to Node.data.color
        new go.Binding("fill", "color")),
      $(go.TextBlock,
        { margin: 8, font: "bold 14px sans-serif", stroke: '#333' }, // Specify a margin to add some room around the text
        // TextBlock.text is bound to Node.data.key
        new go.Binding("text", "key"))
    );

  d_person.nodeTemplateMap.add("",  // the default category
    $(go.Node, "Auto",
      $(go.Shape, "RoundedRectangle",
        new go.Binding("fill", "color")),
      $(go.TextBlock,
        new go.Binding("text", "text")),
      {
        toolTip:
          $("ToolTip",
            $(go.TextBlock, { margin: 4 },
              new go.Binding("text", "desc"))
          )
      })
  );

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      d_person.model = new go.GraphLinksModel(
        json.people.map(e => ({ key: e.id, text: `${e.firstName} ${e.lastName}`, color: "lightblue" })),
        json.personPerson.map(e => ({ from: e.primaryPersonId, to: e.secondaryPersonId }))
      );
    });
  return d_person;
}