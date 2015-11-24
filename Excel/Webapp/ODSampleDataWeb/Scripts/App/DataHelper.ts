declare var PageMethods: any;

module ODSampleData.DataHelper {
    export class Change {
        public operation: string;
        public id: string;
        public data: string[];

        constructor(operation: string, id: string, data: string[]) {
            this.operation = operation;
            this.id = id;
            this.data = data;
        }
    }

    // ==========================
    // Excel data helper methods
    // ========================== 
    export function UpdateDataToExcel(headers: string[], data: string[][], tableName: string, success: () => void) {
        GetExistingTables((tables) => {
            if (tables.indexOf(tableName) >= 0) {
                GetBindingById(tableName,(binding) => { UpdateDataByBinding(headers, data, undefined, binding, success); });
            }
            else {
                CreateTableWithBinding(headers, data, tableName, success);
            }
        });
    }

    export function ReadDataFromExcel(bindingId: string, success: (rows: string[][]) => void, fail?: () => void) {
        GetBindingById(bindingId,(binding) => {
            binding.getDataAsync((asyncResult) => {
                CallbackHandler(asyncResult,() => { success(asyncResult.value.rows); }, fail);
            });
        }, fail);
    }

    export function TryReadHeaderFromExcel(bindingId: string, success: (headers: string[]) => void, fail?: () => void) {
        TryGetBindingById(bindingId,(binding) => {
            if (binding === undefined || !binding.id) {
                success(undefined);
            } else {
                binding.getDataAsync((asyncResult) => {
                    CallbackHandler(asyncResult,() => { success(asyncResult.value.headers[0]); }, fail);
                });
            }
        }, fail);
    }

    export function InsertRowsToTable(bindingId: string, rows: string[][], success: (rowIdFrom: number) => void, fail: () => void) {
        GetBindingById(bindingId, (binding: Office.TableBinding) => {
            var rowCount = binding.rowCount;

            binding.addRowsAsync(rows,(asyncResult) => {
                CallbackHandler(asyncResult, () => success(rowCount), fail);
            });
        }, fail);
    }

    export function RemoveRowsFromTable(bindingId: string, headers: string[], rowIdsToRemove: number[], success: () => void, fail: () => void) {
        ReadDataFromExcel(bindingId, function (data: string[][]) {
            data = data.filter((value, rowIndex: number) => {
                return rowIdsToRemove.indexOf(rowIndex) < 0;
            });

            GetBindingById(bindingId,(binding) => {
                UpdateDataByBinding(headers, data, undefined, binding, success, fail);
            });
        }, fail);
    }

    export function SetRowDataWithColor(bindingId: string, rowId: number, data: string[], formats: any[], success: () => void, fail: () => void) {
        var tableData = new Office.TableData();

        var options = {
            coercionType: "table",
            startColumn: 0,
            startRow: rowId,
            cellFormat: formats,
        };

        tableData.rows = [data];

        GetBindingById(bindingId,(b) => {
            var binding: any = b;
            binding.setDataAsync(tableData, options,(asyncResult) => CallbackHandler(asyncResult, success, fail));
        }, fail);
    }

    export function SetTableCellDataWithColor(bindingId: string, columnId: number, rowId: number, data: string, color: string, success: () => void, fail: () => void) {
        var tableData = new Office.TableData();
        var options = {
            coercionType: "table",
            startColumn: columnId,
            startRow: rowId,
            cellFormat: [{ cells: { row: rowId, column: columnId }, format: { backgroundColor: color } }]
        };

        tableData.rows = [[data]];

        GetBindingById(bindingId,(b) => {
            var binding: any = b;
            binding.setDataAsync(tableData, options,(asyncResult) => CallbackHandler(asyncResult, success, fail));
        }, fail);
    }

