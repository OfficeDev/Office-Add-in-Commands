using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Services;

using ODSampleDataWeb.Utilities;

namespace ODSampleDataWeb.App.Home
{
    public partial class Home : System.Web.UI.Page
    {
        private static ODataHelper odataHelper = new ODataHelper();
        private static string hostType;
        protected void Page_Load(object sender, EventArgs e)
        {
            // Set session expiration to 24 hours
            HttpContext.Current.Session.Timeout = 1440;

            if (!IsPostBack)
            {
                hostType = HttpContext.Current.Request.QueryString["_host_Info"];
            }
        }

        [WebMethod]
        public static string GetHostType()
        {
            return hostType;
        }

        [WebMethod]
        public static string UpdateDataToOData(Change[] chanegs, string tableName, string[] headers)
        {
            return odataHelper.UpdateDataToOData(chanegs, tableName, headers);
        }

        [WebMethod]
        public static string[][] ReadDataFromOData(string tableName, string query)
        {
            string[][] matrix = odataHelper.ReadDataFromOData(tableName, query);

            return matrix;
        }

        [WebMethod]
        public static string[][] ReadDataFromODataWithHeaders(string tableName, string query)
        {
            return odataHelper.ReadDataFromODataWithHeaders(tableName, query);
        }

        [WebMethod]
        public static TableInformation[] GetTables()
        {
            return odataHelper.GetTables();
        }
    }
}