using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using kestrel_test;

namespace kestrel_test.db
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkflowWorkflowsController : ControllerBase
    {
        private readonly WfContext _context;

        public WorkflowWorkflowsController(WfContext context)
        {
            _context = context;
        }

        // GET: api/WorkflowWorkflows
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkflowWorkflow>>> GetWorkflowWorkflows()
        {
            return await _context.WorkflowWorkflows.ToListAsync();
        }

        // GET: api/WorkflowWorkflows/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkflowWorkflow>> GetWorkflowWorkflow(int id)
        {
            var workflowWorkflow = await _context.WorkflowWorkflows.FindAsync(id);

            if (workflowWorkflow == null)
            {
                return NotFound();
            }

            return workflowWorkflow;
        }

        // PUT: api/WorkflowWorkflows/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutWorkflowWorkflow(int id, WorkflowWorkflow workflowWorkflow)
        {
            if (id != workflowWorkflow.Id)
            {
                return BadRequest();
            }

            _context.Entry(workflowWorkflow).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkflowWorkflowExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/WorkflowWorkflows
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<WorkflowWorkflow>> PostWorkflowWorkflow(WorkflowWorkflow workflowWorkflow)
        {
            _context.WorkflowWorkflows.Add(workflowWorkflow);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetWorkflowWorkflow", new { id = workflowWorkflow.Id }, workflowWorkflow);
        }

        // DELETE: api/WorkflowWorkflows/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkflowWorkflow(int id)
        {
            var workflowWorkflow = await _context.WorkflowWorkflows.FindAsync(id);
            if (workflowWorkflow == null)
            {
                return NotFound();
            }

            _context.WorkflowWorkflows.Remove(workflowWorkflow);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool WorkflowWorkflowExists(int id)
        {
            return _context.WorkflowWorkflows.Any(e => e.Id == id);
        }
    }
}
