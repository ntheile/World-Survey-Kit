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
using System.Web.Http.OData;

namespace WorldSurveyKit.Controllers
{
    [Auth.FB]
    public class FileInstancesController : ApiController
    {

        private MyDatabase db = new MyDatabase();
        private int uId = Auth.FB.GetUserId();
        private string fbId = Auth.FB.GetFbId();

        // GET api/FileInstances
        /// <summary>
        /// GET's all file instances that belong to the user
        /// </summary>
        public IEnumerable<NewFileInstance> GetNewFileInstances()
        {
            var fileInstances = db.NewFileInstance.Where(r => r.userId == uId);
            if (fileInstances == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return fileInstances.AsEnumerable();

        }


        /// GET api/FileInstances/5
        /// <summary>
        /// Gets the FileInstance by ID
        /// </summary>
        public NewFileInstance GetNewFileInstance(int id)
        {

            NewFileInstance newfileinstance = db.NewFileInstance.Find(id);
            if (newfileinstance == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            // HasFileInstanceAccess(fileInstanceId) - yes if you are an orgAdmin , yes if you are a sys admin, yes if you userId is on the file
            if (Auth.FB.HasFileInstanceAccess(newfileinstance))
            {
                return newfileinstance;
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }

        /// PUT api/FileInstances/5
        /// <summary>
        /// Updates the file instance that is passed in by id
        /// </summary>
        public HttpResponseMessage PutNewFileInstance(int id, Delta<NewFileInstance> newfileinstance)
        {

            // find the FileInstance by id passed in and gather data to merge 
            NewFileInstance _fileInst = db.NewFileInstance.SingleOrDefault(f => f.id == id);
            if (_fileInst == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            // does the user have access to this file instance?
            if (Auth.FB.HasFileInstanceAccess(_fileInst))
            {

                // patch/merge data together
                newfileinstance.Patch(_fileInst);

                try
                {
                    db.SaveChanges();
                }
                catch (Exception e)
                {
                    //return Request.CreateResponse(HttpStatusCode.NotFound);
                    throw e;
                }

                return Request.CreateResponse(HttpStatusCode.OK);

            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }

        /// POST api/FileInstances
        /// <summary>
        /// Creates a new file instance for the user, if the user has access to the file
        /// </summary>
        public HttpResponseMessage PostNewFileInstance(NewFileInstance newfileinstance)
        {

            newfileinstance.userId = uId;
            newfileinstance.created_at = DateTime.Now.ToString("O");

            // create file instance only if you have access to a file
            if (Auth.FB.HasFileAccess(newfileinstance.fileId))
            {
                if (ModelState.IsValid)
                {
                    db.NewFileInstance.Add(newfileinstance);
                    db.SaveChanges();

                    HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, newfileinstance);
                    response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = newfileinstance.id }));
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

        // DELETE api/FileInstances/5
        /// <summary>
        /// Deletes the file instance that is passed in by id
        /// </summary>
        public HttpResponseMessage DeleteNewFileInstance(int id)
        {

            // find the FileInstance by id passed in and gather data 
            NewFileInstance newfileinstance = db.NewFileInstance.Find(id);
            if (newfileinstance == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            // does the user have access to this file instance?
            if (Auth.FB.HasFileInstanceAccess(newfileinstance))
            {

                db.NewFileInstance.Remove(newfileinstance);

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK, newfileinstance);
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
    public class FileInstanceCollectionController : ApiController
    {
        private MyDatabase db = new MyDatabase();
        private int uId = Auth.FB.GetUserId();
        private string fbId = Auth.FB.GetFbId();

        /// GET api/FileInstanceCollection/OrgId
        /// <summary>
        /// GET's all file instances that belong to an org for reports
        /// </summary>
        public HttpResponseMessage GetFileInstanceCollection(int id)
        {

            if (Auth.FB.IsOrgAdmin(id))
            {
                var fileInstances = db.NewFileInstance.Include(u => u.User).Where(r => r.File.orgsId == id);
                if (fileInstances == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return this.Request.CreateResponse(HttpStatusCode.OK, fileInstances);
            }
            else
            {
                return this.Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }

    }


}