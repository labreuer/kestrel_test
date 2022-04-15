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
        public JsonElement JsonElement { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class SelectionController : ControllerBase
    {
        static readonly Dictionary<int, List<AuditedEvent>> _actions = 
                    new Dictionary<int, List<AuditedEvent>>();

        // GET: api/<SelectionController>
        [HttpGet]
        public IEnumerable<KeyValuePair<int, List<AuditedEvent>>> Get()
        {
            foreach (var kvp in _actions)
                yield return kvp;
        }

        // GET api/<SelectionController>/5
        [HttpGet("{workflowId}")]
        public List<AuditedEvent> Get(int workflowId)
        {
            return _actions.ContainsKey(workflowId)
                ? _actions[workflowId]
                : new List<AuditedEvent>(0);
        }

        // POST api/<SelectionController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<SelectionController>/5
        [HttpPut("{workflowId}.{guid}.{actionId}")]
        public void Put(int workflowId, string guid, int actionId, [FromBody] JsonElement value)
        {
            var ae = new AuditedEvent { Guid = guid, Id = actionId, JsonElement = value };

            if (!_actions.ContainsKey(workflowId))
                _actions[workflowId] = new List<AuditedEvent> { ae };
            else
                _actions[workflowId].Add(ae);
        }

        // DELETE api/<SelectionController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            _actions.Remove(id);
        }
    }
}
