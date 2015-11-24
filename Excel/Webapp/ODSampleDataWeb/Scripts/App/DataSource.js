var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ODSampleData;
(function (ODSampleData) {
    var DataFeedColumn = (function () {
        function DataFeedColumn(dataFeed, name) {
            this.dataFeed = dataFeed;
            this.name = name;
            this.showInExcel = true;
        }
        Object.defineProperty(DataFeedColumn.prototype, "DataFeed", {
            get: function () {
                return this.dataFeed;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFeedColumn.prototype, "Name", {
            get: function () {
                return this.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFeedColumn.prototype, "IsKey", {
            get: function () {
                return this.DataFeed.Key === this.Name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFeedColumn.prototype, "ShowInExcel", {
            get: function () {
                return !!this.showInExcel;
            },
            set: function (value) {
                if (!this.IsKey && !this.showInExcel !== !value) {
                    this.showInExcel = value;
                    this.dataFeed.notifyUpdateLater();
                }
            },
            enumerable: true,
            configurable: true
        });
        return DataFeedColumn;
    })();
    ODSampleData.DataFeedColumn = DataFeedColumn;
    var DataFeed = (function (_super) {
        __extends(DataFeed, _super);
        function DataFeed(name, columnNames, types, key, entityType) {
            var _this = this;
            _super.call(this);
            this.name = name;
            this.oDataColumnNames = columnNames;
            this.columns = columnNames.map(function (columnName) { return new DataFeedColumn(_this, columnName); });
            this.types = types;
            this.key = key;
            this.entityType = entityType;
            this.recordPairManager = new Model.DataManager();
            this.allRecordPairs = {};
            var defaultHeaders = ODSampleData.config.DataFeedDefaultHeaders[name];
            if (defaultHeaders) {
                this.setHeaders(defaultHeaders, false);
            }
        }
        Object.defineProperty(DataFeed, "ActiveDataFeed", {
            get: function () {
                return DataFeed.activeDataFeed;
            },
            enumerable: true,
            configurable: true
        });
        DataFeed.initializeAll = function (onReady) {
            PageMethods.GetTables(function (tables) {
                for (var i = 0; i < tables.length; i++) {
                    var item = new DataFeed(tables[i].tableName, tables[i].headers, tables[i].types, tables[i].key, tables[i].entityTypeName);
                    ODSampleData.dataFeedManager.addData(item);
                }
                onReady();
            });
        };
        Object.defineProperty(DataFeed.prototype, "Name", {
            get: function () {
                return this.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFeed.prototype, "Columns", {
            get: function () {
                return this.columns;
            },
            set: function (value) {
                if (this.columns !== value) {
                    this.columns = value;
                    this.notifyUpdateLater();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFeed.prototype, "Headers", {
            get: function () {
                return this.columns.filter(function (header) { return header.ShowInExcel; }).map(function (header) { return header.Name; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFeed.prototype, "Key", {
            get: function () {
                return this.key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFeed.prototype, "EntityType", {
            get: function () {
                return this.entityType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFeed.prototype, "LastSyncTime", {
            get: function () {
                return this.lastSyncTime;
            },
            set: function (value) {
                if (this.lastSyncTime !== value) {
                    this.lastSyncTime = value;
                    this.notifyUpdateLater();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFeed.prototype, "Active", {
            get: function () {
                return this.active;
            },
            enumerable: true,
            configurable: true
        });
        DataFeed.prototype.importToExcelAsync = function (callback) {
            var _this = this;
            this.readExcelHeader(function () {
                _this.readODataDataFromServer(function (oDataData) {
                    var excelHeaders = _this.Headers;
                    var indexMap = _this.oDataColumnNames.map(function (columnName) { return excelHeaders.indexOf(columnName); });
                    var excelData = oDataData.map(function (oDataRowData) {
                        var excelRowData = [];
                        oDataRowData.forEach(function (value, index) {
                            if (indexMap[index] >= 0) {
                                excelRowData[indexMap[index]] = value;
                            }
                        });
                        return excelRowData;
                    });
                    ODSampleData.DataHelper.UpdateDataToExcel(_this.Headers, excelData, _this.name, callback);
                }, function (error) { return ODSampleData.showNotification("Failed to get OData data.", error.toString()); });
            });
        };
        DataFeed.prototype.readExcelData = function (success, fail) {
            var _this = this;
            this.readExcelHeader(function () {
                ODSampleData.DataHelper.ReadDataFromExcel(_this.name, function (excelData) {
                    _this.setExcelData(excelData);
                    if (success) {
                        success(excelData);
                    }
                });
            });
        };
        DataFeed.prototype.readExcelHeader = function (success, fail) {
            var _this = this;
            ODSampleData.DataHelper.TryReadHeaderFromExcel(this.name, function (excelHeaders) {
                if (!excelHeaders || _this.setHeaders(excelHeaders, true)) {
                    if (success) {
                        success();
                    }
                }
                else {
                    if (fail) {
                        fail("Headers has been changed by user.");
                    }
                }
            });
        };
        DataFeed.prototype.readODataDataFromServer = function (success, fail) {
            var _this = this;
            ODSampleData.DataHelper.ReadDataFromOData(this.name, "", function (oDataData) {
                _this.setOData(oDataData);
                if (success) {
                    success(oDataData);
                }
            }, fail);
        };
        DataFeed.prototype.setExcelData = function (excelData) {
            var _this = this;
            this.getAllRecordPairs().forEach(function (recordPair) {
                recordPair.RowIdInExcel = Number.MAX_VALUE;
                recordPair.ExcelRowData = undefined;
            });
            excelData.forEach(function (row, rowIndex) {
                var excelRowData = new ODSampleData.RecordItem();
                _this.Headers.forEach(function (key, indexInRow) {
                    excelRowData[key] = row[indexInRow];
                });
                var recordPair = _this.getOrCreateRecordPairById(excelRowData[_this.key]);
                recordPair.ExcelRowData = excelRowData;
                recordPair.RowIdInExcel = rowIndex;
                recordPair.DiffStatus = ODSampleData.DiffStatus.WaitingForCompare;
            });
        };
        DataFeed.prototype.setOData = function (oDataData) {
            var _this = this;
            this.getAllRecordPairs().forEach(function (recordPair) {
                recordPair.ODataRowData = undefined;
            });
            oDataData.forEach(function (row) {
                var oDataRowData = new ODSampleData.RecordItem();
                _this.oDataColumnNames.forEach(function (key, index) {
                    oDataRowData[key] = row[index];
                });
                var recordPair = _this.getOrCreateRecordPairById(oDataRowData[_this.key]);
                recordPair.ODataRowData = oDataRowData;
                recordPair.DiffStatus = ODSampleData.DiffStatus.WaitingForCompare;
            });
            this.LastSyncTime = new Date();
        };
        DataFeed.prototype.addRecordPairObserver = function (observer) {
            return this.recordPairManager.addObserver(observer);
        };
        DataFeed.prototype.removeRecordPairObserver = function (observer) {
            return this.recordPairManager.removeObserver(observer);
        };
        DataFeed.prototype.getOrCreateRecordPairById = function (id) {
            if (!this.allRecordPairs[id]) {
                var newPair = new ODSampleData.RecordPair(this, id);
                this.allRecordPairs[id] = newPair;
                this.recordPairManager.addData(newPair);
            }
            return this.allRecordPairs[id];
        };
        DataFeed.prototype.getAllRecordPairs = function () {
            return this.recordPairManager.getAllData();
        };
        DataFeed.prototype.removeRecordPair = function (recordPair) {
            if (this.allRecordPairs[recordPair.Id] === recordPair) {
                this.recordPairManager.removeData(recordPair);
                delete this.allRecordPairs[recordPair.Id];
            }
        };
        DataFeed.prototype.markAsActive = function () {
            if (DataFeed.activeDataFeed === this) {
                return;
            }
            if (DataFeed.activeDataFeed) {
                DataFeed.activeDataFeed.markAsUnactive();
            }
            DataFeed.activeDataFeed = this;
            this.active = true;
            this.notifyUpdateLater();
        };
        DataFeed.prototype.markAsUnactive = function () {
            if (DataFeed.activeDataFeed !== this) {
                return;
            }
            DataFeed.activeDataFeed = undefined;
            this.active = false;
            this.notifyUpdateLater();
        };
        DataFeed.prototype.GetFormat = function () {
            var unremovedFormats = [];
            DataFeed.ActiveDataFeed.getAllRecordPairs()
                .filter(function (record) {
                return record.RowIdInExcel !== Number.MAX_VALUE && record.Format !== undefined;
            }).forEach(function (record) {
                unremovedFormats = unremovedFormats.concat(record.Format);
            });
            // sort the format array to make sure
            // the cell format is after the row format
            unremovedFormats = unremovedFormats.sort(function (a, b) {
                if (a["cells"]["column"] !== undefined && a["cells"]["row"] !== undefined && b["cells"]["column"] !== undefined && b["cells"]["row"] !== undefined) {
                    return 0;
                }
                else if (a["cells"]["column"] !== undefined && a["cells"]["row"] !== undefined) {
                    return 1;
                }
                else if (b["cells"]["column"] !== undefined && b["cells"]["row"] !== undefined) {
                    return -1;
                }
            });
            return unremovedFormats;
        };
        DataFeed.prototype.setHeaders = function (headers, sortHeaders) {
            var _this = this;
            if (headers.indexOf(this.Key) < 0 || headers.some(function (header) { return _this.oDataColumnNames.indexOf(header) < 0; })) {
                return false;
            }
            this.columns.forEach(function (column) {
                column.ShowInExcel = headers.indexOf(column.Name) >= 0;
            });
            if (sortHeaders) {
                this.columns.sort(function (a, b) {
                    if (a.ShowInExcel !== b.ShowInExcel) {
                        return a.ShowInExcel ? -1 : 1;
                    }
                    else {
                        return headers.indexOf(a.Name) - headers.indexOf(b.Name);
                    }
                });
            }
            return true;
        };
        return DataFeed;
    })(Model.DataItem);
    ODSampleData.DataFeed = DataFeed;
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=DataSource.js.map