    export function GetSelectedData(success: (data: string) => void, fail?: () => void) {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text,(asyncResult) => CallbackHandler(asyncResult,() => { success(asyncResult.value); }, fail));
    }

    function CreateTableWithBinding(headers: string[], data: string[][], bindingId: string, success: () => void) {
        GotoLocation(1, 1, () => {
            CreateTableFromSelection(headers,() => {
                CreateBindingFromSelection(bindingId, binding => {
                    if (data !== undefined) {
                        var option = {style: "TableStyleMedium4" }; 

                        SetTableOptionsByBinding(binding, option, undefined, undefined);
                        UpdateDataByBinding(headers, data, undefined, binding, success);
                    }
                });
            });
        });
    }

    function CreateTableFromSelection(headers: string[], success: () => void, fail?: () => void) {
        var table = new Office.TableData();
        table.headers = headers;
        table.rows = undefined;

        Office.context.document.setSelectedDataAsync(table, { coercionType: Office.CoercionType.Table}, asyncResult => {
            CallbackHandler(asyncResult, success, fail);
        });
    }

    function CreateBindingFromSelection(bindingId: string, success: (binding: Office.TableBinding) => void, fail?: () => void) {
        Office.context.document.bindings.addFromSelectionAsync(Office.BindingType.Table, { id: bindingId }, asyncResult => {
            CallbackHandler(asyncResult,() => success(asyncResult.value), fail);
        });
    }

    function UpdateDataByBinding(headers: string[], data: string[][], format: any, binding: any, success: () => void, fail?:() => void) {

        // goto table by using table binding
        GotoLocationByBinding(binding.id,() => {

            // update the table when the row count is not changed
            // else refresh the table with deleting and insert new rows
            if (binding.rowCount === data.length) {
                var table = new Office.TableData();
                table.headers = headers;
                table.rows = data;

                binding.setDataAsync(table, { coercionType: "table" }, asyncResult => {
                    CallbackHandler(asyncResult, success, fail);
                });
                
                // goto the default location (first cell)
                GotoLocation(1, 1, undefined, undefined);
            } else {
                DeleteAllDataFromTable(binding,() => {
                    // apply text format to all cells
                    var textFormat = [{ cells: Office.Table.All, format: { numberFormat: "@" } }];
                    SetTableFormatByBinding(binding, textFormat, true,() => {

                        // insert rows in 200 chunk to avoid the insert limitation of 20000 cells at one time
                        var i, j, temparray, chunk = 200;
                        for (i = 0, j = data.length; i < j; i += chunk) {
                            temparray = data.slice(i, i + chunk);
                            binding.addRowsAsync(temparray, function (asyncResult) {
                                ShowErrorNotification(asyncResult);
                            });
                        }

                        // apply auto fit format and other specified color format
                        var formatToApply = [{ cells: Office.Table.All, format: { width: "auto fit" } }];

                        if (format !== undefined) {
                            formatToApply = formatToApply.concat(format);
                        }

                        SetTableFormatByBinding(binding, formatToApply, true, success, fail);

                        // goto the default location (first cell)
                        GotoLocation(1, 1, undefined, undefined);

                    }, fail);
                }, fail);
            }
        });
    }

    function DeleteAllDataFromTable(binding: Office.TableBinding, success: () => void, fail?: () => void) {
        binding.deleteAllDataValuesAsync(asyncResult => {
            CallbackHandler(asyncResult, success, fail);
        });
    }

    export function EnsureEventHandlerToBinding(bindingID: string, eventType: Office.EventType, handler: any) {
        Office.context.document.bindings.getByIdAsync(bindingID,(asyncResult) => CallbackHandler(asyncResult,() => {
            asyncResult.value.addHandlerAsync(eventType, handler);
        }, undefined));
    }

    export function GetExistingTables(success: (result: string[]) => void, fail?: () => void) {
        Office.context.document.bindings.getAllAsync(
            (asyncResult) => CallbackHandler(asyncResult,() => {
                var bindings = asyncResult.value;
                var tables = Array();
                bindings.forEach((binding: Office.TableBinding) => {
                    if (binding.type === Office.BindingType.Table && binding.columnCount > 0 && binding.hasHeaders) {
                        tables.push(binding.id);
                    }
                });
                success(tables);
            }, fail));
    }

    function TryGetBindingById(bindingId: string, success: (binding: Office.TableBinding) => void, fail?: () => void) {
        Office.context.document.bindings.getByIdAsync(bindingId, asyncResult => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                var errorCodeForSpecifiedBindingDoesNotExist = 3002;
                if (asyncResult.error && asyncResult.error.code === errorCodeForSpecifiedBindingDoesNotExist) {
                    success(undefined);
                } else {
                    ShowErrorNotification1(asyncResult.error);
                    if (fail) fail();
                }
            } else {
                if (asyncResult.value.columnCount === 0) {
                    success(undefined);
                } else {
                    success(asyncResult.value);
                }
            }
        });
    }

    function GetBindingById(bindingId: string, success: any, fail?: () => void) {

        Office.context.document.bindings.getByIdAsync(bindingId, (asyncResult) => {
            CallbackHandler(asyncResult, () => {
                if (asyncResult.value.columnCount === 0) {
                    ShowErrorNotification2("Cannot find table", "The binded table doesn't existing. Please import the data again.");
                    if (fail) fail();
                } else {
                    success(asyncResult.value);
                }
            }, fail);
        });
    }

    // ==========================
    // OData data helper methods
    // ========================== 
    export function ReadDataFromOData(tableName: string, query: string, success: (data: string[][]) => void, fail: (error) => void) {
        PageMethods.ReadDataFromOData(tableName, query, success, fail);
    }

    export function ReadDataFromODataWithHeaders(tableName: string, query: string, success: (data: string[][]) => void, fail: (error) => void) {
        PageMethods.ReadDataFromODataWithHeaders(tableName, query, success, fail);
    }

    export function UpdateDataToOData(changes: Change[], tableName: string, headers: string[], callback: () => void) {
        PageMethods.UpdateDataToOData(changes, tableName, headers, function (error) {
            if (error !== undefined && error.length !== 0) {
                showNotification("Error", "Updating data to OData failed" + ": " + error);
            }

            if (callback) {
                callback();
            }
        });
    }

    // ==========================
    // Document settings helper methods
    // ========================== 
    export function SetDataFeedToDocumentSettings(dataFeed: DataFeed) {
        var item = JSON.parse(Office.context.document.settings.get("DataFeed"));

        if (item === null) {
            item = new Object;
        }

        item["DataFeed"] = {
            name: dataFeed.Name,
            key: dataFeed.Key,
            headers: dataFeed.Headers,
            entityType: dataFeed.EntityType,
        };

        Office.context.document.settings.set("DataFeed", JSON.stringify(item));

        Office.context.document.settings.saveAsync(function (asyncResult) {
            ShowErrorNotification(asyncResult);
        });
    }

    export function RemoveDataFeedFromDocumentSettings() {
        Office.context.document.settings.remove("DataFeed");

        Office.context.document.settings.saveAsync(function (asyncResult) {
            ShowErrorNotification(asyncResult);
        });
    }

    export function GetDataFeedsFromDocumentSettings() {
        var dataFeed = JSON.parse(Office.context.document.settings.get("DataFeed"));
        return dataFeed;
    }

    // ==========================
    // Formating helper methods
    // ==========================

    var formatList = new Array();
    var formatTimer;

    function SetTableFormatByBindingId(bindingId: string, format: Object, success?: () => void, fail?: () => void) {
        GetBindingById(bindingId,(binding) => {
            binding.setFormatsAsync(format,(asyncResult) => CallbackHandler(asyncResult, success, fail));
        });
    }

    function SetTableFormatByBinding(binding: any, format: Object, immediately: boolean, success?: () => void, fail?: () => void) {

        if (immediately) {
            binding.setFormatsAsync(format,(asyncResult) => CallbackHandler(asyncResult, success, fail));
        } else {
            formatList = formatList.concat(format);

            clearTimeout(formatTimer);

            formatTimer = setTimeout(() => {
                var formatPayload = formatList;
                binding.setFormatsAsync(formatPayload,(asyncResult) => CallbackHandler(asyncResult, success, fail));
                formatList = new Array();
            }, 200);
        }
    }

    function SetTableOptionsByBinding(binding: any, option: Object, success?: () => void, fail?: () => void ) {
        binding.setTableOptionsAsync(option,(asyncResult) => CallbackHandler(asyncResult, success, fail));
    }

    export function SetTableRowColor(bindingId: string, rowId: number, color: string) {
        var format = [{ cells: { row: rowId }, format: { backgroundColor: color } }];
        SetTableFormatByBindingId(bindingId, format);
    }

    export function SetTableCellColor(bindingId: string, rowId: number, columnId: number, color: string, success: () => void, fail: () => void) {
        var format = [{ cells: { row: rowId, column: columnId }, format: { backgroundColor: color } }];
        SetTableFormatByBindingId(bindingId, format, success, fail);
    }

    export function SetTableFormat(bindingId: string, format: any, success?: () => void, fail?: () => void) {
        //var format = [{ cells: Office.Table.All, format: { backgroundColor: color } }];
        SetTableFormatByBindingId(bindingId, format, success, fail);
    }

    // ==========================
    // Navigation helper methods
    // ==========================   

    export function GotoLocation(row: number, column: number, success?: () => void, fail?: () => void) {

        // Change column number to excel column string
        var columnName = "";
        var stringLength = 1;
        var columnNumberLeft = column - 1;

        for (var power = 26; columnNumberLeft >= power; power *= 26) {
            columnNumberLeft -= power;
            stringLength++;
        }

        while (stringLength) {
            columnName = (String.fromCharCode(65 + columnNumberLeft % 26)) + columnName;
            columnNumberLeft /= 26;
            stringLength--;
        }

        var namedItem = columnName + row;

        Office.context.document.goToByIdAsync(namedItem, Office.GoToType.NamedItem, (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                var namedItem = "R" + row + "C" + column;
                Office.context.document.goToByIdAsync(namedItem, Office.GoToType.NamedItem,(asyncResult) => CallbackHandler(asyncResult, success, fail));
            } else {
                if (success) {
                    success();
                }
            }
        });
    }

    export function GotoLocationByBinding(bindingId: string, success?: () => void, fail?: ()=> void) {
        Office.context.document.goToByIdAsync(bindingId, Office.GoToType.Binding, (asyncResult) => CallbackHandler(asyncResult, success, fail));
    }

    // ==========================
    // Error handling helper methods
    // ========================== 
    function ShowErrorNotification(asyncResult) {
        if (asyncResult.status === "failed") {
            showNotification("Error", asyncResult.error.name + ": " + asyncResult.error.message);
        }
    }

    function ShowErrorNotification1(error: Office.Error) {
        showNotification("Error", error.name + ": " + error.code + ": " + error.message);
    }

    export function ShowErrorNotification2(name: string, message: string) {
        showNotification("Error", name + ": " + message);
    }

    function CallbackHandler(asyncResult: Office.AsyncResult, success: () => void, fail: () => void) {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
            ShowErrorNotification1(asyncResult.error);
            if (fail) { fail(); }
        } else {
            if (success) { success(); }
        }
    }
}
