using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace kestrel_test
{
    public partial class Workflow
    {
        public Workflow()
        {
            Sequences = new HashSet<Sequence>();
            WorkflowWorkflowChildWorkflows = new HashSet<WorkflowWorkflow>();
            WorkflowWorkflowParentWorkflows = new HashSet<WorkflowWorkflow>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Title { get; set; }
        public string Contents { get; set; }

        public virtual ICollection<Sequence> Sequences { get; set; }
        public virtual ICollection<WorkflowWorkflow> WorkflowWorkflowChildWorkflows { get; set; }
        public virtual ICollection<WorkflowWorkflow> WorkflowWorkflowParentWorkflows { get; set; }
    }
}
