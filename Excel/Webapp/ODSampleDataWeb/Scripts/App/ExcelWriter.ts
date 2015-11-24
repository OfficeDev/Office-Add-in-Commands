module ODSampleData.ExcelWriter {
    export class RecordWriter extends Utility.ObjectBase implements Model.IObserver {
        private cellDiffObserver = new CellDiffObserver();

        public filter(recordPair: RecordPair): boolean {
            switch (recordPair.DiffStatus) {
                case DiffStatus.Different:
                case DiffStatus.OnlyOnLocal:
                case DiffStatus.OnlyOnOData:
                    return true;
            }

            return false;
        }

        public onObserved(recordPair: RecordPair) {
            recordPair.addObserverForCellDiffInfo(this.cellDiffObserver);
        }

        public onUnobserved(recordPair: RecordPair) {
            recordPair.removeObserverForCellDiffInfo(this.cellDiffObserver);
        }
    }

    export class CellDiffObserver extends Model.OnNewOrChanged {
        private inserter: BulkWritingHelper<RecordPair>;
        private deleter: BulkWritingHelper<RecordPair>;
        private updaters: Utility.StringMap<BulkWritingHelper<CellDiffInfo>>;
        private writerPromises: Utility.StringMap<JQueryPromise<void>>;

        constructor() {
            super(() => true,(cellDiffInfo: CellDiffInfo) => this.WriteToExcel(cellDiffInfo));
            this.inserter = new BulkWritingHelper<RecordPair>(records => this.insert(records));
            this.deleter = new BulkWritingHelper<RecordPair>(records => this.remove(records));
            this.updaters = {};
            this.writerPromises = {};
        }

        private WriteToExcel(cellDiffInfo: CellDiffInfo) {
            if (cellDiffInfo.ColumnName === CellDiffInfo.ColumnNameForWholeRow) {
                var recordPair = cellDiffInfo.RecordPair;
                var recordToWrite = cellDiffInfo.UsingODataValue ? recordPair.ODataRowData : recordPair.ExcelRowData;
                var recordExistingInExcel = (recordPair.RowIdInExcel !== Number.MAX_VALUE);
                if (!!recordToWrite !== recordExistingInExcel) {
                    if (recordToWrite) {
                        this.inserter.orderFor(cellDiffInfo.RecordPair);
                    } else {
                        this.deleter.orderFor(cellDiffInfo.RecordPair);
                    }
                }
            } else {
                this.getUpdater(cellDiffInfo).orderFor(cellDiffInfo);
            }
        }

        private insert(records: RecordPair[]) {
            var recordPairsNotInserted = DataFeed.ActiveDataFeed.getAllRecordPairs()
                .filter(record => record.RowIdInExcel === Number.MAX_VALUE);

            this.order(recordPairsNotInserted, deferred => {
                insertRows(records,() => deferred.resolve(),() => deferred.reject());
            });
        }

        private remove(records: RecordPair[]) {
            var recordPairsAffected = DataFeed.ActiveDataFeed.getAllRecordPairs();

            this.order(recordPairsAffected, deferred => {
                removeRows(records,() => deferred.resolve(),() => deferred.reject());
            });
        }

        private updateCellsForSingleRecord(cells: CellDiffInfo[]) {
            var record = cells[0].RecordPair;

            this.order([record], deferred => {
                updateRecord(record, deferred);
            });
        }

        private getUpdater(cellDiffInfo: CellDiffInfo) {
            var key = cellDiffInfo.RecordPair._getId();
            var updater = this.updaters[key];

            if (!updater) {
                updater = new BulkWritingHelper<CellDiffInfo>(
                    cells => this.updateCellsForSingleRecord(cells));

                this.updaters[key] = updater;
            }

            return updater;
        }

        private order(records: RecordPair[], action: (deferred: JQueryDeferred<void>) => void) {
            var records = Utility.ObjectSet.fromArray(records).toArray();
            var promises = records
                .map(record => this.writerPromises[record._getId()])
                .filter(promise => !!promise);

            var deferred = $.Deferred<void>();
            var promise = deferred.promise();
            records.forEach(record => this.writerPromises[record._getId()] = promise);

            var count = promises.length;

            if (count === 0) {
                action(deferred);
            } else {
                var tryToTrigger = () => {
                    if (--count === 0) {
                        action(deferred);
                    }
                };

                promises.forEach(promise => {
                    promise.always(tryToTrigger);
                });
            }
        }
    }

    interface WriterAction<T> {
        (data: T[], success: () => void, fail: () => void): void;
    }

    class BulkWritingHelper<T> {
        private data: T[] = [];

        private timer: number;
        private action: (data: T[]) => void;

        private trigger: Utility.CallLater;

        constructor(action: (data: T[]) => void) {
            this.action = action;
            this.trigger = new Utility.CallLater(() => this.flush(), 20);
        }

        public orderFor(data: T) {
            this.data.push(data);
            this.trigger.callOnceLater();
        }

        private flush() {
            var data = this.data;
            this.data = [];
            this.action(data);
        }
    }

    function insertRows(records: RecordPair[], success: () => void, fail: () => void) {
        records = records.filter(record => {
            if (record.RowIdInExcel !== Number.MAX_VALUE) {
                return false;
            }

            var cellDiffInfo = record.getCellDiffInfo(CellDiffInfo.ColumnNameForWholeRow);
            var recordToWrite = cellDiffInfo.UsingODataValue ? cellDiffInfo.RecordPair.ODataRowData : cellDiffInfo.RecordPair.ExcelRowData;

            return !!recordToWrite;
        });

        if (records.length === 0) {
            success();
            return;
        }

        var dataFeed = DataFeed.ActiveDataFeed;
        var headers = dataFeed.Headers;

        var data = records.map(record => {
            var cellDiffInfo = record.getAllCellDiffInfo()[0];
            var recordToWrite = cellDiffInfo.UsingODataValue ? cellDiffInfo.RecordPair.ODataRowData : cellDiffInfo.RecordPair.ExcelRowData;
            return headers.map(header => recordToWrite[header]);
        });

        ODSampleData.DataHelper.InsertRowsToTable(
            dataFeed.Name,
            data,
            rowIdFrom => {
                records.forEach((record, index) => { record.RowIdInExcel = index + rowIdFrom })
                success();
            },
            fail);
    }

    function removeRows(records: RecordPair[], success: () => void, fail: () => void) {
        records = records.filter(record => record.RowIdInExcel !== Number.MAX_VALUE);

        if (records.length === 0) {
            success();
            return;
        }

        var rowIds = records.map(record => record.RowIdInExcel);

        ODSampleData.DataHelper.RemoveRowsFromTable(
            DataFeed.ActiveDataFeed.Name,
            DataFeed.ActiveDataFeed.Headers,
            rowIds,
            () => {
                onRecordsRemoved(rowIds);

                ODSampleData.DataHelper.SetTableFormat(
                    DataFeed.ActiveDataFeed.Name,
                    DataFeed.ActiveDataFeed.GetFormat(),
                    success,
                    fail);
            },
            fail);
    }

    function onRecordsRemoved(removedRowIds: number[]) {
        var dataFeed = DataFeed.ActiveDataFeed;
        dataFeed.getAllRecordPairs().forEach((recordPair: RecordPair) => {
            if (removedRowIds.indexOf(recordPair.RowIdInExcel) >= 0) {
                recordPair.RowIdInExcel = Number.MAX_VALUE;
            } else {
                recordPair.RowIdInExcel -= removedRowIds.filter(removedRowId => removedRowId < recordPair.RowIdInExcel).length;
            }
        });
    }

    function updateRecord(record: RecordPair, deferred: JQueryDeferred<void>) {
        var headers = DataFeed.ActiveDataFeed.Headers;
        var data = [];
        var colors = [];

        headers.forEach((header, index) => {
            var cellDiffInfo = record.getCellDiffInfo(header);
            if (!cellDiffInfo) {
                data.push(record.ExcelRowData[header]);
            } else if (cellDiffInfo.UsingODataValue) {
                data.push(record.ODataRowData[header]);
            } else {
                data.push(record.ExcelRowData[header]);
            }
        });

        ODSampleData.DataHelper.SetRowDataWithColor(
            DataFeed.ActiveDataFeed.Name,
            record.RowIdInExcel,
            data,
            record.Format,
            () => deferred.resolve(),
            () => deferred.reject());
    }
}