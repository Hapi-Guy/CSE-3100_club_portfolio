using System;
using System.Web;
using System.Web.Http;
using System.Web.Http.WebHost;
using System.Web.Routing;
using System.Web.SessionState;

namespace CADersBackend
{
    /// <summary>
    /// Custom route handler that enables ASP.NET session state for Web API requests.
    /// By default, Web API does NOT initialise HttpContext.Session.
    /// </summary>
    public class SessionRouteHandler : HttpControllerRouteHandler
    {
        protected override IHttpHandler GetHttpHandler(RequestContext requestContext)
        {
            return new SessionControllerHandler(requestContext.RouteData);
        }
    }

    public class SessionControllerHandler : HttpControllerHandler, IRequiresSessionState
    {
        public SessionControllerHandler(RouteData routeData) : base(routeData) { }
    }

    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);

            // Attach the session-aware route handler to every Web API route
            foreach (var route in RouteTable.Routes)
            {
                var httpRoute = route as Route;
                if (httpRoute != null && httpRoute.RouteHandler is HttpControllerRouteHandler)
                {
                    httpRoute.RouteHandler = new SessionRouteHandler();
                }
            }
        }

        /// <summary>
        /// Ensures session state is available for ALL Web API requests,
        /// including attribute-routed controllers (AuthController, DashboardController)
        /// that are not reached by the SessionRouteHandler loop above.
        /// </summary>
        protected void Application_PostAuthorizeRequest()
        {
            if (IsWebApiRequest())
            {
                HttpContext.Current.SetSessionStateBehavior(SessionStateBehavior.Required);
            }
        }

        private static bool IsWebApiRequest()
        {
            return HttpContext.Current.Request.AppRelativeCurrentExecutionFilePath
                                              .StartsWith("~/api", StringComparison.OrdinalIgnoreCase);
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            var origin = HttpContext.Current.Request.Headers["Origin"];
            // Allow requests from VS Code Live Server (common frontend origins)
            if (!string.IsNullOrEmpty(origin) &&
                (origin == "http://127.0.0.1:5500" || origin == "http://localhost:5500"))
            {
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", origin);
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Credentials", "true");
            }

            // Short-circuit CORS preflight OPTIONS requests
            if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
            {
                HttpContext.Current.Response.StatusCode = 200;
                HttpContext.Current.Response.End();
            }
        }

        /// <summary>
        /// Rewrites the ASP.NET_SessionId cookie to include SameSite=None; Secure.
        /// Without this, browsers block the cookie on cross-origin fetch() calls
        /// (http://127.0.0.1:5500 → https://localhost:44322), causing checkAuth()
        /// to always see an unauthenticated session and redirect back to login.html.
        /// </summary>
        protected void Application_EndRequest(object sender, EventArgs e)
        {
            var response = HttpContext.Current.Response;

            // Only process API requests where Set-Cookie headers may be written
            if (!IsWebApiRequest()) return;

            // Find and rewrite any session or auth cookies to SameSite=None; Secure
            for (int i = 0; i < response.Cookies.Count; i++)
            {
                var cookie = response.Cookies[i];
                if (cookie.Name == "ASP.NET_SessionId" || cookie.Name == "Username" || cookie.Name == "LastVisit")
                {
                    // Mark existing cookie as expired (remove it from normal Set-Cookie)
                    // Then re-add it with SameSite=None appended manually via header
                    var sameSiteValue = cookie.Value;
                    var expires = cookie.Expires == DateTime.MinValue
                        ? ""
                        : "; expires=" + cookie.Expires.ToUniversalTime().ToString("R");
                    var httpOnly = cookie.HttpOnly ? "; HttpOnly" : "";
                    var path = "; path=" + (string.IsNullOrEmpty(cookie.Path) ? "/" : cookie.Path);

                    // Build the raw Set-Cookie header with SameSite=None; Secure
                    var rawHeader = cookie.Name + "=" + sameSiteValue
                        + expires + path + httpOnly
                        + "; SameSite=None; Secure";

                    response.Headers.Add("Set-Cookie", rawHeader);

                    // Remove the auto-generated cookie so it isn't duplicated
                    response.Cookies.Remove(cookie.Name);
                    i--; // Adjust index after removal
                }
            }
        }
    }
}
