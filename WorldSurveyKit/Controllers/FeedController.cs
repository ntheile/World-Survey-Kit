using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using WorldSurveyKit.Models;
using WorldSurveyKit.App_Start;

namespace WorldSurveyKit.Controllers
{
    [Auth.FB]
    public class FeedController : ApiController
    {
        private MyDatabase db = new MyDatabase();

        /// GET api/Feed/orgsId
        /// <summary>
        /// Gets last 20 activities in the org
        /// </summary>
        public HttpResponseMessage GetFeed(int id)
        {
            

            if (Auth.FB.IsOrgUser(id))
            {

                List<Feed> f = new List<Feed>();

                // get last 20 published surveys
                IEnumerable<File> files = db.File.Where(z => z.orgsId == id && z.updated_at != null).OrderBy(o => o.updated_at).Take(20);

                // get last 20 completed to surveys
                IEnumerable<NewFileInstance> completed = db.NewFileInstance.Include("User").Include("File").Where(z => z.File.orgsId == id && z.completed == true).OrderBy(o => o.updated_at).Take(20);

                foreach (NewFileInstance fi in completed)
                {
                    // get user who belongs to file
                    f.Add(new Feed { fid = fi.User.fbUserId, feed = "Completed the survey, " + fi.name, date = fi.updated_at.ToString() });
                }

                foreach (File fil in files)
                {
                    // get user who belongs to file
                    f.Add(new Feed { fid = "173158089510832", feed = "Published a new survey, " + fil.fileName, date = fil.updated_at.ToString() });
                }


                return this.Request.CreateResponse(HttpStatusCode.OK, f);
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }

      

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

        public class Feed
        {
            public string fid { get; set; }
            public string feed { get; set; }
            public string date { get; set; }
        }

    }
}