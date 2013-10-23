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
    public class OptionsController : ApiController
    {
        private MyDatabase db = new MyDatabase();

        /// GET api/Options/questionId
        /// <summary>
        /// GET's all the options for a particular question, a QuestionsId must be passed in
        /// </summary>
        public IEnumerable<Options> GetOptions(int id)
        {

            if (Auth.FB.HasQuestionAccess(id))
            {
                IEnumerable<Options> opt = db.Options.Where(o => o.questionsId == id);
                if (opt == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return opt;
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }


        /// POST api/Options
        /// <summary>
        /// Creates a new option for a question
        /// Security - Must be org admin
        /// </summary>
        public HttpResponseMessage PostOptions(Options options)
        {

            // get the file that this option belongs to
            Questions file = db.Questions.Find(options.questionsId);
            // get the org id based off the file 
            File org = db.File.Find(file.fileId);

            // check if the user the an Org Admin
            if (Auth.FB.IsOrgAdmin(org.orgsId))
            {
                if (ModelState.IsValid)
                {
                    db.Options.Add(options);
                    db.SaveChanges();

                    HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, options);
                    response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = options.id }));
                    return response;
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest);
                }
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }

        /// DELETE api/Options/5
        /// <summary>
        /// Deletes an option for a question
        /// Security - Must be org admin
        /// </summary>
        public HttpResponseMessage DeleteOptions(int id)
        {

            Options options = db.Options.Find(id);
            if (options == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            // get the file that this option belongs to
            Questions file = db.Questions.Find(options.questionsId);
            // get the org id based off the file 
            File org = db.File.Find(file.fileId);

            // check if the user the an Org Admin
            if (Auth.FB.IsOrgAdmin(org.orgsId))
            {
                db.Options.Remove(options);

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK, options);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }



        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

    }


    [Auth.FB]
    public class OptionCollectionController : ApiController
    {
        private MyDatabase db = new MyDatabase();

        /// GET api/OptionCollection/OrgId
        /// <summary>
        /// GET's all the options for all the questions in an org
        /// Security must be org user
        /// </summary>
        public HttpResponseMessage GetOptionCollection(int id)
        {

            if (Auth.FB.IsOrgUser(id))
            {
                var questions = db.Options.Where(o => o.Questions.File.orgsId == id);
                if (questions == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return this.Request.CreateResponse(HttpStatusCode.OK, questions);
            }
            else
            {
                return this.Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }

    }

}