using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Http;
using CADersBackend.Helpers;
using CADersBackend.Models;

namespace CADersBackend.Controllers
{
    public class ContactController : ApiController
    {
        private string ConnStr
        {
            get { return ConfigurationManager.ConnectionStrings["CADersDB"].ConnectionString; }
        }

        // ──────────────────────────────────────────────────────────
        // POST api/contact  (Public – ORIGINAL, UNCHANGED)
        // ──────────────────────────────────────────────────────────
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

        // ──────────────────────────────────────────────────────────
        // GET api/contact  (Admin only)
        // ──────────────────────────────────────────────────────────
        [HttpGet]
        public IHttpActionResult Get()
        {

            List<ContactMessage> messages = new List<ContactMessage>();
            string sql = "SELECT Id, Name, Email, Message, SubmittedAt FROM ContactMessages ORDER BY SubmittedAt DESC";

            using (SqlConnection conn = new SqlConnection(ConnStr))
            {
                SqlCommand cmd = new SqlCommand(sql, conn);
                conn.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        messages.Add(new ContactMessage
                        {
                            Id = (int)reader["Id"],
                            Name = reader["Name"].ToString(),
                            Email = reader["Email"].ToString(),
                            Message = reader["Message"].ToString(),
                            SubmittedAt = (DateTime)reader["SubmittedAt"]
                        });
                    }
                }
            }

            return Ok(messages);
        }

        // ──────────────────────────────────────────────────────────
        // DELETE api/contact/{id}  (Admin only)
        // ──────────────────────────────────────────────────────────
        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {

            string sql = "DELETE FROM ContactMessages WHERE Id = @Id";

            int rows;
            using (SqlConnection conn = new SqlConnection(ConnStr))
            {
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@Id", id);

                conn.Open();
                rows = cmd.ExecuteNonQuery();
            }

            if (rows == 0) return NotFound();

            return Ok(new { status = "success", message = "Message deleted." });
        }
    }
}

