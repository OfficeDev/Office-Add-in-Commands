module ODSampleData {
    export function uploadChangeToOData(callback: () => void) {
        var dataFeed = DataFeed.ActiveDataFeed;

        ODSampleData.DataHelper.UpdateDataToOData(
            dataFeed
                .getAllRecordPairs()
                .filter(needsToBeUploaded)
                .map(recordPair => new ODSampleData.DataHelper.Change(
                    isDeletingOpration(recordPair) ? "DELETE" : "UPDATE",
                    recordPair.Id,
                    getRecordResolvedData(recordPair))),
            dataFeed.Name,
            dataFeed.Headers,
            callback);
    }

    function needsToBeUploaded(recordPair: RecordPair): boolean {
        if (recordPair.ODataRowData) {
            switch (recordPair.ResolveStatus) {
                case RecordResolveStatus.Mixed:
                case RecordResolveStatus.Excel:
                    return true;
            }
        }

        return false;
    }

    function isDeletingOpration(recordPair: RecordPair): boolean {
        return recordPair.ResolveStatus === RecordResolveStatus.Excel && !recordPair.ExcelRowData;
    }

    function getRecordResolvedData(recordPair: RecordPair): string[] {
        if (isDeletingOpration(recordPair)) {
            return [];
        }

        return recordPair.DataFeed.Headers.map(columnName => {
            var cellDiffInfo = recordPair.getCellDiffInfo(columnName);

            if (cellDiffInfo) {
                return cellDiffInfo.UsingODataValue ? cellDiffInfo.ODataValue : cellDiffInfo.ExcelValueSnapshot;
            }

            return recordPair.ODataRowData[columnName];
        });
    }
}
