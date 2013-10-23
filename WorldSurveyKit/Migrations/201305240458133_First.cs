namespace WorldSurveyKit.Migrations
{
    using System;
    using System.Data.Entity.Migrations;

    public partial class First : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Menus",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        text = c.String(),
                        url = c.String(),
                        active = c.String(),
                        created_at = c.String(),
                        updated_at = c.String(),
                        userId = c.String(),
                        dummy = c.String(),
                    })
                .PrimaryKey(t => t.id);

            CreateTable(
                "dbo.Users",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        fbUserId = c.String(nullable: false),
                        name = c.String(nullable: false),
                        isSystemAdmin = c.Boolean(nullable: false),
                        defaultOrg = c.Int(nullable: false),
                        created_at = c.String(),
                        updated_at = c.String(),
                    })
                .PrimaryKey(t => t.id);

            CreateTable(
                "dbo.File",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        fileName = c.String(),
                        created_at = c.String(),
                        updated_at = c.String(),
                        orgsId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Orgs", t => t.orgsId, cascadeDelete: true)
                .Index(t => t.orgsId);

            CreateTable(
                "dbo.Orgs",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        orgName = c.String(),
                        created_at = c.String(),
                        updated_at = c.String(),
                    })
                .PrimaryKey(t => t.id);

            CreateTable(
                "dbo.NewFileInstance",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        created_at = c.String(),
                        updated_at = c.String(),
                        name = c.String(),
                        completed = c.Boolean(nullable: false),
                        userId = c.Int(nullable: false),
                        fileId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Users", t => t.userId, cascadeDelete: true)
                .ForeignKey("dbo.File", t => t.fileId, cascadeDelete: true)
                .Index(t => t.userId)
                .Index(t => t.fileId);

            CreateTable(
                "dbo.QuestionTypeLookup",
                c => new
                    {
                        type = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => t.type);

            CreateTable(
                "dbo.Questions",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        question = c.String(),
                        order = c.Int(nullable: false),
                        type = c.String(maxLength: 128),
                        fileId = c.Int(nullable: false),
                        created_at = c.String(),
                        updated_at = c.String(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.QuestionTypeLookup", t => t.type)
                .ForeignKey("dbo.File", t => t.fileId, cascadeDelete: true)
                .Index(t => t.type)
                .Index(t => t.fileId);

            CreateTable(
                "dbo.Options",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        Option = c.String(maxLength: 8000, unicode: false),
                        questionsId = c.Int(nullable: false),
                        created_at = c.String(),
                        updated_at = c.String(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Questions", t => t.questionsId, cascadeDelete: true)
                .Index(t => t.questionsId);

            CreateTable(
                "dbo.Responses",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        Response = c.String(maxLength: 8000, unicode: false),
                        respondedTo = c.Boolean(nullable: false),
                        questionsId = c.Int(nullable: false),
                        newFileInstanceId = c.Int(nullable: false),
                        created_at = c.String(),
                        updated_at = c.String(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Questions", t => t.questionsId, cascadeDelete: false)
                .ForeignKey("dbo.NewFileInstance", t => t.newFileInstanceId, cascadeDelete: true)
                .Index(t => t.questionsId)
                .Index(t => t.newFileInstanceId);

            CreateTable(
                "dbo.OrgUserMappings",
                c => new
                    {
                        id = c.Int(nullable: false, identity: true),
                        isOrgAdmin = c.Boolean(nullable: false),
                        orgsId = c.Int(nullable: false),
                        usersId = c.Int(nullable: false),
                        created_at = c.String(),
                        updated_at = c.String(),
                    })
                .PrimaryKey(t => t.id)
                .ForeignKey("dbo.Orgs", t => t.orgsId, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.usersId, cascadeDelete: true)
                .Index(t => t.orgsId)
                .Index(t => t.usersId);

        }

        public override void Down()
        {
            DropIndex("dbo.OrgUserMappings", new[] { "usersId" });
            DropIndex("dbo.OrgUserMappings", new[] { "orgsId" });
            DropIndex("dbo.Responses", new[] { "newFileInstanceId" });
            DropIndex("dbo.Responses", new[] { "questionsId" });
            DropIndex("dbo.Options", new[] { "questionsId" });
            DropIndex("dbo.Questions", new[] { "fileId" });
            DropIndex("dbo.Questions", new[] { "type" });
            DropIndex("dbo.NewFileInstance", new[] { "fileId" });
            DropIndex("dbo.NewFileInstance", new[] { "userId" });
            DropIndex("dbo.File", new[] { "orgsId" });
            DropForeignKey("dbo.OrgUserMappings", "usersId", "dbo.Users");
            DropForeignKey("dbo.OrgUserMappings", "orgsId", "dbo.Orgs");
            DropForeignKey("dbo.Responses", "newFileInstanceId", "dbo.NewFileInstance");
            DropForeignKey("dbo.Responses", "questionsId", "dbo.Questions");
            DropForeignKey("dbo.Options", "questionsId", "dbo.Questions");
            DropForeignKey("dbo.Questions", "fileId", "dbo.File");
            DropForeignKey("dbo.Questions", "type", "dbo.QuestionTypeLookup");
            DropForeignKey("dbo.NewFileInstance", "fileId", "dbo.File");
            DropForeignKey("dbo.NewFileInstance", "userId", "dbo.Users");
            DropForeignKey("dbo.File", "orgsId", "dbo.Orgs");
            DropTable("dbo.OrgUserMappings");
            DropTable("dbo.Responses");
            DropTable("dbo.Options");
            DropTable("dbo.Questions");
            DropTable("dbo.QuestionTypeLookup");
            DropTable("dbo.NewFileInstance");
            DropTable("dbo.Orgs");
            DropTable("dbo.File");
            DropTable("dbo.Users");
            DropTable("dbo.Menus");
        }
    }
}
