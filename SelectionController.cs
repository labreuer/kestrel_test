using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Text.Json;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace kestrel_test
{
    public class AuditedEvent
    {
        public string Guid { get; set; }
        public int Id { get; set; }
    }

    public class AuditedSelection : AuditedEvent
    {
        public int[] NodeIds { get; set; }
    }

    public class AuditedNodeRename : AuditedEvent
    {
        public int NodeId { get; set; }
        public string OldName { get; set; }
        public string NewName { get; set; }
    }

    public class AuditedWorkflowSelected: AuditedEvent
    {
        public int ParentWorkflowId { get; set;}
        public int ChildWorkflowId { get; set; }
    }

    public class Audits
    {
        public List<AuditedSelection> Selections { get; } = new List<AuditedSelection>();
        public List<AuditedNodeRename> NodeRenames { get; } = new List<AuditedNodeRename>();
        public List<AuditedWorkflowSelected> WorkflowSelections { get; } = new List<AuditedWorkflowSelected>();
    }

    public class NodeRename
    {
        public int NodeId { get; set; }
        public string OldName { get; set; }
        public string NewName { get; set; }
    }

    public class WorkflowSelected
    {
        public int ParentWorkflowId { get; set; }
        public int ChildWorkflowId { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class SelectionController : ControllerBase
    {
        // super ghetto, I know: https://stackoverflow.com/questions/38881767/state-in-apicontroller
        static readonly Dictionary<int, Audits> _actions = 
                    new Dictionary<int, Audits>();

        // GET: api/<SelectionController>
        [HttpGet]
        public IEnumerable<KeyValuePair<int, Audits>> Get()
        {
            foreach (var kvp in _actions)
                yield return kvp;
        }

        // GET api/<SelectionController>/5
        [HttpGet("{workflowId}")]
        public Audits Get(int workflowId)
        {
            return _actions.ContainsKey(workflowId)
                ? _actions[workflowId]
                : new Audits();
        }

        // POST api/<SelectionController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<SelectionController>/5
        [HttpPut("{workflowId}.{guid}.{actionId}/selection")]
        public void Put(int workflowId, string guid, int actionId, [FromBody] int[] value)
        {
            var a = new AuditedSelection { Guid = guid, Id = actionId, NodeIds = value };

            if (!_actions.ContainsKey(workflowId))
                _actions[workflowId] = new Audits();

            _actions[workflowId].Selections.Add(a);
        }

        [HttpPut("{workflowId}.{guid}.{actionId}/noderename")]
        public void Put(int workflowId, string guid, int actionId, [FromBody] NodeRename value)
        {
            var a = new AuditedNodeRename { Guid = guid, Id = actionId, NodeId = value.NodeId, OldName = value.OldName, NewName = value.NewName };

            if (!_actions.ContainsKey(workflowId))
                _actions[workflowId] = new Audits();

            _actions[workflowId].NodeRenames.Add(a);
        }

        [HttpPut("{workflowId}.{guid}.{actionId}/workflowselected")]
        public void Put(int workflowId, string guid, int actionId, [FromBody] WorkflowSelected value)
        {
            var a = new AuditedWorkflowSelected { Guid = guid, Id = actionId, ParentWorkflowId = value.ParentWorkflowId, ChildWorkflowId = value.ChildWorkflowId };

            if (!_actions.ContainsKey(workflowId))
                _actions[workflowId] = new Audits();

            _actions[workflowId].WorkflowSelections.Add(a);
        }

        // DELETE api/<SelectionController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            _actions.Remove(id);
        }

        [HttpDelete()]
        public void Delete()
        {
            _actions.Clear();
        }
    }
}
