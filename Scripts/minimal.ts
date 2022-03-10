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
  private static readonly BlankSelectId = "0";

  div: HTMLElement;
  palette: HTMLElement;
  select: HTMLSelectElement;
  save: HTMLButtonElement;
  create: HTMLButtonElement;
  title: HTMLInputElement;
  diagram: go.Diagram;
  workflows: { [key: number]: ExtendedWorkflow };
  workflow: ExtendedWorkflow;
  // TODO: consider making these real events
  onWorkflowChanged: (m: WorkflowManager, w: ExtendedWorkflow) => void;
  onWorkflowCreating: (m: WorkflowManager, wPartial: ExtendedWorkflow) => void;
  onWorkflowSaved: (m: WorkflowManager, w: ExtendedWorkflow, oldId: number) => void;

  constructor(
    div: HTMLElement,
    palette: HTMLElement,
    select: HTMLSelectElement,
    save: HTMLButtonElement,
    create: HTMLButtonElement,
    title: HTMLInputElement,
    workflows: { [key: number]: ExtendedWorkflow },
    idCreator: () => number
  ) {
    this.div = div;
    this.palette = palette;
    this.select = select;
    this.save = save;
    this.create = create;
    this.title = title;

    this.workflows = workflows;

    this.diagram = init_flowchart(div, palette);
    this.diagram.animationManager.initialAnimationStyle = go.AnimationManager.None;

    this.select.addEventListener('change', e => {
      const id = parseInt(this.select.value);
      this.workflow = workflows[id];
      this.load_workflow(this.workflow);      
    });
    this.save.addEventListener('click', e => this.save_workflow());
    this.create.addEventListener('click', e => this.new_workflow(idCreator()));
    this.save.disabled = true;
  }

  clear() {
    this.load_workflow(null);
  }

  load_workflow(w: ExtendedWorkflow) {
    this.workflow = w;
    this.title.value = w?.title ?? "";
    this.save.disabled = w == null;

    // N.B. events don't fire when you programmatically change a value
    // https://stackoverflow.com/questions/19329978/change-selects-option-and-trigger-events-with-javascript
    if (w != null) {
      this.diagram.model = go.Model.fromJson(w.contents);
      this.select.value = w.id.toString();
    }
    else {
      this.diagram.clear();
      this.select.value = WorkflowManager.BlankSelectId;
      this.save.disabled = true;
    }

    if (this.onWorkflowChanged)
      this.onWorkflowChanged(this, this.workflow);
  }

  populate_select(ws: Workflow[], includeEmpty: boolean = false) {
    const sel = $(this.select);
    sel.empty();
    if (includeEmpty)
      sel.append(new Option("", WorkflowManager.BlankSelectId));
    if (ws.length > 0) {
      ws.sort((a, b) => a.id > b.id ? 1 : -1)
        .forEach(e => sel.append(new Option(e.title, e.id.toString())));
    }
  }

  // TODO: handle failed fetches
  async save_workflow() {
    const w = this.workflow;

    if (w == null)
      throw "Cannot save workflow when it is null."

    this.save.disabled = true;
    w.contents = this.diagram.model.toJson();
    w.title = this.title.value;
    this.select.options.item(this.select.selectedIndex).text = w.title;

    const isNew = w.id < 0;
    const oldId = w.id;
    let t: Promise<any>;

    if (isNew) {
      t = fetch(`/api/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(w)
      }).then(response => response.json())
        .then(json => <Workflow>json)
        .then(new_w => {
          w.id = new_w.id;
          $(`option[value=${oldId}]`, this.select).val(new_w.id);
        });
    } else {
      t = fetch(`/api/workflow/${w.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(w)
      });
    }

    t.then(() => {
      if (this.onWorkflowSaved != null)
        this.onWorkflowSaved(this, this.workflow, oldId);
      this.save.disabled = false;
    });
  }

  new_workflow(new_id: number) {
    const w = {
      id: new_id,
      title: `[New: ${new_id}]`,
      contents: "{}",
      children: {}
    };
    if (this.onWorkflowCreating)
      this.onWorkflowCreating(this, w);
    this.load_workflow(w);
    this.select.appendChild(new Option(w.title, w.id.toString(), undefined, true));
  }

  // TODO: handle failed fetches
  static fetch_all_workflows(): Promise<{ [key: number]: Workflow }> {
    return fetch(`/api/workflow/`)
      .then(response => response.json())
      .then(json => <Workflow[]>json)
      .then(json => json.reduce((a, x) => ({ ...a, [x.id]: x }), {}));
  }
}

// TODO: handle failed fetches
function load_workflowworkflows(): Promise<WorkflowWorkflow[]> {
  return fetch('/api/workflowworkflows')
    .then(response => response.json())
    .then(json => <WorkflowWorkflow[]>json);
}

// TODO: handle failed fetches
async function save_workflowworkflow(ww: WorkflowWorkflow) {
  const isNew = ww.id < 0;

  if (isNew) {
    fetch(`/api/workflowworkflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ww)
    }).then(response => response.json())
      .then(json => <WorkflowWorkflow>json)
      .then(new_w => {
        ww.id = new_w.id;
      });
  } else {
    fetch(`/api/workflow/${ww.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ww)
    });
  }
}

const auditLog = document.getElementById('auditLog');
function audit(o: any, ...children: any[]) {
  function li(o: any): HTMLLIElement {
    const e = document.createElement('li');
    e.appendChild(document.createTextNode(o));
    return e;
  }
  const parent = li(o);
  if (children && children.length > 0) {
    const ul = document.createElement('ul');
    children.forEach(c => ul.appendChild(li(c)));
    parent.appendChild(ul);
  }
  auditLog.insertBefore(parent, auditLog.childNodes[0]);
}

