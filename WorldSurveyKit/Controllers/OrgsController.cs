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
using System.Collections.ObjectModel;

namespace WorldSurveyKit.Controllers
{
    [Auth.FB]
    public class OrgsController : ApiController
    {
        private MyDatabase db = new MyDatabase();
        private int uId = Auth.FB.GetUserId();
        private string fbId = Auth.FB.GetFbId();

        /// GET api/Orgs
        /// <summary>
        /// GETs the orgs where you are admin, if your a sys admin then it gets all the orgs
        /// </summary>
        public IEnumerable<Orgs> GetOrgs()
        {

            if (Auth.FB.IsSystemAdmin())
            {
                // get all the orgs
                return db.Orgs.AsEnumerable();
            }
            else
            {
                // get all the orgs that the user deals with and where he is an admin
                var orgs = db.OrgUserMappings.Include("Orgs").Include("Users").Where(
                            o => o.usersId == uId && o.isOrgAdmin == true
                );

                // return only the data we care about
                Collection<Orgs> orgCollection = new Collection<Orgs>();
                foreach (var org in orgs)
                {
                    orgCollection.Add(new Orgs { orgName = org.Orgs.orgName, id = org.Orgs.id, created_at = org.Orgs.created_at, updated_at = org.Orgs.updated_at });
                }

                return orgCollection.AsEnumerable();
            }



        }

        /// GET api/Orgs/5
        /// <summary>
        ///  GETs data about an org by id
        /// </summary>
        public Orgs GetOrgs(int id)
        {
            Orgs orgs = db.Orgs.Find(id);
            if (orgs == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return orgs;
        }

        /// PUT api/Orgs/5
        /// <summary>
        /// UPDATE's the orgName if your an admin, currently not in use and returns null
        /// </summary>
        public HttpResponseMessage PutOrgs(int id, Orgs orgs)
        {
            return null;
        }


        /// POST api/Orgs
        /// <summary>
        /// CREATEs a new org, the person who adds it is automatically the admin, only sys admins can add an org
        /// </summary> 
        public HttpResponseMessage PostOrgs(Orgs orgs)
        {

            if (Auth.FB.IsSystemAdmin())
            {

                if (ModelState.IsValid)
                {
                    // save new org to the Org DB
                    db.Orgs.Add(orgs);
                    db.SaveChanges();

                    // Map user to the org that was just created and make him the admin
                    db.OrgUserMappings.Add(new OrgUserMappings { usersId = uId, isOrgAdmin = true, orgsId = orgs.id });
                    db.SaveChanges();

                    HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, orgs);
                    response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = orgs.id }));
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

        /// DELETE api/Orgs/5
        /// <summary>
        /// DELETEs an entire organization, only a sys admin can do this
        /// </summary>
        public HttpResponseMessage DeleteOrgs(int id)
        {
            if (Auth.FB.IsSystemAdmin())
            {

                Orgs orgs = db.Orgs.Find(id);
                if (orgs == null)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }


                db.Orgs.Remove(orgs);

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK, orgs);
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
}