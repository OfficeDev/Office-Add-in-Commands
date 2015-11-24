using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.IO;
using System.Xml;
using System.Net.Http;
using System.Text;
using Microsoft.Data.Edm;
using Microsoft.Data.OData;
using Newtonsoft.Json.Linq;
using System.Configuration;

namespace ODSampleDataWeb.Utilities
{
    public class ODataHelper
    {
        private IEdmModel metadata;
        private TableInformation[] tables;
        private Uri odataEndpointURL;
        private Uri odataMetadataURL;
        private string odataVersion;
        private string odataMaxVersion;
        private string jsonDataStructure;

        public ODataHelper()
        {
            ServicePointManager.ServerCertificateValidationCallback = (s, cert, chain, errors) => true;

            this.odataEndpointURL = new Uri(ConfigurationManager.AppSettings["ida:ODataEndpointURL"]);
            this.odataMetadataURL = new Uri(ConfigurationManager.AppSettings["ida:ODataMetadataURL"]);
            this.jsonDataStructure = ConfigurationManager.AppSettings["ida:ODataDataStructure"];
            this.odataVersion = ConfigurationManager.AppSettings["ida:ODataVersion"];
            this.odataMaxVersion = ConfigurationManager.AppSettings["ida:ODataMaxVersion"];
            this.metadata = null;
        }

        public string UpdateDataToOData(Change[] changes, string tableName, string[] headers)
        {
            HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Post, new Uri(this.odataEndpointURL, "$batch"));
            requestMessage.Headers.Add("DataServiceVersion", this.odataVersion);
            requestMessage.Headers.Add("MaxDataServiceVersion", this.odataMaxVersion);
            
            var setting = new ODataMessageWriterSettings();
            setting.SetContentType(ODataFormat.Batch);
            setting.BaseUri = this.odataEndpointURL;

            var odataHttpRequest = new ODataHttpRequest(requestMessage);
            var messageWriter = new ODataMessageWriter(odataHttpRequest, setting, this.metadata);

            var batchWriter = messageWriter.CreateODataBatchWriter();
            batchWriter.WriteStartBatch();
            
            for (int i = 0; i < changes.Length; i++)
            {
                batchWriter.WriteStartChangeset();
                if (changes[i].operation == "DELETE")
                {
                    createDeleteOperationRequestMessage(ref batchWriter, changes[i], tableName);
                }

                if (changes[i].operation == "UPDATE")
                {
                    createUpdateOperationRequestMessage(ref batchWriter, changes[i], tableName, headers);
                }
                batchWriter.WriteEndChangeset();
            }
            
            batchWriter.WriteEndBatch();
            batchWriter.Flush();
            odataHttpRequest.GetStream().Seek(0, SeekOrigin.Begin);

            HttpResponseMessage result = new HttpResponseMessage();

            using (HttpClient client = new HttpClient())
            {
                result = client.SendAsync(requestMessage).Result;
            }

            return parseResponseMessage(result);
        }

        private IEdmTypeReference getKeyType(string tableName)
        {
            IEdmEntityContainer defaultContainer = GetDefaultEntityContainer(this.metadata);

            IEdmEntitySet entitySet = defaultContainer.FindEntitySet(tableName);

            IEdmEntityType entityType = entitySet.ElementType;

            IEdmStructuralProperty[] keys = entityType.Key().ToArray();
         
            return keys[0].Type;
        }

        private void createDeleteOperationRequestMessage(ref ODataBatchWriter writer, Change change, string tableName)
        {
            string id = this.getKeyType(tableName).IsString() ? "'" + change.id + "'" : change.id;
            Uri uri = new Uri(tableName + "(" + id + ")", UriKind.Relative);

            writer.CreateOperationRequestMessage("DELETE", uri);
        }

