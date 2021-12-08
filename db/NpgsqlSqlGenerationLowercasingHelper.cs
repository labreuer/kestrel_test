using Microsoft.EntityFrameworkCore.Storage;
using Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal;
using System.Text;

namespace kestrel_test
{
    // EF1001  Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlSqlGenerationHelper is an internal API
    // that supports the Entity Framework Core infrastructure and not subject to the same compatibility standards as
    // public APIs. It may be changed or removed without notice in any release.
#pragma warning disable EF1001

    // https://stackoverflow.com/questions/35914530/case-insensitive-name-of-tables-and-properties-in-entity-framework-7/66244102#66244102
    /// <summary>A replacement for <see cref="NpgsqlSqlGenerationHelper"/>
    /// to convert PascalCaseCsharpyIdentifiers to alllowercasenames.
    /// So table and column names with no embedded punctuation
    /// get generated with no quotes or delimiters.</summary>
    public class NpgsqlSqlGenerationLowercasingHelper : NpgsqlSqlGenerationHelper
    {
        //Don't lowercase ef's migration table
        const string dontAlter = "__EFMigrationsHistory";
        static string Customize(string input) => input == dontAlter ? input : input.ToLower();
        public NpgsqlSqlGenerationLowercasingHelper(RelationalSqlGenerationHelperDependencies dependencies)
            : base(dependencies) { }
        public override string DelimitIdentifier(string identifier)
            => base.DelimitIdentifier(Customize(identifier));
        public override void DelimitIdentifier(StringBuilder builder, string identifier)
            => base.DelimitIdentifier(builder, Customize(identifier));
    }
}
