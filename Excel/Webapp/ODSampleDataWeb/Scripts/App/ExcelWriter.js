var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ODSampleData;
(function (ODSampleData) {
    var ExcelWriter;
    (function (ExcelWriter) {
        var RecordWriter = (function (_super) {
            __extends(RecordWriter, _super);
            function RecordWriter() {
                _super.apply(this, arguments);
                this.cellDiffObserver = new CellDiffObserver();
            }
            RecordWriter.prototype.filter = function (recordPair) {
                switch (recordPair.DiffStatus) {
                    case ODSampleData.DiffStatus.Different:
                    case ODSampleData.DiffStatus.OnlyOnLocal:
                    case ODSampleData.DiffStatus.OnlyOnOData:
                        return true;
                }
                return false;
            };
            RecordWriter.prototype.onObserved = function (recordPair) {
                recordPair.addObserverForCellDiffInfo(this.cellDiffObserver);
            };
            RecordWriter.prototype.onUnobserved = function (recordPair) {
                recordPair.removeObserverForCellDiffInfo(this.cellDiffObserver);
            };
            return RecordWriter;
        })(Utility.ObjectBase);
        ExcelWriter.RecordWriter = RecordWriter;
        var CellDiffObserver = (function (_super) {
            __extends(CellDiffObserver, _super);
            function CellDiffObserver() {
                var _this = this;
                _super.call(this, function () { return true; }, function (cellDiffInfo) { return _this.WriteToExcel(cellDiffInfo); });
                this.inserter = new BulkWritingHelper(function (records) { return _this.insert(records); });
                this.deleter = new BulkWritingHelper(function (records) { return _this.remove(records); });
                this.updaters = {};
                this.writerPromises = {};
            }
            CellDiffObserver.prototype.WriteToExcel = function (cellDiffInfo) {
                if (cellDiffInfo.ColumnName === ODSampleData.CellDiffInfo.ColumnNameForWholeRow) {
                    var recordPair = cellDiffInfo.RecordPair;
                    var recordToWrite = cellDiffInfo.UsingODataValue ? recordPair.ODataRowData : recordPair.ExcelRowData;
                    var recordExistingInExcel = (recordPair.RowIdInExcel !== Number.MAX_VALUE);
                    if (!!recordToWrite !== recordExistingInExcel) {
                        if (recordToWrite) {
                            this.inserter.orderFor(cellDiffInfo.RecordPair);
                        }
                        else {
                            this.deleter.orderFor(cellDiffInfo.RecordPair);
                        }
                    }
                }
                else {
                    this.getUpdater(cellDiffInfo).orderFor(cellDiffInfo);
                }
            };
            CellDiffObserver.prototype.insert = function (records) {
                var recordPairsNotInserted = ODSampleData.DataFeed.ActiveDataFeed.getAllRecordPairs()
                    .filter(function (record) { return record.RowIdInExcel === Number.MAX_VALUE; });
                this.order(recordPairsNotInserted, function (deferred) {
                    insertRows(records, function () { return deferred.resolve(); }, function () { return deferred.reject(); });
                });
            };
            CellDiffObserver.prototype.remove = function (records) {
                var recordPairsAffected = ODSampleData.DataFeed.ActiveDataFeed.getAllRecordPairs();
                this.order(recordPairsAffected, function (deferred) {
                    removeRows(records, function () { return deferred.resolve(); }, function () { return deferred.reject(); });
                });
            };
            CellDiffObserver.prototype.updateCellsForSingleRecord = function (cells) {
                var record = cells[0].RecordPair;
                this.order([record], function (deferred) {
                    updateRecord(record, deferred);
                });
            };
            CellDiffObserver.prototype.getUpdater = function (cellDiffInfo) {
                var _this = this;
                var key = cellDiffInfo.RecordPair._getId();
                var updater = this.updaters[key];
                if (!updater) {
                    updater = new BulkWritingHelper(function (cells) { return _this.updateCellsForSingleRecord(cells); });
                    this.updaters[key] = updater;
                }
                return updater;
            };
            CellDiffObserver.prototype.order = function (records, action) {
                var _this = this;
                var records = Utility.ObjectSet.fromArray(records).toArray();
                var promises = records
                    .map(function (record) { return _this.writerPromises[record._getId()]; })
                    .filter(function (promise) { return !!promise; });
                var deferred = $.Deferred();
                var promise = deferred.promise();
                records.forEach(function (record) { return _this.writerPromises[record._getId()] = promise; });
                var count = promises.length;
                if (count === 0) {
                    action(deferred);
                }
                else {
                    var tryToTrigger = function () {
                        if (--count === 0) {
                            action(deferred);
                        }
                    };
                    promises.forEach(function (promise) {
                        promise.always(tryToTrigger);
                    });
                }
            };
            return CellDiffObserver;
        })(Model.OnNewOrChanged);
        ExcelWriter.CellDiffObserver = CellDiffObserver;
        var BulkWritingHelper = (function () {
            function BulkWritingHelper(action) {
                var _this = this;
                this.data = [];
                this.action = action;
                this.trigger = new Utility.CallLater(function () { return _this.flush(); }, 20);
            }
            BulkWritingHelper.prototype.orderFor = function (data) {
                this.data.push(data);
                this.trigger.callOnceLater();
            };
            BulkWritingHelper.prototype.flush = function () {
                var data = this.data;
                this.data = [];
                this.action(data);
            };
            return BulkWritingHelper;
        })();
        function insertRows(records, success, fail) {
            records = records.filter(function (record) {
                if (record.RowIdInExcel !== Number.MAX_VALUE) {
                    return false;
                }
                var cellDiffInfo = record.getCellDiffInfo(ODSampleData.CellDiffInfo.ColumnNameForWholeRow);
                var recordToWrite = cellDiffInfo.UsingODataValue ? cellDiffInfo.RecordPair.ODataRowData : cellDiffInfo.RecordPair.ExcelRowData;
                return !!recordToWrite;
            });
            if (records.length === 0) {
                success();
                return;
            }
            var dataFeed = ODSampleData.DataFeed.ActiveDataFeed;
            var headers = dataFeed.Headers;
            var data = records.map(function (record) {
                var cellDiffInfo = record.getAllCellDiffInfo()[0];
                var recordToWrite = cellDiffInfo.UsingODataValue ? cellDiffInfo.RecordPair.ODataRowData : cellDiffInfo.RecordPair.ExcelRowData;
                return headers.map(function (header) { return recordToWrite[header]; });
            });
            ODSampleData.DataHelper.InsertRowsToTable(dataFeed.Name, data, function (rowIdFrom) {
                records.forEach(function (record, index) { record.RowIdInExcel = index + rowIdFrom; });
                success();
            }, fail);
        }
        function removeRows(records, success, fail) {
            records = records.filter(function (record) { return record.RowIdInExcel !== Number.MAX_VALUE; });
            if (records.length === 0) {
                success();
                return;
            }
            var rowIds = records.map(function (record) { return record.RowIdInExcel; });
            ODSampleData.DataHelper.RemoveRowsFromTable(ODSampleData.DataFeed.ActiveDataFeed.Name, ODSampleData.DataFeed.ActiveDataFeed.Headers, rowIds, function () {
                onRecordsRemoved(rowIds);
                ODSampleData.DataHelper.SetTableFormat(ODSampleData.DataFeed.ActiveDataFeed.Name, ODSampleData.DataFeed.ActiveDataFeed.GetFormat(), success, fail);
            }, fail);
        }
        function onRecordsRemoved(removedRowIds) {
            var dataFeed = ODSampleData.DataFeed.ActiveDataFeed;
            dataFeed.getAllRecordPairs().forEach(function (recordPair) {
                if (removedRowIds.indexOf(recordPair.RowIdInExcel) >= 0) {
                    recordPair.RowIdInExcel = Number.MAX_VALUE;
                }
                else {
                    recordPair.RowIdInExcel -= removedRowIds.filter(function (removedRowId) { return removedRowId < recordPair.RowIdInExcel; }).length;
                }
            });
        }
        function updateRecord(record, deferred) {
            var headers = ODSampleData.DataFeed.ActiveDataFeed.Headers;
            var data = [];
            var colors = [];
            headers.forEach(function (header, index) {
                var cellDiffInfo = record.getCellDiffInfo(header);
                if (!cellDiffInfo) {
                    data.push(record.ExcelRowData[header]);
                }
                else if (cellDiffInfo.UsingODataValue) {
                    data.push(record.ODataRowData[header]);
                }
                else {
                    data.push(record.ExcelRowData[header]);
                }
            });
            ODSampleData.DataHelper.SetRowDataWithColor(ODSampleData.DataFeed.ActiveDataFeed.Name, record.RowIdInExcel, data, record.Format, function () { return deferred.resolve(); }, function () { return deferred.reject(); });
        }
    })(ExcelWriter = ODSampleData.ExcelWriter || (ODSampleData.ExcelWriter = {}));
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=ExcelWriter.js.map