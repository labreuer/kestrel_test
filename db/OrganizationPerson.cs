using System;
using System.Collections.Generic;

namespace kestrel_test
{
    public partial class OrganizationPerson
    {
        public int OrganizationId { get; set; }
        public int PersonId { get; set; }

        public virtual Organization Organization { get; set; }
        public virtual Person Person { get; set; }
    }
}
