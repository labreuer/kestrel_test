'use strict';

import * as go from '../node_modules/gojs/release/go-debug-module.js';
import { init_flowchart } from './flowchart.js';

interface Workflow {
  id: number;
  title: string;
  contents: string;
}

interface ExtendedWorkflow extends Workflow {
  children: { [key: number]: WorkflowWorkflow };
}

interface WorkflowWorkflow {
  id: number;
  title: string;
  parentWorkflowId: number;
  childWorkflowId: number;
  parentWorkflowNode: number;
}

class WorkflowManager {
  div: HTMLElement;
  palette: HTMLElement;
  select: HTMLSelectElement;
  save: HTMLButtonElement;
  create: HTMLButtonElement;
  title: HTMLInputElement;
  diagram: go.Diagram;
  workflows: { [key: number]: ExtendedWorkflow };
  workflow: ExtendedWorkflow;
  cascade: (m: WorkflowManager, w: ExtendedWorkflow) => void;

  constructor(
    div: HTMLElement,
    palette: HTMLElement,
    select: HTMLSelectElement,
    save: HTMLButtonElement,
    create: HTMLButtonElement,
    title: HTMLInputElement,
    workflows: { [key: number]: ExtendedWorkflow },
    idCreator: () => number,
    cascade: (m: WorkflowManager, w: ExtendedWorkflow) => void = null
  ) {
    this.div = div;
    this.palette = palette;
    this.select = select;
    this.save = save;
    this.create = create;
    this.title = title;

    this.workflows = workflows;
    this.cascade = cascade;

    this.diagram = init_flowchart(div, palette);
    this.diagram.animationManager.initialAnimationStyle = go.AnimationManager.None;

    this.select.addEventListener('change', e => {
      const id = parseInt(this.select.value);
      this.workflow = workflows[id];
      this.load_workflow(this.workflow);      
    });
    this.save.addEventListener('click', e => this.save_workflow());
    this.create.addEventListener('click', e => this.new_workflow(idCreator()));
  }

  load_workflow(w: ExtendedWorkflow) {
    this.workflow = w;
    this.diagram.model = go.Model.fromJson(w.contents);
    this.title.value = w.title;
    this.select.value = w.id.toString();
    this.cascade(this, this.workflow);
  }

  populate_select(ws: Workflow[], includeEmpty: boolean = false) {
    const sel = $(this.select);
    sel.empty();
    if (includeEmpty)
      sel.append(new Option("", "0"));
    if (ws.length > 0) {
      ws.sort((a, b) => a.id > b.id ? 1 : -1)
        .forEach(e => sel.append(new Option(e.title, e.id.toString())));
    }
  }

  save_workflow() {
    const w = this.workflow;

    this.save.disabled = true;
    w.contents = this.diagram.model.toJson();
    w.title = this.title.value;
    this.select.options.item(this.select.selectedIndex).text = w.title;

    const isNew = w.id < 0;

    if (isNew) {
      const oldId = w.id;
      //delete oldJson.id;

      fetch(`/api/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(w)
      }).then(response => response.json())
        .then(json => <Workflow>json)
        .then(new_w => {
          this.save.disabled = false;
          w.id = new_w.id;
          $(`option[value=${oldId}]`, this.select).val(new_w.id);
        });
    } else {
      fetch(`/api/workflow/${w.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(w)
      }).then(response => {
        this.save.disabled = false;
      });
    }
  }

  new_workflow(new_id: number) {
    const w = {
      id: new_id,
      title: `[New: ${new_id}]`,
      contents: "{}",
      children: {}
    };
    this.load_workflow(w);
    this.select.appendChild(new Option(w.title, w.id.toString(), undefined, true));
  }

  static fetch_all_workflows(): Promise<Workflow[] | {}> {
    return fetch(`/api/workflow/`)
      .then(response => response.json())
      .then(json => <Workflow[]>json)
      .then(json => json.reduce((a, x) => ({ ...a, [x.id]: x }), {}));
  }
}

let workflowWorkflows: { [key: number]: WorkflowWorkflow[] };
let workflows: { [key: number]: Workflow };

function load_workflowworkflows<T>() {
  return fetch('/api/workflowworkflows')
    .then(response => response.json())
    .then(json => <WorkflowWorkflow[]>json);
    //.then(json => json.reduce((a, x) => ({ ...a, [x.id]: x }), {}));
}

export async function init() {
  const workflows = <{ [key: number]: ExtendedWorkflow }>await WorkflowManager.fetch_all_workflows();
  const xref = await load_workflowworkflows();
  Object.values(workflows).forEach(w => w.children = {});
  xref.forEach(ww => workflows[ww.parentWorkflowId].children[ww.id] = ww);

  let newWorkflowId: number = 0;
  function idCreator() {
    return --newWorkflowId;
  }

  function el<T extends HTMLElement>(id) {
    return <T>document.getElementById(id);
  }
  const child = new WorkflowManager(
    el<HTMLElement>('divWorkflow2'),
    el<HTMLElement>('divPalette2'),
    el<HTMLSelectElement>('SelectedWorkflow2'),
    el<HTMLButtonElement>('saveWorkflow2'),
    el<HTMLButtonElement>('newWorkflow2'),
    el<HTMLInputElement>('workflowTitle2'),
    workflows,
    idCreator
  ); 
  const parent = new WorkflowManager(
    el<HTMLElement>('divWorkflow'),
    el<HTMLElement>('divPalette'),
    el<HTMLSelectElement>('SelectedWorkflow'),
    el<HTMLButtonElement>('saveWorkflow'),
    el<HTMLButtonElement>('newWorkflow'),
    el<HTMLInputElement>('workflowTitle'),
    workflows,
    idCreator,
    (m, w) => child.populate_select(Object.values(w.children).map(ww => workflows[ww.childWorkflowId]), true)
  );

  parent.load_workflow(workflows[7])
}