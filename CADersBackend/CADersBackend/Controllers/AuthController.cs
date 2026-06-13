using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Http;
using CADersBackend.Helpers;
using CADersBackend.Models;

namespace CADersBackend.Controllers
{
    [RoutePrefix("api/auth")]
    public class AuthController : ApiController
    {
        private string ConnStr
        {
            get { return ConfigurationManager.ConnectionStrings["CADersDB"].ConnectionString; }
        }

        // ──────────────────────────────────────────────────────────
        // POST api/auth/login
        // ──────────────────────────────────────────────────────────
        [HttpPost]
        [Route("login")]
        public IHttpActionResult Login([FromBody] LoginRequest request)
        {
            // ── Input validation ──
            if (request == null ||
                string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Username and password are required.");
            }

            // ── Hash the submitted password ──
            string hash = PasswordHelper.ComputeHash(request.Password);

            // ── Query the database with parameterized SQL ──
            int userId = -1;
            string username = null;
            string role = null;

            string sql = "SELECT Id, Username, Role FROM Users WHERE Username = @Username AND PasswordHash = @PasswordHash";

            using (SqlConnection conn = new SqlConnection(ConnStr))
            {
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@Username", request.Username.Trim());
                cmd.Parameters.AddWithValue("@PasswordHash", hash);

                conn.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        userId = (int)reader["Id"];
                        username = reader["Username"].ToString();
                        role = reader["Role"].ToString();
                    }
                }
            }

            if (userId == -1)
            {
                return Unauthorized();
            }

            // ── Create session ──
            HttpContext.Current.Session["UserId"] = userId;
            HttpContext.Current.Session["Username"] = username;
            HttpContext.Current.Session["Role"] = role;
            HttpContext.Current.Session["VisitCount"] = 1;

            // ── Remember Me cookie (7 days) ──
            if (request.RememberMe)
            {
                HttpCookie rememberCookie = new HttpCookie("Username", username);
                rememberCookie.Expires = DateTime.Now.AddDays(7);
                rememberCookie.HttpOnly = false;   // readable by JavaScript
                rememberCookie.Path = "/";
                HttpContext.Current.Response.Cookies.Add(rememberCookie);
            }

            // ── Last Visit cookie (30 days) ──
            HttpCookie lastVisitCookie = new HttpCookie("LastVisit", DateTime.Now.ToString("o"));
            lastVisitCookie.Expires = DateTime.Now.AddDays(30);
            lastVisitCookie.HttpOnly = false;
            lastVisitCookie.Path = "/";
            HttpContext.Current.Response.Cookies.Add(lastVisitCookie);

            return Ok(new
            {
                status = "success",
                message = "Login successful.",
                username = username,
                role = role
            });
        }

        // ──────────────────────────────────────────────────────────
        // POST api/auth/logout
        // ──────────────────────────────────────────────────────────
        [HttpPost]
        [Route("logout")]
        public IHttpActionResult Logout()
        {
            // ── Clear session ──
            HttpContext.Current.Session.Clear();
            HttpContext.Current.Session.Abandon();

            // ── Delete Remember Me cookie ──
            HttpCookie rememberCookie = new HttpCookie("Username", "");
            rememberCookie.Expires = DateTime.Now.AddDays(-1);
            rememberCookie.Path = "/";
            HttpContext.Current.Response.Cookies.Add(rememberCookie);

            return Ok(new { status = "success", message = "Logged out." });
        }

        // ──────────────────────────────────────────────────────────
        // GET api/auth/status
        // ──────────────────────────────────────────────────────────
        [HttpGet]
        [Route("status")]
        public IHttpActionResult Status()
        {
            if (!SessionHelper.IsAuthenticated())
            {
                return Ok(new
                {
                    authenticated = false
                });
            }

            // Increment visit count each time status is checked from a page
            SessionHelper.IncrementVisitCount();

            return Ok(new
            {
                authenticated = true,
                userId = SessionHelper.GetUserId(),
                username = SessionHelper.GetUsername(),
                role = SessionHelper.GetRole(),
                visitCount = SessionHelper.GetVisitCount()
            });
        }
    }
}
