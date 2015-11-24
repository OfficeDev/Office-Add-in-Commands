var ODSampleData;
(function (ODSampleData) {
    var ExtendTable;
    (function (ExtendTable) {
        $(document).ready(function () {
            $("#expandtable-button").prop("disabled", true);
            $("#expandtable-button").click(function () {
                ODSampleData.DataHelper.GetSelectedData(function (data) {
                    data = data.replace("HYPERLINK", "");
                    GetExtendedTableDataFromOData(data);
                    $("#expandtable-name").text("Table Name: " + data);
                    $(".expandtable-area").show();
                    $(".non-expandtable-area").hide();
                });
            });
            //$("#back-to-detail-from-extandtable").click(() => {
            //    $(".expandtable-area").hide();
            //    $(".non-expandtable-area").show();
            //});
        });
        function ExpandTableButtonHandler() {
            if (arguments[0].rowCount === 1 && arguments[0].columnCount === 1) {
                ODSampleData.DataHelper.GetSelectedData(function (data) {
                    if (isNaN(parseInt(data, 10)) && data.indexOf("HYPERLINK") >= 0) {
                        $("#expandtable-button").prop("disabled", false);
                    }
                    else {
                        $("#expandtable-button").prop("disabled", true);
                    }
                });
            }
        }
        ExtendTable.ExpandTableButtonHandler = ExpandTableButtonHandler;
        function GetExtendedTableDataFromOData(selectedCellValue) {
            ODSampleData.DataHelper.ReadDataFromODataWithHeaders(ODSampleData.DataFeed.ActiveDataFeed.Name, selectedCellValue, RenderExtendedTable, OnError);
        }
        ExtendTable.GetExtendedTableDataFromOData = GetExtendedTableDataFromOData;
        function RenderExtendedTable(data) {
            var dataTableDiv = document.getElementById("expandtable-datatable");
            var odd = true;
            dataTableDiv.innerHTML = "";
            data.forEach(function (row, rowIndex) {
                if (rowIndex === 0) {
                    dataTableDiv.appendChild(CreateHeaderRow(row));
                }
                else {
                    dataTableDiv.appendChild(CreateDataRow(row, odd));
                    odd = !odd;
                }
            });
        }
        ExtendTable.RenderExtendedTable = RenderExtendedTable;
        function CreateHeaderRow(headers) {
            var headerRow = document.createElement("tr");
            headers.forEach(function (header) {
                var headerElement = document.createElement("th");
                headerElement.innerText = header;
                headerRow.appendChild(headerElement);
            });
            return headerRow;
        }
        function CreateDataRow(data, odd) {
            var dataRow = document.createElement("tr");
            if (odd) {
                dataRow.className = "odd";
            }
            else {
                dataRow.className = "even";
            }
            data.forEach(function (cell) {
                var cellElement = document.createElement("td");
                cellElement.innerText = cell;
                dataRow.appendChild(cellElement);
            });
            return dataRow;
        }
        function OnError(error) { }
    })(ExtendTable = ODSampleData.ExtendTable || (ODSampleData.ExtendTable = {}));
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=ExtendTable.js.map