        private void createUpdateOperationRequestMessage(ref ODataBatchWriter writer, Change change, string tableName, string[] headers)
        {
            string id = this.getKeyType(tableName).IsString() ? "'" + change.id + "'" : change.id;
            Uri uri = new Uri(tableName + "(" + id + ")", UriKind.Relative);
            
            var updateOperaitonMessage = writer.CreateOperationRequestMessage("PATCH", uri);
            updateOperaitonMessage.SetHeader("Content-Type", "application/json");
             

            using (var operationMessageWriter = new ODataMessageWriter(updateOperaitonMessage))
            {
                var entityWriter = operationMessageWriter.CreateODataEntryWriter();
                var entry = new ODataEntry()
                {
                    Properties = createOperationProperties(change.data, tableName, headers),
                    TypeName = this.GetEntityTypeName(tableName)
                };
                entityWriter.WriteStart(entry);
                entityWriter.WriteEnd();
            }
        }

        private ODataProperty[] createOperationProperties(string[] data, string tableName, string[] headers)
        {
            List<ODataProperty> payloud = new List<ODataProperty>();
            Dictionary<string, IEdmProperty> properties = this.GetProperties(tableName).ToDictionary(p => p.Name);

            for (int i = 0; i < data.Length; i++)
            {
                Object value;

                if (properties[headers[i]].PropertyKind == EdmPropertyKind.Navigation)
                    continue;
               
                if (properties[headers[i]].Type.IsDateTime() && data[i] != string.Empty)
                {
                    value = DateTime.Parse(data[i]).ToString("O");
                } 
                else if (properties[headers[i]].Type.IsIntegral() || properties[headers[i]].Type.IsInt64())
                {
                    value = int.Parse(data[i]);
                } 
                else if (data[i] == string.Empty)
                {
                    value = null;
                } 
                else
                {
                    value = data[i];
                }

                payloud.Add(new ODataProperty() { Name = headers[i], Value = value });
            }

            return payloud.ToArray();
        }

        private string parseResponseMessage(HttpResponseMessage result)
        {
            string error = string.Empty;
            using (StreamReader streamReader = new StreamReader(result.Content.ReadAsStreamAsync().Result))
            {
                while(!streamReader.EndOfStream)
                {
                    string line = streamReader.ReadLine();

                    try
                    {
                        XmlDocument xmlDoc = new XmlDocument();
                        xmlDoc.LoadXml(line);
                        error += xmlDoc.InnerText + Environment.NewLine;
                    }
                    catch(Exception e)
                    {

                    }
                }
            }

            return error;
        }

        public string[][] ReadDataFromODataWithHeaders(string tableName, string query)
        {
            string[][] data = this.ReadDataFromOData(tableName, query);
            string[] headers = this.GetHeaders(tableName);

            return (new string[][] {headers}).Concat(data).ToArray();
        }

        public string[][] ReadDataFromOData(string tableName, string query)
        {
            string[] headers = this.GetHeaders(tableName);
            string data;

            Uri url = new Uri(this.odataEndpointURL, tableName + query);

            using (WebClient client = new WebClient())
            {
                client.Headers[HttpRequestHeader.Accept] = "application/json";
                data = client.DownloadString(url);
            }

            var jsonValue = JObject.Parse(data).SelectToken(this.jsonDataStructure);

            if (jsonValue == null)
                jsonValue = JObject.Parse(data).SelectToken("d.results");

            if(jsonValue == null)
                jsonValue = JObject.Parse(data).SelectToken("value");

            var matrix = jsonValue.Select((item) =>
            {
                return JsonParser(item, headers);
            });

            return matrix.ToArray();
        }
        
        private string[] JsonParser(JToken item, string[] headers)
        {
            Dictionary<string, string> dic = createDictionary(headers);

            foreach (JProperty property in item)
            {
                if (dic.Keys.Contains(property.Name.ToString()))
                {
                    dic[property.Name.ToString()] = property.Value.ToString();
                }
            }

            return dic.Values.ToArray();
        }

