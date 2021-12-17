'use strict';

///import * as go from '../wwwroot/js/go-debug.js';
//// <reference path="../wwwroot/js/go-debug.d.ts" />
//import * as $ from "../wwwroot/lib/jquery/dist/jquery.min.js";
//// <reference path="../node_modules/@types/jquery/index.d.ts" />
import * as go from '../node_modules/gojs/release/go-debug-module.js';
import { init_person } from './person.js';
import { init_flowchart } from './flowchart.js';
import { init_sequence } from './sequence.js';

let sequences: { [key: string]: any } = {};
let workflowJson = null;

function load_sequence(seq: go.Diagram, sel: HTMLSelectElement, title: HTMLInputElement) {
  let json = sel.value != null
    ? sequences[sel.value]
    : null;

  if (json) {
    seq.model = go.Model.fromJson(json.contents);
    title.value = json.title;
  } else {
    seq.clear();
    title.value = "";
  }
}

function save_sequence(seq: go.Diagram, save: HTMLButtonElement, select: HTMLSelectElement) {
  let oldJson = sequences[select.value];
  save.disabled = true;
  oldJson.contents = seq.model.toJson();
  select.options.item(select.selectedIndex).text = oldJson.title;

  let isNew = oldJson.id < 0;

  if (isNew) {
    let oldId = oldJson.id;
    delete oldJson.id;

    fetch(`/api/sequence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(oldJson)
    }).then(response => response.json())
      .then(json => {
        save.disabled = false;
        oldJson.id = json.id;
        $(`option[value=${oldId}]`, select).val(json.id);
      });
  } else {
    fetch(`/api/sequence/${oldJson.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(oldJson)
    }).then(response => {
      save.disabled = false;
    });
  }
}

let newSequenceId: number = 0;

function new_sequence(seq: go.Diagram, workflowId: string, select: HTMLSelectElement, title: HTMLInputElement) {
  seq.clear();
  let newJson = {
    id: --newSequenceId,
    workflowId: workflowId,
    title: `[New: ${newSequenceId}]`,
    contents: {}
  };
  title.value = newJson.title;
  select.appendChild(new Option(newJson.title, newJson.id.toString(), undefined, true));
  sequences[newSequenceId] = newJson;
}

function load_workflow<T>(flow: go.Diagram, id: string, seq: go.Diagram, seqSelect: HTMLSelectElement, seqTitle: HTMLInputElement): Promise<T> {
  return fetch(`/api/workflow/${id}`)
    .then(response => response.json())
    .then(json => {
      flow.model = go.Model.fromJson(json.contents);

      sequences = json.sequences.reduce((a, x) => ({ ...a, [x.id]: x }), {}); // .ToDictionary
      let sel = $(seqSelect);
      sel.empty();
      json.sequences.sort((a,b) => a.id > b.id ? 1 : -1)
        .forEach(e => sel.append(new Option(e.title, e.id)));
      load_sequence(seq, seqSelect, seqTitle);
      return json;
    });
}

async function save_workflow(flow: go.Diagram, oldJson, save: HTMLButtonElement, select: HTMLSelectElement) {
  save.disabled = true;
  oldJson.contents = flow.model.toJson();
  select.options.item(select.selectedIndex).text = oldJson.title;

  let isNew = oldJson.id < 0;

  if (isNew) {
    let oldId = oldJson.id;
    delete oldJson.id;

    fetch(`/api/workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(oldJson)
    }).then(response => response.json())
      .then(json => {
        save.disabled = false;
        oldJson.id = json.id;
        $(`option[value=${oldId}]`, select).val(json.id);
      });
  } else {
    fetch(`/api/workflow/${oldJson.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(oldJson)
    }).then(response => {
        save.disabled = false;
      });
  }
}

let newWorkflowId: number = 0;

function new_workflow(flow: go.Diagram, select: HTMLSelectElement, title: HTMLInputElement) {
  flow.clear();
  let newJson = {
    id: --newWorkflowId,
    title: `[New: ${newWorkflowId}]`,
    contents: {}
  };
  title.value = newJson.title;
  select.appendChild(new Option(newJson.title, newJson.id.toString(), undefined, true));
}

