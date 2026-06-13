using System.Web.Http;
using Newtonsoft.Json.Serialization;

namespace CADersBackend
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Serialize JSON with camelCase property names so JavaScript can access
            // p.id, p.title, m.name etc. instead of p.Id, p.Title, m.Name
            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver =
                new CamelCasePropertyNamesContractResolver();

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