        private Dictionary<string, string> createDictionary(string[] headers)
        {
            Dictionary<string, string> dic = new Dictionary<string,string>();
            
            foreach(string header in headers)
            {
                dic.Add(header, string.Empty);
            }

            return dic;
        }

        public TableInformation[] GetTables()
        {
            if (this.metadata == null)
            {
                GetMetadata(this.odataMetadataURL);
            }

            if (this.tables == null || this.tables.Length == 0)
            {
                IEdmEntityContainer defaultContainer = GetDefaultEntityContainer(this.metadata);

                IEdmEntitySet[] entitySets = defaultContainer.EntitySets().ToArray();

                List<TableInformation> tables = new List<TableInformation>();

                foreach(IEdmEntitySet entitySet in entitySets)
                {
                    TableInformation table = new TableInformation();
                    table.entityTypeName = entitySet.ElementType.FullName();
                    table.tableName = entitySet.Name;
                    table.headers = GetHeaders(table.tableName);
                    table.key = GetKey(table.tableName);
                    table.types = GetTypes(table.tableName);

                    tables.Add(table);
                }

                this.tables = tables.ToArray();
            }

            return this.tables;
        }

        private string GetEntityTypeName(string tableName)
        {
            IEdmEntityContainer defaultContainer = GetDefaultEntityContainer(this.metadata);

            IEdmEntitySet entitySet = defaultContainer.FindEntitySet(tableName);

            IEdmEntityType entityType = entitySet.ElementType;

            return entityType.FullName();
        }

        private string GetKey(string tableName)
        {
            IEdmEntityContainer defaultContainer = GetDefaultEntityContainer(this.metadata);

            IEdmEntitySet entitySet = defaultContainer.FindEntitySet(tableName);

            IEdmEntityType entityType = entitySet.ElementType;

            IEdmStructuralProperty[] keys =  entityType.Key().ToArray();

            return keys[0].Name;
        }

        private string[] GetTypes(string tableName)
        {
            IEdmProperty[] properties = this.GetProperties(tableName);

            List<string> types = new List<string>();

            foreach (IEdmProperty property in properties)
            {
                types.Add(property.Type.Definition.ToString());
            }

            return types.ToArray();
        }

        private string[] GetHeaders(string tableName)
        {
            IEdmProperty[] properties = this.GetProperties(tableName);

            List<string> headers = new List<string>();

            foreach (IEdmProperty property in properties)
            {
                headers.Add(property.Name);
            }

            return headers.ToArray();
        }

        private IEdmProperty[] GetProperties(string tableName)
        {
            if (this.metadata == null)
            {
                GetMetadata(this.odataMetadataURL);
            }

            IEdmEntityContainer defaultContainer = GetDefaultEntityContainer(this.metadata);
            IEdmEntitySet entitySet = defaultContainer.FindEntitySet(tableName);
            IEdmEntityType entityType = entitySet.ElementType;

            return entityType.Properties().ToArray();
        }

        private void GetMetadata(Uri requestUrl)
        {
            if (requestUrl == null)
                return;

            string str;

            using (WebClient client = new WebClient())
            {
                client.Headers[HttpRequestHeader.Accept] = "application/xml";
                str = client.DownloadString(requestUrl);
            }

            using (var reader = XmlReader.Create(new System.IO.StringReader(str)))
            {
                var error = default(IEnumerable<Microsoft.Data.Edm.Validation.EdmError>);
                var success = Microsoft.Data.Edm.Csdl.EdmxReader.TryParse(reader, out this.metadata, out error);
            }
        }

