var ODSampleData;
(function (ODSampleData) {
    function uploadChangeToOData(callback) {
        var dataFeed = ODSampleData.DataFeed.ActiveDataFeed;
        ODSampleData.DataHelper.UpdateDataToOData(dataFeed
            .getAllRecordPairs()
            .filter(needsToBeUploaded)
            .map(function (recordPair) { return new ODSampleData.DataHelper.Change(isDeletingOpration(recordPair) ? "DELETE" : "UPDATE", recordPair.Id, getRecordResolvedData(recordPair)); }), dataFeed.Name, dataFeed.Headers, callback);
    }
    ODSampleData.uploadChangeToOData = uploadChangeToOData;
    function needsToBeUploaded(recordPair) {
        if (recordPair.ODataRowData) {
            switch (recordPair.ResolveStatus) {
                case ODSampleData.RecordResolveStatus.Mixed:
                case ODSampleData.RecordResolveStatus.Excel:
                    return true;
            }
        }
        return false;
    }
    function isDeletingOpration(recordPair) {
        return recordPair.ResolveStatus === ODSampleData.RecordResolveStatus.Excel && !recordPair.ExcelRowData;
    }
    function getRecordResolvedData(recordPair) {
        if (isDeletingOpration(recordPair)) {
            return [];
        }
        return recordPair.DataFeed.Headers.map(function (columnName) {
            var cellDiffInfo = recordPair.getCellDiffInfo(columnName);
            if (cellDiffInfo) {
                return cellDiffInfo.UsingODataValue ? cellDiffInfo.ODataValue : cellDiffInfo.ExcelValueSnapshot;
            }
            return recordPair.ODataRowData[columnName];
        });
    }
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=Uploader.js.map