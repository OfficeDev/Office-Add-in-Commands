var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ODSampleData;
(function (ODSampleData) {
    var RecordItem = (function (_super) {
        __extends(RecordItem, _super);
        function RecordItem() {
            _super.apply(this, arguments);
        }
        return RecordItem;
    })(Utility.StringMap);
    ODSampleData.RecordItem = RecordItem;
    var RecordPair = (function (_super) {
        __extends(RecordPair, _super);
        function RecordPair(dataFeed, id) {
            var _this = this;
            _super.call(this);
            this.rowIdInExcel = Number.MAX_VALUE;
            this.rowDiffTable = {};
            this.resolveStatus = RecordResolveStatus.NoDiff;
            this.dataFeed = dataFeed;
            this.id = id;
            this.cellDiffInfoManager = new Model.DataManager();
            this.cellDiffInfoManager.addObserver(new Model.OnChanged(function () { return true; }, function () { return _this.updateResolveStatus(); }));
        }
        Object.defineProperty(RecordPair.prototype, "DataFeed", {
            get: function () {
                return this.dataFeed;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecordPair.prototype, "Id", {
            get: function () {
                return this.id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecordPair.prototype, "RowIdInExcel", {
            get: function () {
                return this.rowIdInExcel;
            },
            set: function (value) {
                if (this.rowIdInExcel !== value) {
                    this.rowIdInExcel = value;
                    this.notifyUpdateLater();
                    this.getAllCellDiffInfo().forEach(function (cellDiffInfo) {
                        cellDiffInfo.notifyUpdateLater();
                    });
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecordPair.prototype, "ExcelRowData", {
            get: function () {
                return this.excelRowData;
            },
            set: function (value) {
                if (value !== this.excelRowData) {
                    this.excelRowData = value;
                    this.rowDiffStatus = DiffStatus.WaitingForCompare;
                    this.notifyUpdateLater();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecordPair.prototype, "ODataRowData", {
            get: function () {
                return this.oDataRowData;
            },
            set: function (value) {
                if (value !== this.oDataRowData) {
                    this.oDataRowData = value;
                    this.rowDiffStatus = DiffStatus.WaitingForCompare;
                    this.notifyUpdateLater();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecordPair.prototype, "DiffStatus", {
            get: function () {
                return this.rowDiffStatus;
            },
            set: function (value) {
                if (value !== this.rowDiffStatus) {
                    this.rowDiffStatus = value;
                    this.notifyUpdateLater();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecordPair.prototype, "ResolveStatus", {
            get: function () {
                return this.resolveStatus;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecordPair.prototype, "RowDiffTable", {
            get: function () {
                return this.rowDiffTable;
            },
            enumerable: true,
            configurable: true
        });
        RecordPair.prototype.getCellDiffInfo = function (key) {
            return this.rowDiffTable[key];
        };
        RecordPair.prototype.getAllCellDiffInfo = function () {
            return Utility.MapEx.toArray(this.rowDiffTable);
        };
        RecordPair.prototype.setCellDiffInfo = function (value) {
            var columnName = value.ColumnName;
            if (this.rowDiffTable[columnName] !== value) {
                if (this.rowDiffTable[columnName]) {
                    this.cellDiffInfoManager.removeData(this.rowDiffTable[columnName]);
                }
                if (value) {
                    this.rowDiffTable[columnName] = value;
                    this.cellDiffInfoManager.addData(value);
                }
                else {
                    delete this.rowDiffTable[columnName];
                }
                this.updateResolveStatus();
                this.notifyUpdateLater();
            }
        };
        RecordPair.prototype.clearAllCellDiffInfo = function () {
            var _this = this;
            var allCellDiffInfo = this.getAllCellDiffInfo();
            if (allCellDiffInfo.length > 0) {
                allCellDiffInfo.forEach(function (cellDiffInfo) {
                    _this.cellDiffInfoManager.removeData(cellDiffInfo);
                });
                this.rowDiffTable = {};
                this.updateResolveStatus();
                this.notifyUpdateLater();
            }
        };
        RecordPair.prototype.addObserverForCellDiffInfo = function (observer) {
            this.cellDiffInfoManager.addObserver(observer);
        };
        RecordPair.prototype.removeObserverForCellDiffInfo = function (observer) {
            this.cellDiffInfoManager.removeObserver(observer);
        };
        Object.defineProperty(RecordPair.prototype, "Format", {
            get: function () {
                var _this = this;
                if (this.getAllCellDiffInfo().length === 0) {
                    return undefined;
                }
                var rowId = this.RowIdInExcel;
                var format = [{ cells: { row: rowId }, format: { backgroundColor: "#FFFACD" } }];
                this.DataFeed.Headers.forEach(function (header, index) {
                    var cell = _this.rowDiffTable[header];
                    if (cell) {
                        format.push({ cells: { row: rowId, column: index }, format: { backgroundColor: cell.UsingODataValue ? "#9dcbeb" : "#c6efce" } });
                    }
                });
                return format;
            },
            enumerable: true,
            configurable: true
        });
        RecordPair.prototype.updateResolveStatus = function () {
            var resolveStatus = this.getCurrentResolveStatus();
            if (this.resolveStatus !== resolveStatus) {
                this.resolveStatus = resolveStatus;
                this.notifyUpdateLater();
            }
        };
        RecordPair.prototype.getCurrentResolveStatus = function () {
            var usingODataValueInEachCell = this.getAllCellDiffInfo().map(function (cellDiff) { return cellDiff.UsingODataValue; });
            var resolveStatus = RecordResolveStatus.Mixed;
            if (usingODataValueInEachCell.every(function (usingOData) { return !usingOData; })) {
                resolveStatus = RecordResolveStatus.Excel;
            }
            else if (usingODataValueInEachCell.every(function (usingOData) { return usingOData; })) {
                resolveStatus = RecordResolveStatus.OData;
            }
            return resolveStatus;
        };
        return RecordPair;
    })(Model.DataItem);
    ODSampleData.RecordPair = RecordPair;
    (function (DiffStatus) {
        DiffStatus[DiffStatus["WaitingForCompare"] = 0] = "WaitingForCompare";
        DiffStatus[DiffStatus["NoDiff"] = 1] = "NoDiff";
        DiffStatus[DiffStatus["NoData"] = 2] = "NoData";
        DiffStatus[DiffStatus["OnlyOnLocal"] = 3] = "OnlyOnLocal";
        DiffStatus[DiffStatus["OnlyOnOData"] = 4] = "OnlyOnOData";
        DiffStatus[DiffStatus["Different"] = 5] = "Different";
    })(ODSampleData.DiffStatus || (ODSampleData.DiffStatus = {}));
    var DiffStatus = ODSampleData.DiffStatus;
    (function (RecordResolveStatus) {
        RecordResolveStatus[RecordResolveStatus["NoDiff"] = 0] = "NoDiff";
        RecordResolveStatus[RecordResolveStatus["Mixed"] = 1] = "Mixed";
        RecordResolveStatus[RecordResolveStatus["Excel"] = 2] = "Excel";
        RecordResolveStatus[RecordResolveStatus["OData"] = 3] = "OData";
    })(ODSampleData.RecordResolveStatus || (ODSampleData.RecordResolveStatus = {}));
    var RecordResolveStatus = ODSampleData.RecordResolveStatus;
    var CellDiffInfo = (function (_super) {
        __extends(CellDiffInfo, _super);
        function CellDiffInfo(recordPair, columnName) {
            _super.call(this);
            this.usingODataValue = false;
            this.recordPair = recordPair;
            this.columnName = columnName;
            if (columnName === CellDiffInfo.ColumnNameForWholeRow) {
                this.excelValueSnapshot = !!recordPair.ExcelRowData;
                this.oDataValue = !!recordPair.ODataRowData;
            }
            else {
                this.excelValueSnapshot = recordPair.ExcelRowData[columnName];
                this.oDataValue = recordPair.ODataRowData[columnName];
            }
        }
        Object.defineProperty(CellDiffInfo, "ColumnNameForWholeRow", {
            get: function () {
                return "{971FDA3B-423A-40B1-A854-F501CC5460B3}";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CellDiffInfo.prototype, "RecordPair", {
            get: function () {
                return this.recordPair;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CellDiffInfo.prototype, "ExcelValueSnapshot", {
            get: function () {
                return this.excelValueSnapshot;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CellDiffInfo.prototype, "ODataValue", {
            get: function () {
                return this.oDataValue;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CellDiffInfo.prototype, "ColumnName", {
            get: function () {
                return this.columnName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CellDiffInfo.prototype, "UsingODataValue", {
            get: function () {
                return !!this.usingODataValue;
            },
            set: function (value) {
                if (!this.usingODataValue !== !value) {
                    this.usingODataValue = value;
                    this.notifyUpdateLater();
                }
            },
            enumerable: true,
            configurable: true
        });
        return CellDiffInfo;
    })(Model.DataItem);
    ODSampleData.CellDiffInfo = CellDiffInfo;
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=Record.js.map