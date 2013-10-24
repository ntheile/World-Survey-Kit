namespace WorldSurveyKit.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddedSecurityToFileTbl : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.File", "security", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.File", "security");
        }
    }
}
