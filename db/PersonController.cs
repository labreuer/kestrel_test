using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace kestrel_test;

[Route("api/[controller]")]
[ApiController]
public class PersonController : ControllerBase
{
    private WfContext _context;

    public PersonController(WfContext context)
    {
        _context = context;
    }

    // GET: api/<ValuesController>
    [HttpGet]
    public object Get()
    {
        return new { People = _context.People.ToArray(), PersonPerson = _context.PersonPerson.ToArray() };
    }

    // GET api/<ValuesController>/5
    [HttpGet("{id}")]
    public string Get(int id)
    {
        return "value";
    }

    // POST api/<ValuesController>
    [HttpPost]
    public void Post([FromBody] string value)
    {
    }

    // PUT api/<ValuesController>/5
    [HttpPut("{id}")]
    public void Put(int id, [FromBody] string value)
    {
    }

    // DELETE api/<ValuesController>/5
    [HttpDelete("{id}")]
    public void Delete(int id)
    {
    }
}