export async function init() {
  function el<T extends HTMLElement>(id) {
    return <T>document.getElementById(id);
  }
  // cast from Workflow -> ExtendedWorkflow; we will then populate the additional field
  const workflows = <{ [key: number]: ExtendedWorkflow }>await WorkflowManager.fetch_all_workflows();
  const xref = await load_workflowworkflows();
  Object.values(workflows).forEach(w => w.children = {});
  xref.forEach(ww => workflows[ww.parentWorkflowId].children[ww.id] = ww);

  let newWorkflowId: number = 0;
  function idCreator() {
    return --newWorkflowId;
  }

  const parent = new WorkflowManager(
    el<HTMLElement>('divWorkflow'),
    el<HTMLElement>('divPalette'),
    el<HTMLSelectElement>('SelectedWorkflow'),
    el<HTMLButtonElement>('saveWorkflow'),
    el<HTMLButtonElement>('newWorkflow'),
    el<HTMLInputElement>('workflowTitle'),
    workflows,
    idCreator
  );
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
  function onParentWorkflowChanged(m: WorkflowManager, w: ExtendedWorkflow) {
    Object
      .values(w.children)
      .forEach(c => m.diagram.findNodeForKey(c.parentWorkflowNode).isShadowed = true);

    child.populate_select(Object.values(w.children).map(ww => workflows[ww.childWorkflowId]), true);
    child.clear();
    child.create.disabled = true;
  }
  parent.onWorkflowChanged = onParentWorkflowChanged;
  function onChildWorkflowCreating(m: WorkflowManager, wPartial: ExtendedWorkflow) {
    // 1.
    workflows[wPartial.id] = wPartial;

    // 2.
    const selected = parent.diagram.selection.filter(n => n instanceof go.Node);
    const compatibleWithChildren = selected.count == 1;

    if (!compatibleWithChildren)
      throw `Found ${selected.count} selected nodes in the parent; need precisely 1 to create child workflows.`;
    const node = <go.Node>selected.first();
    const newId = idCreator();
    parent.workflow.children[newId] = {
      id: newId,
      title: node.name,
      parentWorkflowId: parent.workflow.id,
      childWorkflowId: wPartial.id,
      parentWorkflowNode: parseInt(node.key.toString())
    };
    node.isShadowed = true;
  }
  child.onWorkflowCreating = onChildWorkflowCreating;
  parent.onWorkflowCreating = (m: WorkflowManager, wPartial: ExtendedWorkflow) => {
    // HACK: code duplication
    // 1.
    workflows[wPartial.id] = wPartial;
  };
  async function onWorkflowSaved(m: WorkflowManager, w: ExtendedWorkflow, oldId: number) {
    // 1.
    if (w.id != oldId) {
      delete workflows[oldId];
      workflows[w.id] = w;
    }

    // 2.
    const wws = Object
      .values(parent.workflow.children)
      .filter(ww => ww.id < 0 && ww.childWorkflowId == oldId);
    if (wws.length == 0 || oldId > 0)
      return;

    const ww = wws[0];
    const oldWwId = ww.id;
    ww.childWorkflowId = w.id;
    await save_workflowworkflow(ww);
    delete parent.workflow.children[oldWwId];
    parent.workflow.children[ww.id] = ww;
  }
  child.onWorkflowSaved = onWorkflowSaved;
  const ShadowColors = {
    ChildVisible: "red",
    Otherwise: "gray"
  };
  let lastParentNode: go.Node;
  function onChildWorkflowChanged(m: WorkflowManager, w: ExtendedWorkflow) {
    if (lastParentNode != null) {
      lastParentNode.shadowColor = ShadowColors.Otherwise;
      lastParentNode = null;
    }
    if (w == null)
      return;
    const wws = Object
      .values(parent.workflow.children)
      .filter(ww => ww.childWorkflowId == w.id);
    if (wws.length == 0)
      throw "Expected to find one child WorkflowWorkflow";
    if (wws.length > 1)
      throw "Cannot yet handle more than one child WorkflowWorkflow";
    const ww = wws[0];
    lastParentNode = parent.diagram.findNodeForKey(ww.parentWorkflowNode);
    lastParentNode.shadowColor = ShadowColors.ChildVisible;
  }
  child.onWorkflowChanged = onChildWorkflowChanged;

  // when a workflow is saved:
  //   1. there can be new WorkflowWorkflows that need saving
  //   2. there can be child Workflows that need prompting or saving (need to decide)
  //      * although as-is, if you switch away from an unsaved child workflow, it is de facto deleted

  parent.diagram.addDiagramListener('ChangedSelection', () => {
    const selected = parent.diagram.selection.filter(n => n instanceof go.Node);
    const compatibleWithChildren = selected.count == 1;

    // 1. control whether one can add child workflows
    child.create.disabled = !compatibleWithChildren;

    // 2. display child workflow
    if (!compatibleWithChildren)
      return;

    const node = <go.Node>selected.first();
    const children = Object
      .values(parent.workflow.children)
      .filter(c => c.parentWorkflowNode == <number>node.key);
    audit("single node selected in parent: " + node.key.toString(), `${children.length} child workflow(s)`);
    if (children.length == 0)
      return;

    // TODO: do we only change the child workflow if it hasn't been altered?
    const w = workflows[children[0].childWorkflowId];
    // don't re-select
    if (child.workflow != w)
      child.load_workflow(w);
  });

  parent.load_workflow(workflows[7]);
}