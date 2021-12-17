using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace kestrel_test.Pages
{
	public class IndexModel : PageModel
	{
		private readonly ILogger<IndexModel> _logger;
		public Test[] Tests { get; private set; }
		public Person[] People { get; private set; }
		public Workflow[] Workflows { get; private set; }
		public IEnumerable<SelectListItem> WorkflowsSelect => Workflows.Select(w => new SelectListItem { Value = w.Id.ToString(), Text = w.Title });
		public string SelectedWorkflow { get; set; }

		public IndexModel(ILogger<IndexModel> logger, WfContext context)
		{
			_logger = logger;
			Tests = context.Tests.ToArray();
			People = context.People.ToArray();
			Workflows = context.Workflows.OrderBy(w => w.Id).ToArray();
		}

		public void OnGet()
		{
		}
	}
}
