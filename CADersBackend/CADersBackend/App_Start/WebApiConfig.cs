using System.Web.Http;

namespace CADersBackend
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // CORS is configured in Web.config via custom headers
            // (Access-Control-Allow-Origin, Methods, Headers)

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