        private IEdmEntityContainer GetDefaultEntityContainer(Microsoft.Data.Edm.IEdmModel model)
        {
            IEnumerable<IEdmEntityContainer> containers = model.EntityContainers().ToList();

            foreach (IEdmEntityContainer container in containers)
            {
                if (model.IsDefaultEntityContainer(container))
                    return container;
            }

            return null;
        }
    }

    internal class ODataHttpRequest : IODataRequestMessage, IDisposable, IODataUrlResolver
    {
        private HttpRequestMessage httpRequestMessage;
        private Stream stream;
        public ODataHttpRequest(HttpRequestMessage httpRequest)
        {
            this.httpRequestMessage = httpRequest;
            this.stream = new MemoryStream();
            this.httpRequestMessage.Content = new StreamContent(this.stream);
        }


        public Uri ResolveUrl(Uri baseUri, Uri payloadUri)
        {
            return payloadUri;
        }

        public string GetHeader(string headerName)
        {
            IEnumerable<string> header;
            if (!this.httpRequestMessage.Headers.TryGetValues(headerName, out header))
            {
                this.httpRequestMessage.Content.Headers.TryGetValues(headerName, out header);
            }
            if (header != null)
            {
                return String.Join(",", header);
            }
            return null;
        }

        public Stream GetStream()
        {
            return this.stream;
        }

        public IEnumerable<KeyValuePair<string, string>> Headers
        {
            get
            {
                return this.httpRequestMessage.Headers.Select(pair => new KeyValuePair<string, string>(pair.Key, String.Join(",", pair.Value)));
            }
        }

        public string Method
        {
            get
            {
                return this.httpRequestMessage.Method.ToString();
            }
            set
            {
                this.httpRequestMessage.Method = new HttpMethod(value);
            }
        }

        public void SetHeader(string headerName, string headerValue)
        {
            if (!this.httpRequestMessage.Headers.TryAddWithoutValidation(headerName, headerValue))
            {
                this.httpRequestMessage.Content.Headers.TryAddWithoutValidation(headerName, headerValue);
            }
        }

        public Uri Url
        {
            get
            {
                return this.httpRequestMessage.RequestUri;
            }
            set
            {
                this.httpRequestMessage.RequestUri = value;
            }
        }

        public void Dispose()
        {
            if (this.httpRequestMessage != null)
            {
                this.httpRequestMessage.Dispose();
            }
            if (this.stream != null)
            {
                this.stream.Dispose();
            }
            GC.SuppressFinalize(this);
        } 
    }

    internal class ODataHttpResponse : IODataResponseMessage, IDisposable
    {
        private HttpResponseMessage httpResponsemessage;
        private Dictionary<string, string> headers;

        public ODataHttpResponse(HttpResponseMessage httpResponse)
        {
            this.httpResponsemessage = httpResponse;
            this.headers = new Dictionary<string, string>();
            var enumHeader = this.httpResponsemessage.Content.Headers;
            foreach (var e in enumHeader)
            {
                headers.Add(e.Key, String.Join(",", e.Value));
            }
        }

        public string GetHeader(string headerName)
        {
            if (headers.ContainsKey(headerName))
            {
                return headers[headerName];
            }
            return null;
        }

        public System.IO.Stream GetStream()
        {
            return this.httpResponsemessage.Content.ReadAsStreamAsync().Result;
        }

        public IEnumerable<KeyValuePair<string, string>> Headers
        {
            get
            {
                return this.headers.ToList();
            }
        }

        public void SetHeader(string headerName, string headerValue)
        {
            this.httpResponsemessage.Headers.Add(headerName, headerValue);
            this.headers.Add(headerName, headerValue);
        }

        public int StatusCode
        {
            get
            {
                return (int)this.httpResponsemessage.StatusCode;
            }
            set
            {
                this.httpResponsemessage.StatusCode = (System.Net.HttpStatusCode)value;
            }
        }

        public void Dispose()
        {
            this.httpResponsemessage.Dispose();
            GC.SuppressFinalize(this);
        }
    }

    public class Change
    {
        public string operation;
        public string id;
        public string[] data;
    }

    public class TableInformation
    {
        public string tableName;
        public string[] headers;
        public string entityTypeName;
        public string key;
        public string[] types;
    }
}