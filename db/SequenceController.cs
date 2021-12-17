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
    public class SequenceController : ControllerBase
    {
        private readonly WfContext _context;

        public SequenceController(WfContext context)
        {
            _context = context;
        }

        // GET: api/Sequences
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sequence>>> GetSequences()
        {
            return await _context.Sequences.ToListAsync();
        }

        // GET: api/Sequences/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Sequence>> GetSequence(int id)
        {
            var sequence = await _context.Sequences.FindAsync(id);

            if (sequence == null)
            {
                return NotFound();
            }

            return sequence;
        }

        // PUT: api/Sequences/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSequence(int id, Sequence sequence)
        {
            if (id != sequence.Id)
            {
                return BadRequest();
            }

            _context.Entry(sequence).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SequenceExists(id))
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

        // POST: api/Sequences
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Sequence>> PostSequence(Sequence sequence)
        {
            _context.Sequences.Add(sequence);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSequence", new { id = sequence.Id }, sequence);
        }

        // DELETE: api/Sequences/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSequence(int id)
        {
            var sequence = await _context.Sequences.FindAsync(id);
            if (sequence == null)
            {
                return NotFound();
            }

            _context.Sequences.Remove(sequence);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SequenceExists(int id)
        {
            return _context.Sequences.Any(e => e.Id == id);
        }
    }
}
