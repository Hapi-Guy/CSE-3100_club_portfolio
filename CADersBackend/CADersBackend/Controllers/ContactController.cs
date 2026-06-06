using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Http;
using CADersBackend.Models;

namespace CADersBackend.Controllers
{
    public class ContactController : ApiController
    {
        // POST api/contact
        [HttpPost]
        public IHttpActionResult Post([FromBody] ContactMessage msg)
        {
            if (msg == null ||
                string.IsNullOrWhiteSpace(msg.Name) ||
                string.IsNullOrWhiteSpace(msg.Email) ||
                string.IsNullOrWhiteSpace(msg.Message))
            {
                return BadRequest("All fields (name, email, message) are required.");
            }

            string connStr = ConfigurationManager.ConnectionStrings["CADersDB"]
                                                  .ConnectionString;

            string sql = @"INSERT INTO ContactMessages (Name, Email, Message, SubmittedAt)
                           VALUES (@Name, @Email, @Message, @SubmittedAt)";

            using (SqlConnection conn = new SqlConnection(connStr))
            {
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@Name", msg.Name);
                cmd.Parameters.AddWithValue("@Email", msg.Email);
                cmd.Parameters.AddWithValue("@Message", msg.Message);
                cmd.Parameters.AddWithValue("@SubmittedAt", DateTime.Now);

                conn.Open();
                cmd.ExecuteNonQuery();
            }

            return Ok(new { status = "success", message = "Message received!" });
        }
    }
}
