using System.Configuration;
using System.Data.SqlClient;
using System.Web.Http;
using CADersBackend.Helpers;

namespace CADersBackend.Controllers
{
    [RoutePrefix("api/dashboard")]
    public class DashboardController : ApiController
    {
        private string ConnStr
        {
            get { return ConfigurationManager.ConnectionStrings["CADersDB"].ConnectionString; }
        }

        // ──────────────────────────────────────────────────────────
        // GET api/dashboard  (Authenticated users)
        // ──────────────────────────────────────────────────────────
        [HttpGet]
        [Route("")]
        public IHttpActionResult Get()
        {
            int totalProjects = 0;
            int totalMessages = 0;

            using (SqlConnection conn = new SqlConnection(ConnStr))
            {
                conn.Open();

                // Count projects
                SqlCommand cmdProjects = new SqlCommand("SELECT COUNT(*) FROM Projects", conn);
                totalProjects = (int)cmdProjects.ExecuteScalar();

                // Count contact messages
                SqlCommand cmdMessages = new SqlCommand("SELECT COUNT(*) FROM ContactMessages", conn);
                totalMessages = (int)cmdMessages.ExecuteScalar();
            }

            return Ok(new
            {
                username = "Admin",
                role = "Admin",
                totalProjects = totalProjects,
                totalMessages = totalMessages,
                visitCount = 0
            });
        }
    }
}
