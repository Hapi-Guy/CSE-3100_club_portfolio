using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Http;
using CADersBackend.Helpers;
using CADersBackend.Models;

namespace CADersBackend.Controllers
{
    public class ProjectsController : ApiController
    {
        private string ConnStr
        {
            get { return ConfigurationManager.ConnectionStrings["CADersDB"].ConnectionString; }
        }

        // ──────────────────────────────────────────────────────────
        // GET api/projects  (Public)
        // ──────────────────────────────────────────────────────────
        [HttpGet]
        public IHttpActionResult Get()
        {
            List<Project> projects = new List<Project>();
            string sql = "SELECT Id, Title, Description, ImageUrl, CreatedAt FROM Projects ORDER BY CreatedAt DESC";

            using (SqlConnection conn = new SqlConnection(ConnStr))
            {
                SqlCommand cmd = new SqlCommand(sql, conn);
                conn.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        projects.Add(new Project
                        {
                            Id = (int)reader["Id"],
                            Title = reader["Title"].ToString(),
                            Description = reader["Description"].ToString(),
                            ImageUrl = reader["ImageUrl"] == DBNull.Value ? "" : reader["ImageUrl"].ToString(),
                            CreatedAt = (DateTime)reader["CreatedAt"]
                        });
                    }
                }
            }

            return Ok(projects);
        }

        // ──────────────────────────────────────────────────────────
        // GET api/projects/{id}  (Public)
        // ──────────────────────────────────────────────────────────
        [HttpGet]
        public IHttpActionResult Get(int id)
        {
            string sql = "SELECT Id, Title, Description, ImageUrl, CreatedAt FROM Projects WHERE Id = @Id";

            using (SqlConnection conn = new SqlConnection(ConnStr))
            {
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@Id", id);
                conn.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        var project = new Project
                        {
                            Id = (int)reader["Id"],
                            Title = reader["Title"].ToString(),
                            Description = reader["Description"].ToString(),
                            ImageUrl = reader["ImageUrl"] == DBNull.Value ? "" : reader["ImageUrl"].ToString(),
                            CreatedAt = (DateTime)reader["CreatedAt"]
                        };
                        return Ok(project);
                    }
                }
            }

            return NotFound();
        }

        // ──────────────────────────────────────────────────────────
        // POST api/projects  (Admin only)
        // ──────────────────────────────────────────────────────────
        [HttpPost]
        public IHttpActionResult Post([FromBody] Project project)
        {
            if (project == null ||
                string.IsNullOrWhiteSpace(project.Title) ||
                string.IsNullOrWhiteSpace(project.Description))
            {
                return BadRequest("Title and Description are required.");
            }

            string sql = @"INSERT INTO Projects (Title, Description, ImageUrl, CreatedAt)
                           VALUES (@Title, @Description, @ImageUrl, @CreatedAt);
                           SELECT SCOPE_IDENTITY();";

            int newId;
            using (SqlConnection conn = new SqlConnection(ConnStr))
            {
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@Title", project.Title.Trim());
                cmd.Parameters.AddWithValue("@Description", project.Description.Trim());
                cmd.Parameters.AddWithValue("@ImageUrl",
                    string.IsNullOrWhiteSpace(project.ImageUrl) ? (object)DBNull.Value : project.ImageUrl.Trim());
                cmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);

                conn.Open();
                newId = Convert.ToInt32(cmd.ExecuteScalar());
            }

            project.Id = newId;
            project.CreatedAt = DateTime.Now;

            return Ok(new { status = "success", message = "Project created.", project = project });
        }

        // ──────────────────────────────────────────────────────────
        // PUT api/projects/{id}  (Admin only)
        // ──────────────────────────────────────────────────────────
        [HttpPut]
        public IHttpActionResult Put(int id, [FromBody] Project project)
        {
            if (project == null ||
                string.IsNullOrWhiteSpace(project.Title) ||
                string.IsNullOrWhiteSpace(project.Description))
            {
                return BadRequest("Title and Description are required.");
            }

            string sql = @"UPDATE Projects
                           SET Title = @Title, Description = @Description, ImageUrl = @ImageUrl
                           WHERE Id = @Id";

            int rows;
            using (SqlConnection conn = new SqlConnection(ConnStr))
            {
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@Id", id);
                cmd.Parameters.AddWithValue("@Title", project.Title.Trim());
                cmd.Parameters.AddWithValue("@Description", project.Description.Trim());
                cmd.Parameters.AddWithValue("@ImageUrl",
                    string.IsNullOrWhiteSpace(project.ImageUrl) ? (object)DBNull.Value : project.ImageUrl.Trim());

                conn.Open();
                rows = cmd.ExecuteNonQuery();
            }

            if (rows == 0) return NotFound();

            return Ok(new { status = "success", message = "Project updated." });
        }

        // ──────────────────────────────────────────────────────────
        // DELETE api/projects/{id}  (Admin only)
        // ──────────────────────────────────────────────────────────
        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {

            string sql = "DELETE FROM Projects WHERE Id = @Id";

            int rows;
            using (SqlConnection conn = new SqlConnection(ConnStr))
            {
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@Id", id);

                conn.Open();
                rows = cmd.ExecuteNonQuery();
            }

            if (rows == 0) return NotFound();

            return Ok(new { status = "success", message = "Project deleted." });
        }
    }
}
