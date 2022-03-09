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
    public class WorkflowController : ControllerBase
    {
        private readonly WfContext _context;

        public WorkflowController(WfContext context)
        {
            _context = context;
        }

        // GET: api/Workflow
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Workflow>>> GetWorkflows()
        {
            return await _context.Workflows.ToListAsync();
        }

        // GET: api/Workflow/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Workflow>> GetWorkflow(int id)
        {
            var workflow = await _context.Workflows
                .Include(w => w.Sequences)
                //.Include(w => w.WorkflowWorkflowChildWorkflows)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (workflow == null)
            {
                return NotFound();
            }

            return workflow;
        }

        // PUT: api/Workflow/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutWorkflow(int id, Workflow workflow)
        {
            if (id != workflow.Id)
            {
                return BadRequest();
            }

            _context.Entry(workflow).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkflowExists(id))
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

        // POST: api/Workflow
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Workflow>> PostWorkflow(Workflow workflow)
        {
            // JS currently assigns a temporary negative value; erase that and let the DB set the identity
            workflow.Id = 0;
            _context.Workflows.Add(workflow);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetWorkflow", new { id = workflow.Id }, workflow);
        }

        // DELETE: api/Workflow/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkflow(int id)
        {
            var workflow = await _context.Workflows.FindAsync(id);
            if (workflow == null)
            {
                return NotFound();
            }

            _context.Workflows.Remove(workflow);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool WorkflowExists(int id)
        {
            return _context.Workflows.Any(e => e.Id == id);
        }
    }
}
