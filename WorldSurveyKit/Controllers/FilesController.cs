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
    public class FilesController : ApiController
    {
        private MyDatabase db = new MyDatabase();

        /// GET api/Files/orgsId
        /// <summary>
        /// Gets all the files that belong to an organization
        /// </summary>
        public HttpResponseMessage GetFile(int id)
        {
            
            if (Auth.FB.IsOrgUser(id))
            {
                var files = db.File.Where(f => f.orgsId == id);
                if (files == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return this.Request.CreateResponse(HttpStatusCode.OK, files);
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }

        // PUT api/Files/{fileId}
        /// <summary>
        /// Update a file, for example update the published date by passing in the updated_at field, note this is not a patch and all valus must be passed in. 
        /// </summary>
        public HttpResponseMessage PutFile(int id, File file)
        {

            if (Auth.FB.IsOrgAdmin(file.orgsId))
            {
                if (ModelState.IsValid && id == file.id)
                {
                    if (file.security != "public" && file.security != "private")
                    {
                        file.security = "public";
                    }
                    
                    db.Entry(file).State = EntityState.Modified;

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
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }
        }

        /// POST api/Files
        /// <summary>
        /// CREATE's a new file for the org passed in
        /// </summary>
        public HttpResponseMessage PostFile(File file)
        {

            if (Auth.FB.IsOrgAdmin(file.orgsId))
            {
                if (ModelState.IsValid)
                {
                    if (file.security != "public" && file.security != "private")
                    {
                        file.security = "public";
                    }
                    
                    db.File.Add(file);
                    db.SaveChanges();

                    HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, file);
                    response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = file.id }));
                    return response;
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest);
                }
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }


        /// DELETE api/Files/{fileId}
        /// <summary>
        /// DELETE's a file by id
        /// </summary>
        public HttpResponseMessage DeleteFile(int id)
        {
            // get the org the file belongs to
            int fileId = GetOrgId(id);

            if (Auth.FB.IsOrgAdmin(fileId))
            {
                File file = db.File.Find(id);
                if (file == null)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                db.File.Remove(file);

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK, file);
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }

        // helper methods
        private int GetOrgId(int fileId)
        {
            File file = db.File.First(f => f.id == fileId);
            return file.orgsId;
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }


       
    }
}