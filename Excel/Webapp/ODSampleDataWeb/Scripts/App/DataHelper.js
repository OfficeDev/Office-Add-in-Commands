var ODSampleData;
(function (ODSampleData) {
    var DataHelper;
    (function (DataHelper) {
        var Change = (function () {
            function Change(operation, id, data) {
                this.operation = operation;
                this.id = id;
                this.data = data;
            }
            return Change;
        })();
        DataHelper.Change = Change;
        // ==========================
        // Excel data helper methods
        // ========================== 
        function UpdateDataToExcel(headers, data, tableName, success) {
            GetExistingTables(function (tables) {
                if (tables.indexOf(tableName) >= 0) {
                    GetBindingById(tableName, function (binding) { UpdateDataByBinding(headers, data, undefined, binding, success); });
                }
                else {
                    CreateTableWithBinding(headers, data, tableName, success);
                }
            });
        }
        DataHelper.UpdateDataToExcel = UpdateDataToExcel;
        function ReadDataFromExcel(bindingId, success, fail) {
            GetBindingById(bindingId, function (binding) {
                binding.getDataAsync(function (asyncResult) {
                    CallbackHandler(asyncResult, function () { success(asyncResult.value.rows); }, fail);
                });
            }, fail);
        }
        DataHelper.ReadDataFromExcel = ReadDataFromExcel;
        function TryReadHeaderFromExcel(bindingId, success, fail) {
            TryGetBindingById(bindingId, function (binding) {
                if (binding === undefined || !binding.id) {
                    success(undefined);
                }
                else {
                    binding.getDataAsync(function (asyncResult) {
                        CallbackHandler(asyncResult, function () { success(asyncResult.value.headers[0]); }, fail);
                    });
                }
            }, fail);
        }
        DataHelper.TryReadHeaderFromExcel = TryReadHeaderFromExcel;
        function InsertRowsToTable(bindingId, rows, success, fail) {
            GetBindingById(bindingId, function (binding) {
                var rowCount = binding.rowCount;
                binding.addRowsAsync(rows, function (asyncResult) {
                    CallbackHandler(asyncResult, function () { return success(rowCount); }, fail);
                });
            }, fail);
        }
        DataHelper.InsertRowsToTable = InsertRowsToTable;
        function RemoveRowsFromTable(bindingId, headers, rowIdsToRemove, success, fail) {
            ReadDataFromExcel(bindingId, function (data) {
                data = data.filter(function (value, rowIndex) {
                    return rowIdsToRemove.indexOf(rowIndex) < 0;
                });
                GetBindingById(bindingId, function (binding) {
                    UpdateDataByBinding(headers, data, undefined, binding, success, fail);
                });
            }, fail);
        }
        DataHelper.RemoveRowsFromTable = RemoveRowsFromTable;
        function SetRowDataWithColor(bindingId, rowId, data, formats, success, fail) {
            var tableData = new Office.TableData();
            var options = {
                coercionType: "table",
                startColumn: 0,
                startRow: rowId,
                cellFormat: formats,
            };
            tableData.rows = [data];
            GetBindingById(bindingId, function (b) {
                var binding = b;
                binding.setDataAsync(tableData, options, function (asyncResult) { return CallbackHandler(asyncResult, success, fail); });
            }, fail);
        }
        DataHelper.SetRowDataWithColor = SetRowDataWithColor;
        function SetTableCellDataWithColor(bindingId, columnId, rowId, data, color, success, fail) {
            var tableData = new Office.TableData();
            var options = {
                coercionType: "table",
                startColumn: columnId,
                startRow: rowId,
                cellFormat: [{ cells: { row: rowId, column: columnId }, format: { backgroundColor: color } }]
            };
            tableData.rows = [[data]];
            GetBindingById(bindingId, function (b) {
                var binding = b;
                binding.setDataAsync(tableData, options, function (asyncResult) { return CallbackHandler(asyncResult, success, fail); });
            }, fail);
        }
        DataHelper.SetTableCellDataWithColor = SetTableCellDataWithColor;
        function GetSelectedData(success, fail) {
            Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (asyncResult) { return CallbackHandler(asyncResult, function () { success(asyncResult.value); }, fail); });
        }
        DataHelper.GetSelectedData = GetSelectedData;
        function CreateTableWithBinding(headers, data, bindingId, success) {
            GotoLocation(1, 1, function () {
                CreateTableFromSelection(headers, function () {
                    CreateBindingFromSelection(bindingId, function (binding) {
                        if (data !== undefined) {
                            var option = { style: "TableStyleMedium4" };
                            SetTableOptionsByBinding(binding, option, undefined, undefined);
                            UpdateDataByBinding(headers, data, undefined, binding, success);
                        }
                    });
                });
            });
        }
        function CreateTableFromSelection(headers, success, fail) {
            var table = new Office.TableData();
            table.headers = headers;
            table.rows = undefined;
            Office.context.document.setSelectedDataAsync(table, { coercionType: Office.CoercionType.Table }, function (asyncResult) {
                CallbackHandler(asyncResult, success, fail);
            });
        }
        function CreateBindingFromSelection(bindingId, success, fail) {
            Office.context.document.bindings.addFromSelectionAsync(Office.BindingType.Table, { id: bindingId }, function (asyncResult) {
                CallbackHandler(asyncResult, function () { return success(asyncResult.value); }, fail);
            });
        }
        function UpdateDataByBinding(headers, data, format, binding, success, fail) {
            // goto table by using table binding
            GotoLocationByBinding(binding.id, function () {
                // update the table when the row count is not changed
                // else refresh the table with deleting and insert new rows
                if (binding.rowCount === data.length) {
                    var table = new Office.TableData();
                    table.headers = headers;
                    table.rows = data;
                    binding.setDataAsync(table, { coercionType: "table" }, function (asyncResult) {
                        CallbackHandler(asyncResult, success, fail);
                    });
                    // goto the default location (first cell)
                    GotoLocation(1, 1, undefined, undefined);
                }
                else {
                    DeleteAllDataFromTable(binding, function () {
                        // apply text format to all cells
                        var textFormat = [{ cells: Office.Table.All, format: { numberFormat: "@" } }];
                        SetTableFormatByBinding(binding, textFormat, true, function () {
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
        function DeleteAllDataFromTable(binding, success, fail) {
            binding.deleteAllDataValuesAsync(function (asyncResult) {
                CallbackHandler(asyncResult, success, fail);
            });
        }
        function EnsureEventHandlerToBinding(bindingID, eventType, handler) {
            Office.context.document.bindings.getByIdAsync(bindingID, function (asyncResult) { return CallbackHandler(asyncResult, function () {
                asyncResult.value.addHandlerAsync(eventType, handler);
            }, undefined); });
        }
        DataHelper.EnsureEventHandlerToBinding = EnsureEventHandlerToBinding;
        function GetExistingTables(success, fail) {
            Office.context.document.bindings.getAllAsync(function (asyncResult) { return CallbackHandler(asyncResult, function () {
                var bindings = asyncResult.value;
                var tables = Array();
                bindings.forEach(function (binding) {
                    if (binding.type === Office.BindingType.Table && binding.columnCount > 0 && binding.hasHeaders) {
                        tables.push(binding.id);
                    }
                });
                success(tables);
            }, fail); });
        }
        DataHelper.GetExistingTables = GetExistingTables;
        function TryGetBindingById(bindingId, success, fail) {
            Office.context.document.bindings.getByIdAsync(bindingId, function (asyncResult) {
                if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                    var errorCodeForSpecifiedBindingDoesNotExist = 3002;
                    if (asyncResult.error && asyncResult.error.code === errorCodeForSpecifiedBindingDoesNotExist) {
                        success(undefined);
                    }
                    else {
                        ShowErrorNotification1(asyncResult.error);
                        if (fail)
                            fail();
                    }
                }
                else {
                    if (asyncResult.value.columnCount === 0) {
                        success(undefined);
                    }
                    else {
                        success(asyncResult.value);
                    }
                }
            });
        }
        function GetBindingById(bindingId, success, fail) {
            Office.context.document.bindings.getByIdAsync(bindingId, function (asyncResult) {
                CallbackHandler(asyncResult, function () {
                    if (asyncResult.value.columnCount === 0) {
                        ShowErrorNotification2("Cannot find table", "The binded table doesn't existing. Please import the data again.");
                        if (fail)
                            fail();
                    }
                    else {
                        success(asyncResult.value);
                    }
                }, fail);
            });
        }
        // ==========================
        // OData data helper methods
        // ========================== 
        function ReadDataFromOData(tableName, query, success, fail) {
            PageMethods.ReadDataFromOData(tableName, query, success, fail);
        }
        DataHelper.ReadDataFromOData = ReadDataFromOData;
        function ReadDataFromODataWithHeaders(tableName, query, success, fail) {
            PageMethods.ReadDataFromODataWithHeaders(tableName, query, success, fail);
        }
        DataHelper.ReadDataFromODataWithHeaders = ReadDataFromODataWithHeaders;
        function UpdateDataToOData(changes, tableName, headers, callback) {
            PageMethods.UpdateDataToOData(changes, tableName, headers, function (error) {
                if (error !== undefined && error.length !== 0) {
                    ODSampleData.showNotification("Error", "Updating data to OData failed" + ": " + error);
                }
                if (callback) {
                    callback();
                }
            });
        }
        DataHelper.UpdateDataToOData = UpdateDataToOData;
        // ==========================
        // Document settings helper methods
        // ========================== 
        function SetDataFeedToDocumentSettings(dataFeed) {
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
        DataHelper.SetDataFeedToDocumentSettings = SetDataFeedToDocumentSettings;
        function RemoveDataFeedFromDocumentSettings() {
            Office.context.document.settings.remove("DataFeed");
            Office.context.document.settings.saveAsync(function (asyncResult) {
                ShowErrorNotification(asyncResult);
            });
        }
        DataHelper.RemoveDataFeedFromDocumentSettings = RemoveDataFeedFromDocumentSettings;
        function GetDataFeedsFromDocumentSettings() {
            var dataFeed = JSON.parse(Office.context.document.settings.get("DataFeed"));
            return dataFeed;
        }
        DataHelper.GetDataFeedsFromDocumentSettings = GetDataFeedsFromDocumentSettings;
        // ==========================
        // Formating helper methods
        // ==========================
        var formatList = new Array();
        var formatTimer;
        function SetTableFormatByBindingId(bindingId, format, success, fail) {
            GetBindingById(bindingId, function (binding) {
                binding.setFormatsAsync(format, function (asyncResult) { return CallbackHandler(asyncResult, success, fail); });
            });
        }
        function SetTableFormatByBinding(binding, format, immediately, success, fail) {
            if (immediately) {
                binding.setFormatsAsync(format, function (asyncResult) { return CallbackHandler(asyncResult, success, fail); });
            }
            else {
                formatList = formatList.concat(format);
                clearTimeout(formatTimer);
                formatTimer = setTimeout(function () {
                    var formatPayload = formatList;
                    binding.setFormatsAsync(formatPayload, function (asyncResult) { return CallbackHandler(asyncResult, success, fail); });
                    formatList = new Array();
                }, 200);
            }
        }
        function SetTableOptionsByBinding(binding, option, success, fail) {
            binding.setTableOptionsAsync(option, function (asyncResult) { return CallbackHandler(asyncResult, success, fail); });
        }
        function SetTableRowColor(bindingId, rowId, color) {
            var format = [{ cells: { row: rowId }, format: { backgroundColor: color } }];
            SetTableFormatByBindingId(bindingId, format);
        }
        DataHelper.SetTableRowColor = SetTableRowColor;
        function SetTableCellColor(bindingId, rowId, columnId, color, success, fail) {
            var format = [{ cells: { row: rowId, column: columnId }, format: { backgroundColor: color } }];
            SetTableFormatByBindingId(bindingId, format, success, fail);
        }
        DataHelper.SetTableCellColor = SetTableCellColor;
        function SetTableFormat(bindingId, format, success, fail) {
            //var format = [{ cells: Office.Table.All, format: { backgroundColor: color } }];
            SetTableFormatByBindingId(bindingId, format, success, fail);
        }
        DataHelper.SetTableFormat = SetTableFormat;
        // ==========================
        // Navigation helper methods
        // ==========================   
        function GotoLocation(row, column, success, fail) {
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
            Office.context.document.goToByIdAsync(namedItem, Office.GoToType.NamedItem, function (asyncResult) {
                if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                    var namedItem = "R" + row + "C" + column;
                    Office.context.document.goToByIdAsync(namedItem, Office.GoToType.NamedItem, function (asyncResult) { return CallbackHandler(asyncResult, success, fail); });
                }
                else {
                    if (success) {
                        success();
                    }
                }
            });
        }
        DataHelper.GotoLocation = GotoLocation;
        function GotoLocationByBinding(bindingId, success, fail) {
            Office.context.document.goToByIdAsync(bindingId, Office.GoToType.Binding, function (asyncResult) { return CallbackHandler(asyncResult, success, fail); });
        }
        DataHelper.GotoLocationByBinding = GotoLocationByBinding;
        // ==========================
        // Error handling helper methods
        // ========================== 
        function ShowErrorNotification(asyncResult) {
            if (asyncResult.status === "failed") {
                ODSampleData.showNotification("Error", asyncResult.error.name + ": " + asyncResult.error.message);
            }
        }
        function ShowErrorNotification1(error) {
            ODSampleData.showNotification("Error", error.name + ": " + error.code + ": " + error.message);
        }
        function ShowErrorNotification2(name, message) {
            ODSampleData.showNotification("Error", name + ": " + message);
        }
        DataHelper.ShowErrorNotification2 = ShowErrorNotification2;
        function CallbackHandler(asyncResult, success, fail) {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                ShowErrorNotification1(asyncResult.error);
                if (fail) {
                    fail();
                }
            }
            else {
                if (success) {
                    success();
                }
            }
        }
    })(DataHelper = ODSampleData.DataHelper || (ODSampleData.DataHelper = {}));
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=DataHelper.js.map