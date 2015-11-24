
module UT {
    describe("Model", () => {
        var dataManager: Model.DataManager;
        var data1: Helpers.StringData;
        var data2: Helpers.StringData;
        var filterA: (data: Helpers.StringData) => boolean;
        var filterB: (data: Helpers.StringData) => boolean;

        beforeEach(() => {
            dataManager = new Model.DataManager();
            data1 = new Helpers.StringData("A");
            data2 = new Helpers.StringData("B");
            filterA = (data: Helpers.StringData) => ("A" === data.value);
            filterB = (data: Helpers.StringData) => ("B" === data.value);
        });

        describe("DataManager", () => {
            var dataSetForA: Utility.ObjectSet<Model.DataItem>;
            var dataSetForB: Utility.ObjectSet<Model.DataItem>;
            var observerForA: Model.IObserver;
            var observerForB: Model.IObserver;

            beforeEach(() => {
                observerForA = new Helpers.Observer(filterA);
                observerForB = new Helpers.Observer(filterB);

                spyOn(observerForA, "filter").and.callThrough();
                spyOn(observerForA, "onObserved");
                spyOn(observerForA, "onUpdated");
                spyOn(observerForA, "onUnobserved");
                spyOn(observerForA, "setDataItemSetObject").and.callFake(
                    (dataSet: Utility.ObjectSet<Model.DataItem>) => {
                        dataSetForA = dataSet;
                    });

                spyOn(observerForB, "filter").and.callThrough();
                spyOn(observerForB, "onObserved");
                spyOn(observerForB, "onUpdated");
                spyOn(observerForB, "onUnobserved");
                spyOn(observerForB, "setDataItemSetObject").and.callFake(
                    (dataSet: Utility.ObjectSet<Model.DataItem>) => {
                        dataSetForB = dataSet;
                    });

                dataManager.addData(data1);
                data1.flushNotification();
                dataManager.addObserver(observerForA);
                dataManager.addObserver(observerForB);
                dataManager.addData(data2);
                data2.flushNotification();
            });

            it("sets the data manager itself into the data item", () => {
                expect(data1.getDataManager()).toBe(dataManager);
                expect(data2.getDataManager()).toBe(dataManager);

                var newDataManager = new Model.DataManager();
                newDataManager.addData(data1);

                expect(data1.getDataManager()).toBe(newDataManager);
                expect(dataManager.getAllData()).not.toContain(data1);
            });

            it("supports to add data immediately", () => {
                expect(dataManager.getAllData()).toHaveTheSameSetOf([data1, data2]);
            });

            it("supports to remove data immediately", () => {
                dataManager.removeData(data1);
                expect(dataManager.getAllData()).toHaveTheSameSetOf([data2]);
            });

            it("calls the observer callbacks for add", () => {
                expect(observerForA.filter).toHaveBeenCalledWith(data1);
                expect(observerForA.onObserved).toHaveBeenCalledWith(data1);
                expect(observerForA.onUpdated).not.toHaveBeenCalledWith(data1);
                expect(observerForA.onUnobserved).not.toHaveBeenCalledWith(data1);

                expect(observerForA.filter).toHaveBeenCalledWith(data2);
                expect(observerForA.onObserved).not.toHaveBeenCalledWith(data2);
                expect(observerForA.onUpdated).not.toHaveBeenCalledWith(data2);
                expect(observerForA.onUnobserved).not.toHaveBeenCalledWith(data2);

                expect(observerForB.filter).toHaveBeenCalledWith(data1);
                expect(observerForB.onObserved).not.toHaveBeenCalledWith(data1);
                expect(observerForB.onUpdated).not.toHaveBeenCalledWith(data1);
                expect(observerForB.onUnobserved).not.toHaveBeenCalledWith(data1);

                expect(observerForB.filter).toHaveBeenCalledWith(data2);
                expect(observerForB.onObserved).toHaveBeenCalledWith(data2);
                expect(observerForB.onUpdated).not.toHaveBeenCalledWith(data2);
                expect(observerForB.onUnobserved).not.toHaveBeenCalledWith(data2);
            });

            it("calls the observer callback for remove", () => {
                dataManager.removeData(data1);

                expect(observerForA.onUnobserved).toHaveBeenCalledWith(data1);
                expect(observerForB.onUnobserved).not.toHaveBeenCalled();
            });

            it("supports to remove data immediately", () => {
                dataManager.removeData(data1);

                expect(observerForA.onUnobserved).toHaveBeenCalledWith(data1);

                expect(dataManager.getAllData()).toHaveTheSameSetOf([data2]);
                expect(observerForA.onUnobserved).not.toHaveBeenCalledWith(data2);
            });

            it("likes a set: add data once if addData more times", () => {
                var originalData = dataManager.getAllData();
                var onObserved1 = <jasmine.Spy>observerForA.onObserved;
                expect(originalData).toContain(data1);
                expect(onObserved1.calls.count()).toBe(1);

                dataManager.addData(data1);
                expect(dataManager.getAllData()).toHaveTheSameSetOf(originalData);
                expect(onObserved1.calls.count()).toBe(1);
            });

            it("is able to make update notification", () => {
                data1.notifyUpdateImmediately();

                expect(observerForA.onUpdated).toHaveBeenCalledWith(data1);
                expect(observerForB.onUpdated).not.toHaveBeenCalled();
            });

            it("data updating causes observer onObserved and onUnobserved.", () => {
                data1.value = "B";
                data1.notifyUpdateImmediately();

                expect(observerForA.onUnobserved).toHaveBeenCalledWith(data1);

                expect(observerForB.onObserved).toHaveBeenCalledWith(data1);
                expect(observerForB.onUnobserved).not.toHaveBeenCalled();
            });

            it("sets the data set to the observer, if setDataItemSetObject has been implemented", () => {
                expect(dataSetForA.toArray()).toHaveTheSameSetOf([data1]);
                expect(dataSetForB.toArray()).toHaveTheSameSetOf([data2]);

                data2.value = "A";
                data2.notifyUpdateImmediately();
                expect(dataSetForA.toArray()).toHaveTheSameSetOf([data1, data2]);
                expect(dataSetForB.toArray()).toHaveTheSameSetOf([]);
            });

            it("calls unobserve for observer, while removing the data or the observer itself", () => {
                dataManager.removeData(data1);
                expect(observerForA.onUnobserved).toHaveBeenCalledWith(data1);

                dataManager.removeObserver(observerForB);
                expect(observerForB.onUnobserved).toHaveBeenCalledWith(data2);
            });

            it("supports 1 observer to be added into 2 data managers",() => {
                var anotherDataManager = new Model.DataManager();
                anotherDataManager.addObserver(observerForA);

                var anotherData = new Helpers.StringData("A");
                anotherDataManager.addData(anotherData);
                anotherData.flushNotification();
                expect(observerForA.onObserved).toHaveBeenCalledWith(anotherData);

                expect(observerForA.onObserved).not.toHaveBeenCalledWith(data2);
                data2.value = "A";
                data2.notifyUpdateImmediately();
                expect(observerForA.onObserved).toHaveBeenCalledWith(data2);

                expect(observerForA.onUpdated).not.toHaveBeenCalledWith(data1);
                data1.notifyUpdateImmediately();
                expect(observerForA.onUpdated).toHaveBeenCalledWith(data1);

                expect(observerForA.onUpdated).not.toHaveBeenCalledWith(anotherData);
                anotherData.notifyUpdateImmediately();
                expect(observerForA.onUpdated).toHaveBeenCalledWith(anotherData);

                expect(observerForA.onUnobserved).not.toHaveBeenCalledWith(data1);
                data1.value = "B";
                data1.notifyUpdateImmediately();
                expect(observerForA.onUnobserved).toHaveBeenCalledWith(data1);

                expect(observerForA.onUnobserved).not.toHaveBeenCalledWith(anotherData);
                anotherData.value = "B";
                anotherData.notifyUpdateImmediately();
                expect(observerForA.onUnobserved).toHaveBeenCalledWith(anotherData);
            });
        });

        describe("ItemCounter", () => {
            var callback: jasmine.Spy;
            var count: number;
            var itemCounter: Model.ItemCounter;

            beforeEach(() => {
                callback = jasmine.createSpy("callbackA");
                callback.and.callFake((inCount: number) => count = inCount);
                itemCounter = new Model.ItemCounter(filterA, callback);

                dataManager.addObserver(itemCounter);
                dataManager.addData(data1);
                dataManager.addData(data2);
                data1.flushNotification();
                data2.flushNotification();

                data2.value = "A";
                data2.notifyUpdateImmediately();
            });

            it("calls the callback with 0 at the beginning", () => {
                expect(callback).toHaveBeenCalledWith(0);
            });

            it("calls the callback when new item added", () => {
                expect(count).toBe(2);
                expect(callback.calls.count()).toBe(3);
            });

            it("calls the callback when some item removed", () => {
                data1.value = "B";
                data1.notifyUpdateImmediately();
                expect(count).toBe(1);

                dataManager.removeData(data2);
                expect(count).toBe(0);
            });

            it("calls callback while it's getting removed from the DataManager", () => {
                dataManager.removeObserver(itemCounter);
                expect(count).toBe(0);
            });
        });
    });
}
