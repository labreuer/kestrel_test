using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace kestrel_test
{
    public partial class Sequence
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int WorkflowId { get; set; }
        public string Contents { get; set; }

        [JsonIgnore]
        public virtual Workflow Workflow { get; set; }
    }
}