export function init() {
  const el = document.getElementById.bind(document);
  const controls = {
    person: { div: el('divPerson') },
    sequence: {
      div: el('divSequence'),
      select: <HTMLSelectElement>el('SelectedSequence'),
      save: <HTMLButtonElement>el('saveSequence'),
      new: <HTMLButtonElement>el('newSequence'),
      title: <HTMLInputElement>el('sequenceTitle')
    },
    workflow: {
      div: el('divWorkflow'),
      palette: el('divPalette'),
      select: <HTMLSelectElement>el('SelectedWorkflow'),
      save: <HTMLButtonElement>el('saveWorkflow'),
      new: <HTMLButtonElement>el('newWorkflow'),
      title: <HTMLInputElement>el('workflowTitle')
    }
  };
  //console.log(controls.person.div);
  const diagrams = {
    person: init_person(controls.person.div, '/api/person'),
    workflow: init_flowchart(controls.workflow.div, controls.workflow.palette),
    sequence: init_sequence(controls.sequence.div)
  };
  for (var k in diagrams)
    (<go.Diagram>diagrams[k]).animationManager.initialAnimationStyle = go.AnimationManager.None;

  let e_workflow = () => load_workflow(
    diagrams.workflow, controls.workflow.select.value,
    diagrams.sequence, controls.sequence.select, controls.sequence.title)
    .then(json => {
      workflowJson = json;
      controls.workflow.title.value = (json as any).title;
    });

  controls.workflow.select.addEventListener("change", e_workflow);
  controls.sequence.select.addEventListener("change", () => load_sequence(diagrams.sequence, controls.sequence.select, controls.sequence.title));
  controls.workflow.save.addEventListener("click", () => save_workflow(diagrams.workflow, workflowJson, controls.workflow.save, controls.workflow.select));
  controls.workflow.title.addEventListener("change", e => workflowJson.title = (e.srcElement as HTMLInputElement).value);
  controls.workflow.new.addEventListener("click", () => new_workflow(diagrams.workflow, controls.workflow.select, controls.workflow.title));
  e_workflow();

  controls.sequence.save.addEventListener("click", () => save_sequence(diagrams.sequence, controls.sequence.save, controls.sequence.select));
  controls.sequence.title.addEventListener("change", e => sequences[controls.sequence.select.value].title = (e.srcElement as HTMLInputElement).value);
  controls.sequence.new.addEventListener("click", () => new_sequence(diagrams.sequence, workflowJson.id, controls.sequence.select, controls.sequence.title));

  /*
{"text":"drink","key":-2,"loc":"99 252"}
{"key":-11,"loc":"270 329","text":"serve food"},
{"key":0,"loc":"99 175","text":"deliver drinks"},
{"key":1,"loc":"175 100","text":"order food & drink"},
{"key":2,"loc":"270 175","text":"hand off to cook"},
{"key":3,"loc":"270 250","text":"cook food"},
{"key":4,"loc":"270 329","text":"serve food"},
{"key":6,"loc":"177 418","text":"eat & drink"},
{"key":7,"loc":"177 483","text":"pay cashier"},
  */

  var assignments = {
    "Hank": [3],
    "Fred": [-2, 1, 6, 7],
    "Bob": [-11, 0, 1, 2, 4],
    "Renee": [7]
  };

  var unselect = (diagram: go.Diagram) => diagram.nodes.each(n => n.isSelected = false);

  diagrams.person.addDiagramListener("ChangedSelection", () => {
    unselect(diagrams.sequence);
    unselect(diagrams.workflow);
    diagrams.person.selection.each(n => {
      if (n instanceof go.Node) {
        const key = n.data.text.trim();
        diagrams.sequence.findNodeForKey(key).isSelected = true;
        assignments[key].forEach(id => diagrams.workflow.findNodeForKey(id).isSelected = true);
      }
    });
  });

  diagrams.sequence.addDiagramListener("ChangedSelection", () => {
    unselect(diagrams.person);
    unselect(diagrams.workflow);
    diagrams.sequence.selection.each(n => {
      if (n instanceof go.Node) {
        const key = n.data.key.trim();
        let p = diagrams.person.model.nodeDataArray.filter(n => n.text.trim() == key)[0];
        diagrams.person.findNodeForData(p).isSelected = true;
        assignments[key].forEach(id => diagrams.workflow.findNodeForKey(id).isSelected = true);
      }
    });
  });

  diagrams.workflow.addDiagramListener("ChangedSelection", () => {
    unselect(diagrams.person);
    unselect(diagrams.sequence);
    diagrams.workflow.selection.each(n => {
      if (n instanceof go.Node) {
        const key = n.data.key;
        for (let k in assignments) {
          if (assignments[k].includes(key)) {
            let p = diagrams.person.model.nodeDataArray.filter(n => n.text.trim() == k)[0];
            diagrams.person.findNodeForData(p).isSelected = true;
            diagrams.sequence.findNodeForKey(k).isSelected = true;
          }
        }
      }
    });
  });

  (window as any).diagrams = diagrams;
}