using System;
using System.Collections.Generic;

namespace kestrel_test
{
    public partial class WorkflowWorkflow
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int ParentWorkflowId { get; set; }
        public int ChildWorkflowId { get; set; }
        public int ParentWorkflowNode { get; set; }

        public virtual Workflow ChildWorkflow { get; set; }
        public virtual Workflow ParentWorkflow { get; set; }
    }
}
