using System;
using System.Collections.Generic;

namespace kestrel_test
{
    public partial class PersonPerson
    {
        public int PrimaryPersonId { get; set; }
        public int SecondaryPersonId { get; set; }
        public string RelationshipType { get; set; }

        public virtual Person PrimaryPerson { get; set; }
        public virtual Person SecondaryPerson { get; set; }
    }
}
