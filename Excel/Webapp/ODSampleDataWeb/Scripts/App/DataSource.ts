module ODSampleData {
    export class DataFeedColumn {
        private dataFeed: DataFeed;
        private name: string;
        private showInExcel: boolean;

        constructor(dataFeed: DataFeed, name: string) {
            this.dataFeed = dataFeed;
            this.name = name;
            this.showInExcel = true;
        }

        public get DataFeed(): DataFeed {
            return this.dataFeed;
        }

        public get Name(): string {
            return this.name;
        }

        public get IsKey(): boolean {
            return this.DataFeed.Key === this.Name;
        }

        public get ShowInExcel(): boolean {
            return !!this.showInExcel;
        }

        public set ShowInExcel(value: boolean) {
            if (!this.IsKey && !this.showInExcel !== !value) {
                this.showInExcel = value;
                this.dataFeed.notifyUpdateLater();
            }
        }
    }

    export class DataFeed extends Model.DataItem {
        private static activeDataFeed: DataFeed;

        private name: string;
        private oDataColumnNames: string[];
        private columns: DataFeedColumn[];
        private types: string[];
        private key: string;
        private entityType: string;

        private active: boolean;
        private lastSyncTime: Date;
        private recordPairManager: Model.DataManager;
        private allRecordPairs: Object;

        constructor(name: string, columnNames: string[], types: string[], key: string, entityType) {
            super();
            this.name = name;
            this.oDataColumnNames = columnNames;
            this.columns = columnNames.map(columnName => new DataFeedColumn(this, columnName));
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

        public static get ActiveDataFeed(): DataFeed {
            return DataFeed.activeDataFeed;
        }

        public static initializeAll(onReady: () => void) {
            PageMethods.GetTables(function (tables) {
                for (var i = 0; i < tables.length; i++) {
                    var item = new DataFeed(
                        tables[i].tableName,
                        tables[i].headers,
                        tables[i].types,
                        tables[i].key,
                        tables[i].entityTypeName);

                    dataFeedManager.addData(item);
                }

                onReady();
            });
        
        }

        public get Name() {
            return this.name;
        }

        public get Columns(): DataFeedColumn[] {
            return this.columns;
        }

        public set Columns(value: DataFeedColumn[]) {
            if (this.columns !== value) {
                this.columns = value;
                this.notifyUpdateLater();
            }
        }

        public get Headers(): string[] {
            return this.columns.filter(header => header.ShowInExcel).map(header => header.Name);
        }

        public get Key() {
            return this.key;
        }

        public get EntityType() {
            return this.entityType;
        }

        public get LastSyncTime(): Date {
            return this.lastSyncTime;
        }

        public set LastSyncTime(value: Date) {
            if (this.lastSyncTime !== value) {
                this.lastSyncTime = value;
                this.notifyUpdateLater();
            }
        }

        public get Active(): boolean {
            return this.active;
        }

        public importToExcelAsync(callback?: () => void) {
            this.readExcelHeader(() => {
                this.readODataDataFromServer(
                    (oDataData: string[][]) => {
                        var excelHeaders = this.Headers;
                        var indexMap = this.oDataColumnNames.map(columnName => excelHeaders.indexOf(columnName));
                        var excelData = oDataData.map(
                            oDataRowData => {
                                var excelRowData = [];
                                oDataRowData.forEach((value: string, index: number) => {
                                    if (indexMap[index] >= 0) {
                                        excelRowData[indexMap[index]] = value;
                                    }
                                });

                                return excelRowData;
                            });

                        ODSampleData.DataHelper.UpdateDataToExcel(this.Headers, excelData, this.name, callback);
                    },
                    error => ODSampleData.showNotification("Failed to get OData data.", error.toString()));
            });
        }

        public readExcelData(success?: (data: string[][]) => void, fail?: (error) => void) {
            this.readExcelHeader(() => {
                ODSampleData.DataHelper.ReadDataFromExcel(
                    this.name,
                    (excelData) => {
                        this.setExcelData(excelData);
                        if (success) {
                            success(excelData);
                        }
                    });
            });
        }

        public readExcelHeader(success?: () => void, fail?: (error) => void) {
            ODSampleData.DataHelper.TryReadHeaderFromExcel(
                this.name,
                excelHeaders => {
                    if (!excelHeaders || this.setHeaders(excelHeaders, true)) {
                        if (success) {
                            success();
                        }
                    } else {
                        if (fail) {
                            fail("Headers has been changed by user.");
                        }
                    }
                });
        }

        public readODataDataFromServer(success?: (data: string[][]) => void, fail?: (error) => void) {
            ODSampleData.DataHelper.ReadDataFromOData(
                this.name,
                "",
                oDataData => {
                    this.setOData(oDataData);
                    if (success) {
                        success(oDataData);
                    }
                },
                fail);
        }

        public setExcelData(excelData: string[][]) {
            this.getAllRecordPairs().forEach((recordPair: RecordPair) => {
                recordPair.RowIdInExcel = Number.MAX_VALUE;
                recordPair.ExcelRowData = undefined;
            });

            excelData.forEach((row: string[], rowIndex: number) => {
                var excelRowData = new RecordItem();
                this.Headers.forEach((key: string, indexInRow: number) => {
                    excelRowData[key] = row[indexInRow];
                });

                var recordPair = this.getOrCreateRecordPairById(excelRowData[this.key]);
                recordPair.ExcelRowData = excelRowData;
                recordPair.RowIdInExcel = rowIndex;
                recordPair.DiffStatus = DiffStatus.WaitingForCompare;
            });
        }

        public setOData(oDataData: string[][]) {
            this.getAllRecordPairs().forEach((recordPair: RecordPair) => {
                recordPair.ODataRowData = undefined;
            });

            oDataData.forEach((row: string[]) => {
                var oDataRowData = new RecordItem();
                this.oDataColumnNames.forEach((key: string, index: number) => {
                    oDataRowData[key] = row[index];
                });

                var recordPair = this.getOrCreateRecordPairById(oDataRowData[this.key]);
                recordPair.ODataRowData = oDataRowData;
                recordPair.DiffStatus = DiffStatus.WaitingForCompare;
            });

            this.LastSyncTime = new Date();
        }

        public addRecordPairObserver(observer: Model.IObserver) {
            return this.recordPairManager.addObserver(observer);
        }

        public removeRecordPairObserver(observer: Model.IObserver) {
            return this.recordPairManager.removeObserver(observer);
        }

        public getOrCreateRecordPairById(id: any): RecordPair {
            if (!this.allRecordPairs[id]) {
                var newPair = new RecordPair(this, id);

                this.allRecordPairs[id] = newPair;
                this.recordPairManager.addData(newPair);
            }

            return this.allRecordPairs[id];
        }

        public getAllRecordPairs(): RecordPair[] {
            return <RecordPair[]>this.recordPairManager.getAllData();
        }

        public removeRecordPair(recordPair: RecordPair) {
            if (this.allRecordPairs[recordPair.Id] === recordPair) {
                this.recordPairManager.removeData(recordPair);
                delete this.allRecordPairs[recordPair.Id];
            }
        }

        public markAsActive() {
            if (DataFeed.activeDataFeed === this) {
                return;
            }

            if (DataFeed.activeDataFeed) {
                DataFeed.activeDataFeed.markAsUnactive();
            }

            DataFeed.activeDataFeed = this;
            this.active = true;
            this.notifyUpdateLater();
        }

        public markAsUnactive() {
            if (DataFeed.activeDataFeed !== this) {
                return;
            }

            DataFeed.activeDataFeed = undefined;
            this.active = false;
            this.notifyUpdateLater();
        }

        public GetFormat() {
            var unremovedFormats = [];

            DataFeed.ActiveDataFeed.getAllRecordPairs()
                .filter(record => {
                return record.RowIdInExcel !== Number.MAX_VALUE && record.Format !== undefined;
            }).forEach(record => {
                unremovedFormats = unremovedFormats.concat(record.Format);
            });

            // sort the format array to make sure
            // the cell format is after the row format
            unremovedFormats = unremovedFormats.sort((a, b) => {
                if (a["cells"]["column"] !== undefined && a["cells"]["row"] !== undefined && b["cells"]["column"] !== undefined && b["cells"]["row"] !== undefined) {
                    return 0;
                } else if (a["cells"]["column"] !== undefined && a["cells"]["row"] !== undefined) {
                    return 1
                } else if (b["cells"]["column"] !== undefined && b["cells"]["row"] !== undefined) {
                    return -1;
                }
            });

            return unremovedFormats
        }

        private setHeaders(headers: string[], sortHeaders: boolean) {
            if (headers.indexOf(this.Key) < 0 || headers.some(header => this.oDataColumnNames.indexOf(header) < 0)) {
                return false;
            }

            this.columns.forEach(column => {
                column.ShowInExcel = headers.indexOf(column.Name) >= 0;
            });

            if (sortHeaders) {
                this.columns.sort((a, b) => {
                    if (a.ShowInExcel !== b.ShowInExcel) {
                        return a.ShowInExcel ? -1 : 1;
                    } else {
                        return headers.indexOf(a.Name) - headers.indexOf(b.Name);
                    }
                });
            }

            return true;
        }

    }
}
