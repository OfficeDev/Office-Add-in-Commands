module ODSampleData.ExtendTable {
    $(document).ready(() => {
        $("#expandtable-button").prop("disabled", true);

        $("#expandtable-button").click(() => {
            ODSampleData.DataHelper.GetSelectedData(data=> {
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

    export function ExpandTableButtonHandler() {
        if (arguments[0].rowCount === 1 && arguments[0].columnCount === 1) {
            ODSampleData.DataHelper.GetSelectedData(data=> {
                if (isNaN(parseInt(data, 10)) && data.indexOf("HYPERLINK") >= 0) {
                    $("#expandtable-button").prop("disabled", false);
                } else {
                    $("#expandtable-button").prop("disabled", true);
                }
            });
        }
    }

    export function GetExtendedTableDataFromOData(selectedCellValue: string) {
        ODSampleData.DataHelper.ReadDataFromODataWithHeaders(DataFeed.ActiveDataFeed.Name, selectedCellValue, RenderExtendedTable, OnError);
    }

    export function RenderExtendedTable(data: string[][]) {

        var dataTableDiv = document.getElementById("expandtable-datatable");
        var odd = true;
        dataTableDiv.innerHTML = "";

        data.forEach((row: string[], rowIndex: number) => {
            if (rowIndex === 0) {
                dataTableDiv.appendChild(CreateHeaderRow(row));
            }
            else {
                dataTableDiv.appendChild(CreateDataRow(row, odd));
                odd = !odd;
            }
        });
    }

    function CreateHeaderRow(headers: string[]) {
        var headerRow = document.createElement("tr");

        headers.forEach(header => {
            var headerElement = document.createElement("th");
            headerElement.innerText = header;
            headerRow.appendChild(headerElement);
        });

        return headerRow;
    }

    function CreateDataRow(data: string[], odd) {
        var dataRow = document.createElement("tr");
        if (odd) {
            dataRow.className = "odd";
        } else {
            dataRow.className = "even";
        }
        

        data.forEach(cell => {
            var cellElement = document.createElement("td");
            cellElement.innerText = cell;
            dataRow.appendChild(cellElement);
        });

        return dataRow;
    }

    function OnError(error) { }
}