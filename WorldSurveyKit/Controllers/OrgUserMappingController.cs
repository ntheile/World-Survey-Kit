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
    public class OrgUserMappingController : ApiController
    {
        private MyDatabase db = new MyDatabase();
        private int uId = Auth.FB.GetUserId();

        /// GET api/OrgUserMapping/5
        /// <summary>
        /// GET's all the users from the orgID that is passed in
        /// </summary>
        public HttpResponseMessage GetOrgUserMappings(int id)
        {

            if (Auth.FB.IsOrgAdmin(id))
            {
                var orgusermappings = db.OrgUserMappings.Include("Users").Where(o => o.orgsId == id);
                if (orgusermappings == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return this.Request.CreateResponse(HttpStatusCode.OK, orgusermappings);
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }

        /// PUT api/OrgUserMapping/318
        /// <summary>
        /// UPDATES a user by his OrgUserMapping Id that is passed in. 
        /// You could use this api to make a user an admin. Can be used for partial updates
        /// </summary>
        public HttpResponseMessage PutOrgUserMappings(int id, Delta<OrgUserMappings> orgusermappings)
        {

            // find the org that the ID mapping belongs too
            OrgUserMappings _orgusermap = db.OrgUserMappings.SingleOrDefault(o => o.id == id);
            if (_orgusermap == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }


            // now find what org this ID belongs to, is this user an admin
            if (Auth.FB.IsOrgAdmin(_orgusermap.orgsId))
            {

                orgusermappings.Patch(_orgusermap);

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
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }

        /// POST api/OrgUserMapping
        /// <summary>
        /// CREATE's a new user for an org
        /// </summary>
        public HttpResponseMessage PostOrgUserMappings(OrgUserMappings orgusermappings)
        {

            if (Auth.FB.IsOrgAdmin(orgusermappings.orgsId))
            {

                // add user to the org
                if (ModelState.IsValid)
                {

                    // Make sure the user does not already belong to the org
                    IEnumerable<OrgUserMappings> alreadyExist = db.OrgUserMappings.Where(a => a.usersId == orgusermappings.usersId && a.orgsId == orgusermappings.orgsId);
                    if (alreadyExist.Count() > 0) // user already exists in the orgs 
                    {
                        return Request.CreateResponse(HttpStatusCode.BadRequest);
                    }
                    else //user does not already belong to the org
                    {
                        // set the orgsID
                        db.OrgUserMappings.Add(orgusermappings);
                        db.SaveChanges();

                        var orgU = db.OrgUserMappings.Include("Users").FirstOrDefault(
                            o => o.usersId == orgusermappings.usersId
                                && o.orgsId == orgusermappings.orgsId
                        );

                        // now if the users default org = 1 then change it to this orgsId
                        if (orgU.Users.defaultOrg == 1)
                        {
                            Users u = db.Users.Find(orgU.usersId);
                            u.defaultOrg = orgU.orgsId;
                            db.SaveChanges();
                        }


                        if (orgU == null)
                        {
                            throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                        }

                        return this.Request.CreateResponse(HttpStatusCode.Created, orgU);
                    }

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

        /// DELETE api/OrgUserMapping/5
        /// <summary>
        /// DELETE's a user from an org by passing in the id primary key from the OrgUserMapping Table
        /// </summary>
        public HttpResponseMessage DeleteOrgUserMappings(int id)
        {

            // find the org the ID mapping belongs too
            OrgUserMappings orgusermappings = db.OrgUserMappings.Find(id);
            if (orgusermappings == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            // now find what org this ID belongs to, is this user an admin
            if (Auth.FB.IsOrgAdmin(orgusermappings.orgsId))
            {

                // if this org was the users default org then set a different default org for him
                // if he is not a member of any more orgs then set the default org to 1 (World Survey Kit)
                Users u = db.Users.First(uu => uu.id == orgusermappings.usersId); // find the users default org
                if (u.defaultOrg == orgusermappings.orgsId) // if this is the users default org org then set it to something else
                {
                    // find another org the user is a member of
                    IEnumerable<OrgUserMappings> ou = db.OrgUserMappings.Where(oo => oo.orgsId != orgusermappings.orgsId && oo.usersId == orgusermappings.usersId);
                    if (ou.Count() > 0)
                    {
                        // set the first org as the new default org
                        Users setUser = db.Users.Find(orgusermappings.usersId);
                        setUser.defaultOrg = ou.First().orgsId;

                        // Update database
                        db.Entry(setUser).CurrentValues.SetValues(setUser);
                        db.SaveChanges();
                        db.Entry(setUser).State = EntityState.Detached;


                    }
                    else
                    {
                        // set the default org to 1
                        Users setUser = db.Users.Find(orgusermappings.usersId);
                        setUser.defaultOrg = 1;

                        // Update database
                        db.Entry(setUser).CurrentValues.SetValues(setUser);
                        db.SaveChanges();
                        db.Entry(setUser).State = EntityState.Detached;
                    }

                }

                // now remove the user from the org
                db.OrgUserMappings.Remove(orgusermappings);
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }


                return Request.CreateResponse(HttpStatusCode.OK, orgusermappings);


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
    }
}