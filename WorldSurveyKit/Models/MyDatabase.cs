using System.Data.Entity;

namespace WorldSurveyKit.Models
{
    public class MyDatabase : DbContext
    {
        // You can add custom code to this file. Changes will not be overwritten.
        // 
        // If you want Entity Framework to drop and regenerate your database
        // automatically whenever you change your model schema, add the following
        // code to the Application_Start method in your Global.asax file.
        // Note: this will destroy and re-create your database with every model change.
        // 
        // System.Data.Entity.Database.SetInitializer(new System.Data.Entity.DropCreateDatabaseIfModelChanges<WorldSurveyKit.Models.MyDatabase>());


        public MyDatabase() : base("name=MyDatabase") { }

        public DbSet<Menu> Menus { get; set; }

        public DbSet<Users> Users { get; set; }

        public DbSet<File> File { get; set; }

        public DbSet<NewFileInstance> NewFileInstance { get; set; }

        public DbSet<QuestionTypeLookup> QuestionTypeLookup { get; set; }

        public DbSet<Questions> Questions { get; set; }

        public DbSet<Options> Options { get; set; }

        public DbSet<Responses> Responses { get; set; }

        public DbSet<Orgs> Orgs { get; set; }

        public DbSet<OrgUserMappings> OrgUserMappings { get; set; }


        // If needed To get rid of the cascading delete errors
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {

            //http://blog.appharbor.com/2012/04/24/automatic-migrations-with-entity-framework-4-3


        }


    }

}
