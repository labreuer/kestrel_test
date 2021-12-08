using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace kestrel_test
{
	public class WfContext : DbContext
	{
		public DbSet<Test> Tests { get; set; }
        public WfContext(DbContextOptions options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // revert EF Core's pluralizing of class names -> table names
            foreach (IMutableEntityType entity in modelBuilder.Model.GetEntityTypes())
                entity.SetTableName(entity.DisplayName());
        }

        public class Test
		{
			public int id { get; set; }
		}
	}
}
