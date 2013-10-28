// Run these commands to update the database schemas when you modify a model
// Add-Migration 201302041652147_AddUserRole
// Update-Database

// to get the sql script to push to prod db's
// Update-Database -Script -SourceMigration $InitialDatabase

// to get script after model changes have been made
// Update-Database -Script -SourceMigration:InitialCreate -TargetMigration:"AddUserRoles"

namespace WorldSurveyKit.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using WorldSurveyKit.Models;

    internal sealed class Configuration : DbMigrationsConfiguration<WorldSurveyKit.Models.MyDatabase>
    {
        public Configuration()
        {
            // comment this out for prod
            AutomaticMigrationsEnabled = true;
            //AutomaticMigrationDataLossAllowed = true;

        }

        // This method will be called after migrating to the latest version.
        protected override void Seed(WorldSurveyKit.Models.MyDatabase db)
        {




            //add a lookup table of question types
            db.QuestionTypeLookup.AddOrUpdate(
                q => q.type,
                   new QuestionTypeLookup { type = "OpenEnded" },
                   new QuestionTypeLookup { type = "Gps" },
                   new QuestionTypeLookup { type = "SingleAnswer" },
                   new QuestionTypeLookup { type = "MultipleChoice" },
                   new QuestionTypeLookup { type = "Signature" }
            );

            //// add an org
            //db.Orgs.AddOrUpdate(
            //    new Orgs { id = 1, orgName = "World Survey Kit" }
            //);


            //// add a user
            //db.Users.AddOrUpdate(
            //    new Users { id = 1, name = "Nick Theile", fbUserId = "292000849", defaultOrg = 1, isSystemAdmin = true, created_at = DateTime.Now.ToString("O"), updated_at = DateTime.Now.ToString("O") },
            //    new Users { id = 2, name = "Pat", fbUserId = "100005310341290", defaultOrg = 1, created_at = DateTime.Now.ToString("O"), updated_at = DateTime.Now.ToString("O") },
            //    new Users { id = 3, name = "Billy Madison", fbUserId = "100005652874460", defaultOrg = 1, created_at = DateTime.Now.ToString("O"), updated_at = DateTime.Now.ToString("O") },
            //    new Users { id = 4, name = "Lisa Non Admin", fbUserId = "100005630701208", defaultOrg = 1, created_at = DateTime.Now.ToString("O"), updated_at = DateTime.Now.ToString("O") }
            //);

            //// map user to org
            //db.OrgUserMappings.AddOrUpdate(
            //    new OrgUserMappings { isOrgAdmin = true, orgsId = 1, usersId = 1 },
            //    new OrgUserMappings { isOrgAdmin = true, orgsId = 1, usersId = 2 },
            //    new OrgUserMappings { isOrgAdmin = true, orgsId = 1, usersId = 3 },
            //    new OrgUserMappings { isOrgAdmin = true, orgsId = 1, usersId = 4 }
            //);


            //// 6.   add a new file
            //db.File.AddOrUpdate(
            //    new File { FileId = 1,  FileName = "Kenya Survey", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString(), OrgsId = 1 }
            //);


            //// 9.  add a question to a file
            //db.Questions.AddOrUpdate(
            //    new Questions { Id = 1, FileId = 1, Order = 1, Type = "Open Ended", Question = "How does your water tastes?", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Questions { Id = 2, FileId = 1, Order = 2, Type = "Gps", Question = "GPS coordinates of the home:", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Questions { Id = 3, FileId = 1, Order = 3, Type = "Camera", Question = "Take a pic of the house:", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Questions { Id = 4, FileId = 1, Order = 4, Type = "Single Answer", Question = "How old are you?", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Questions { Id = 5, FileId = 1, Order = 5, Type = "Multiple Choice", Question = "What are the ages of your children?", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Questions { Id = 6, FileId = 1, Order = 6, Type = "Signature", Question = "Can we get your signature for carbon credits?", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() }
            //);

            //// 10.  Add options to the questions
            //db.Options.AddOrUpdate(
            //    new Options { Id = 1,  QuestionsId = 4, Option = "1-10", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Options { Id = 2,  QuestionsId = 4, Option = "11-21", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Options { Id = 3, QuestionsId = 4, Option = "21-40", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Options { Id = 4, QuestionsId = 4, Option = "40+", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Options { Id = 5, QuestionsId = 5, Option = "1-3", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Options { Id = 6, QuestionsId = 5, Option = "4-10", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Options { Id = 7, QuestionsId = 5, Option = "11-18", Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() }
            //);


            //// 11.  create a new instance of a file
            //db.NewFileInstance.AddOrUpdate(
            //    new NewFileInstance { Id = 1, Completed = false, FileId = 1, UserId = 1 }
            //);

            ////  12.  answer a question in the new file instance we created in 10
            //db.Responses.AddOrUpdate(
            //    new Responses { Id = 1, QuestionsId=1, Response = "The water has a bit of a salty taste.", RespondedTo = true, NewFileInstanceId = 1, Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Responses { Id = 2, QuestionsId = 2, Response = "{ latitde: '45.3', longitude: '64.7', moreInfo: 'One the corner of Third and Main behind the deli' }", RespondedTo = true, NewFileInstanceId = 1, Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Responses { Id = 3, QuestionsId = 3, Response = "{ local: '/mnt/sd-ext/pic1.jpg', remote: 'http://dropbox.com/aci/pic1.jpg' }", RespondedTo = true, NewFileInstanceId = 1, Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Responses { Id = 4, QuestionsId = 4, Response = "11-21", RespondedTo = true, NewFileInstanceId = 1, Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Responses { Id = 5, QuestionsId = 5, Response = "1-3", RespondedTo = true, NewFileInstanceId = 1, Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Responses { Id = 6, QuestionsId = 5, Response = "4-10", RespondedTo = true, NewFileInstanceId = 1, Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() },
            //    new Responses { Id = 7, QuestionsId = 6, Response = "[{'lx':20,'ly':34,'mx':20,'my':34},{'lx':21,'ly':33,'mx':20,'my':34} ]", RespondedTo = true, NewFileInstanceId = 1, Created_At = DateTime.Now.ToString(), Updated_At = DateTime.Now.ToString() }
            //);



        }




    }
}
