using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace kestrel_test
{
    public partial class WfContext : DbContext
    {
        public WfContext()
        {
        }

        public WfContext(DbContextOptions<WfContext> options) : base(options) { }

        public virtual DbSet<Organization> Organizations { get; set; }
        public virtual DbSet<OrganizationPerson> OrganizationPeople { get; set; }
        public virtual DbSet<Person> People { get; set; }
        public virtual DbSet<PersonPerson> PersonPerson { get; set; }
        public virtual DbSet<Sequence> Sequences { get; set; }
        public virtual DbSet<Test> Tests { get; set; }
        public virtual DbSet<Workflow> Workflows { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Organization>(entity =>
            {
                entity.ToTable("organization");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(400)
                    .HasColumnName("name");
            });

            modelBuilder.Entity<OrganizationPerson>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("organization_person");

                entity.Property(e => e.OrganizationId).HasColumnName("organization_id");

                entity.Property(e => e.PersonId).HasColumnName("person_id");

                entity.HasOne(d => d.Organization)
                    .WithMany()
                    .HasForeignKey(d => d.OrganizationId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("organization_person_organization_id_fkey");

                entity.HasOne(d => d.Person)
                    .WithMany()
                    .HasForeignKey(d => d.PersonId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("organization_person_person_id_fkey");
            });

            modelBuilder.Entity<Person>(entity =>
            {
                entity.ToTable("person");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.FirstName)
                    .IsRequired()
                    .HasMaxLength(64)
                    .HasColumnName("first_name");

                entity.Property(e => e.LastName)
                    .IsRequired()
                    .HasMaxLength(64)
                    .HasColumnName("last_name");
            });

            modelBuilder.Entity<PersonPerson>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("person_person");

                entity.Property(e => e.PrimaryPersonId).HasColumnName("primary_person_id");

                entity.Property(e => e.RelationshipType)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnName("relationship_type");

                entity.Property(e => e.SecondaryPersonId).HasColumnName("secondary_person_id");

                entity.HasOne(d => d.PrimaryPerson)
                    .WithMany()
                    .HasForeignKey(d => d.PrimaryPersonId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("person_person_primary_person_id_fkey");

                entity.HasOne(d => d.SecondaryPerson)
                    .WithMany()
                    .HasForeignKey(d => d.SecondaryPersonId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("person_person_secondary_person_id_fkey");
            });

            modelBuilder.Entity<Sequence>(entity =>
            {
                entity.ToTable("sequence");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.Contents)
                    .IsRequired()
                    .HasColumnType("character varying")
                    .HasColumnName("contents");

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnName("title");

                entity.Property(e => e.WorkflowId).HasColumnName("workflow_id");

                entity.HasOne(d => d.Workflow)
                    .WithMany(p => p.Sequences)
                    .HasForeignKey(d => d.WorkflowId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("sequence_workflow_id_fkey");
            });

            modelBuilder.Entity<Test>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("test");

                entity.Property(e => e.Id).HasColumnName("id");
            });

            modelBuilder.Entity<Workflow>(entity =>
            {
                entity.ToTable("workflow");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.Contents)
                    .IsRequired()
                    .HasColumnType("character varying")
                    .HasColumnName("contents");

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnName("title");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
