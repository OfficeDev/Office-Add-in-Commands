declare module ODSampleData {
    class Configuration {
        UseBulgingList: boolean;
        DataFeedDefaultHeaders: {
            [dataFeedName: string]: string[];
        };
    }
}
