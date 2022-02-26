using System;
using System.Collections.Generic;

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

        public int Id { get; set; }
        public string Title { get; set; }
        public string Contents { get; set; }

        public virtual ICollection<Sequence> Sequences { get; set; }
        public virtual ICollection<WorkflowWorkflow> WorkflowWorkflowChildWorkflows { get; set; }
        public virtual ICollection<WorkflowWorkflow> WorkflowWorkflowParentWorkflows { get; set; }
    }
}
