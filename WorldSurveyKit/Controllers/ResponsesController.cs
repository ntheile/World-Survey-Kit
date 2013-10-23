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
    public class ResponsesController : ApiController
    {
        private MyDatabase db = new MyDatabase();
        private int uId = Auth.FB.GetUserId();
        private string fbId = Auth.FB.GetFbId();

        /// GET api/Responses
        /// <summary>
        /// GET's all the responses for a user by fbtoken passed in
        /// </summary>
        public IEnumerable<Responses> GetResponses()
        {

            var responses = db.Responses.Where(r => r.NewFileInstance.userId == uId);
            if (responses == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return responses;

        }

        /// GET api/Responses/5
        /// <summary>
        /// GET's all the responses based on the id passed in.
        /// Security - must be the user or OrgAdmin (HasFileInstanceAccess())
        /// </summary>
        public Responses GetResponses(int id)
        {

            Responses responses = db.Responses.Include(i => i.NewFileInstance).SingleOrDefault(r => r.id == id);
            if (responses == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            if (Auth.FB.HasFileInstanceAccess(responses.NewFileInstance))
            {
                return responses;
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }

        /// PUT api/Responses/5
        /// <summary>
        /// Updates a responses
        /// Security - must be the user or OrgAdmin
        /// </summary>
        public HttpResponseMessage PutResponses(int id, Responses responses)
        {
            responses.id = id;


            if (Auth.FB.HasResponseAccess(id))
            {
                if (ModelState.IsValid)
                {
                    db.Entry(responses).State = EntityState.Modified;

                    try
                    {
                        db.SaveChanges();
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        return Request.CreateResponse(HttpStatusCode.NotFound);
                    }

                    return Request.CreateResponse(HttpStatusCode.OK);
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

        // POST api/Responses
        /// <summary>
        /// Creates a response to a question
        /// Security - must have access to the question
        /// </summary>
        public HttpResponseMessage PostResponses(Responses responses)
        {

            if (Auth.FB.HasQuestionAccess(responses.questionsId))
            {
                if (ModelState.IsValid)
                {
                    db.Responses.Add(responses);
                    db.SaveChanges();

                    HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, responses);
                    response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = responses.id }));
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

        /// DELETE api/Responses/5
        /// <summary>
        /// Deletes a response to a question.
        /// Security - must be the user or OrgAdmin
        /// </summary>
        public HttpResponseMessage DeleteResponses(int id)
        {

            if (Auth.FB.HasResponseAccess(id))
            {
                Responses responses = db.Responses.Find(id);
                if (responses == null)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                db.Responses.Remove(responses);

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK, responses);
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
    public class ResponseCollectionController : ApiController
    {
        private MyDatabase db = new MyDatabase();
        private int uId = Auth.FB.GetUserId();
        private string fbId = Auth.FB.GetFbId();


        /// GET api/RespsonseCollection/orgId
        /// <summary>
        /// GET's all the responses for an org
        /// </summary>
        /// 
        [HttpGet]
        public HttpResponseMessage GetResponseCollection(int id)
        {

            if (Auth.FB.IsOrgAdmin(id))
            {
                var responses = db.Responses.Where(r => r.Questions.File.orgsId == id);
                if (responses == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return this.Request.CreateResponse(HttpStatusCode.OK, responses);

            }
            else
            {
                return this.Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }

    }

    [Auth.FB]
    public class ResponseCollectionByFileInstController : ApiController
    {
        private MyDatabase db = new MyDatabase();
        private int uId = Auth.FB.GetUserId();
        private string fbId = Auth.FB.GetFbId();

        /// GET api/RespsonseCollection/fileInstId
        /// <summary>
        /// GET's all the responses for a fileInstId
        /// </summary>
        /// 
        [HttpGet]
        public HttpResponseMessage GetResponseCollectionByFileInst(int id)
        {

            if (Auth.FB.HasFileInstanceAccess(id))
            {
                var responses = db.Responses.Where(r => r.newFileInstanceId == id);
                if (responses == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return this.Request.CreateResponse(HttpStatusCode.OK, responses);

            }
            else
            {
                return this.Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }

    }
}