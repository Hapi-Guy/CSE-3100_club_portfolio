using System.Web;

namespace CADersBackend.Helpers
{
    /// <summary>
    /// Wraps HttpContext.Current.Session for typed, safe access
    /// to authentication and visit-tracking data.
    /// </summary>
    public static class SessionHelper
    {
        /// <summary>Returns true if a user is currently logged in.</summary>
        public static bool IsAuthenticated()
        {
            var session = HttpContext.Current?.Session;
            return session != null && session["UserId"] != null;
        }

        /// <summary>Gets the logged-in user's ID, or -1 if not authenticated.</summary>
        public static int GetUserId()
        {
            var session = HttpContext.Current?.Session;
            if (session == null) return -1;
            object val = session["UserId"];
            return val != null ? (int)val : -1;
        }

        /// <summary>Gets the logged-in user's username, or empty string.</summary>
        public static string GetUsername()
        {
            var session = HttpContext.Current?.Session;
            if (session == null) return "";
            object val = session["Username"];
            return val != null ? val.ToString() : "";
        }

        /// <summary>Gets the logged-in user's role, or empty string.</summary>
        public static string GetRole()
        {
            var session = HttpContext.Current?.Session;
            if (session == null) return "";
            object val = session["Role"];
            return val != null ? val.ToString() : "";
        }

        /// <summary>Returns true if the logged-in user has the Admin role.</summary>
        public static bool IsAdmin()
        {
            return GetRole() == "Admin";
        }

        /// <summary>
        /// Increments the VisitCount session variable and returns the new value.
        /// Initialises to 1 on the first call.
        /// </summary>
        public static int IncrementVisitCount()
        {
            var session = HttpContext.Current?.Session;
            if (session == null) return 0;
            object val = session["VisitCount"];
            int count = val != null ? (int)val : 0;
            count++;
            session["VisitCount"] = count;
            return count;
        }

        /// <summary>Gets the current visit count without incrementing.</summary>
        public static int GetVisitCount()
        {
            var session = HttpContext.Current?.Session;
            if (session == null) return 0;
            object val = session["VisitCount"];
            return val != null ? (int)val : 0;
        }
    }
}
