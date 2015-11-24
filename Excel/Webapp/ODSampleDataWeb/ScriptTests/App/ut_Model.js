var UT;
(function (UT) {
    describe("Model", function () {
        var dataManager;
        var data1;
        var data2;
        var filterA;
        var filterB;
        beforeEach(function () {
            dataManager = new Model.DataManager();
            data1 = new UT.Helpers.StringData("A");
            data2 = new UT.Helpers.StringData("B");
            filterA = function (data) { return ("A" === data.value); };
            filterB = function (data) { return ("B" === data.value); };
        });
        describe("DataManager", function () {
            var dataSetForA;
            var dataSetForB;
            var observerForA;
            var observerForB;
            beforeEach(function () {
                observerForA = new UT.Helpers.Observer(filterA);
                observerForB = new UT.Helpers.Observer(filterB);
                spyOn(observerForA, "filter").and.callThrough();
                spyOn(observerForA, "onObserved");
                spyOn(observerForA, "onUpdated");
                spyOn(observerForA, "onUnobserved");
                spyOn(observerForA, "setDataItemSetObject").and.callFake(function (dataSet) {
                    dataSetForA = dataSet;
                });
                spyOn(observerForB, "filter").and.callThrough();
                spyOn(observerForB, "onObserved");
                spyOn(observerForB, "onUpdated");
                spyOn(observerForB, "onUnobserved");
                spyOn(observerForB, "setDataItemSetObject").and.callFake(function (dataSet) {
                    dataSetForB = dataSet;
                });
                dataManager.addData(data1);
                data1.flushNotification();
                dataManager.addObserver(observerForA);
                dataManager.addObserver(observerForB);
                dataManager.addData(data2);
                data2.flushNotification();
            });
            it("sets the data manager itself into the data item", function () {
                expect(data1.getDataManager()).toBe(dataManager);
                expect(data2.getDataManager()).toBe(dataManager);
                var newDataManager = new Model.DataManager();
                newDataManager.addData(data1);
                expect(data1.getDataManager()).toBe(newDataManager);
                expect(dataManager.getAllData()).not.toContain(data1);
            });
            it("supports to add data immediately", function () {
                expect(dataManager.getAllData()).toHaveTheSameSetOf([data1, data2]);
            });
            it("supports to remove data immediately", function () {
                dataManager.removeData(data1);
                expect(dataManager.getAllData()).toHaveTheSameSetOf([data2]);
            });
            it("calls the observer callbacks for add", function () {
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
            it("calls the observer callback for remove", function () {
                dataManager.removeData(data1);
                expect(observerForA.onUnobserved).toHaveBeenCalledWith(data1);
                expect(observerForB.onUnobserved).not.toHaveBeenCalled();
            });
            it("supports to remove data immediately", function () {
                dataManager.removeData(data1);
                expect(observerForA.onUnobserved).toHaveBeenCalledWith(data1);
                expect(dataManager.getAllData()).toHaveTheSameSetOf([data2]);
                expect(observerForA.onUnobserved).not.toHaveBeenCalledWith(data2);
            });
            it("likes a set: add data once if addData more times", function () {
                var originalData = dataManager.getAllData();
                var onObserved1 = observerForA.onObserved;
                expect(originalData).toContain(data1);
                expect(onObserved1.calls.count()).toBe(1);
                dataManager.addData(data1);
                expect(dataManager.getAllData()).toHaveTheSameSetOf(originalData);
                expect(onObserved1.calls.count()).toBe(1);
            });
            it("is able to make update notification", function () {
                data1.notifyUpdateImmediately();
                expect(observerForA.onUpdated).toHaveBeenCalledWith(data1);
                expect(observerForB.onUpdated).not.toHaveBeenCalled();
            });
            it("data updating causes observer onObserved and onUnobserved.", function () {
                data1.value = "B";
                data1.notifyUpdateImmediately();
                expect(observerForA.onUnobserved).toHaveBeenCalledWith(data1);
                expect(observerForB.onObserved).toHaveBeenCalledWith(data1);
                expect(observerForB.onUnobserved).not.toHaveBeenCalled();
            });
            it("sets the data set to the observer, if setDataItemSetObject has been implemented", function () {
                expect(dataSetForA.toArray()).toHaveTheSameSetOf([data1]);
                expect(dataSetForB.toArray()).toHaveTheSameSetOf([data2]);
                data2.value = "A";
                data2.notifyUpdateImmediately();
                expect(dataSetForA.toArray()).toHaveTheSameSetOf([data1, data2]);
                expect(dataSetForB.toArray()).toHaveTheSameSetOf([]);
            });
            it("calls unobserve for observer, while removing the data or the observer itself", function () {
                dataManager.removeData(data1);
                expect(observerForA.onUnobserved).toHaveBeenCalledWith(data1);
                dataManager.removeObserver(observerForB);
                expect(observerForB.onUnobserved).toHaveBeenCalledWith(data2);
            });
            it("supports 1 observer to be added into 2 data managers", function () {
                var anotherDataManager = new Model.DataManager();
                anotherDataManager.addObserver(observerForA);
                var anotherData = new UT.Helpers.StringData("A");
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
        describe("ItemCounter", function () {
            var callback;
            var count;
            var itemCounter;
            beforeEach(function () {
                callback = jasmine.createSpy("callbackA");
                callback.and.callFake(function (inCount) { return count = inCount; });
                itemCounter = new Model.ItemCounter(filterA, callback);
                dataManager.addObserver(itemCounter);
                dataManager.addData(data1);
                dataManager.addData(data2);
                data1.flushNotification();
                data2.flushNotification();
                data2.value = "A";
                data2.notifyUpdateImmediately();
            });
            it("calls the callback with 0 at the beginning", function () {
                expect(callback).toHaveBeenCalledWith(0);
            });
            it("calls the callback when new item added", function () {
                expect(count).toBe(2);
                expect(callback.calls.count()).toBe(3);
            });
            it("calls the callback when some item removed", function () {
                data1.value = "B";
                data1.notifyUpdateImmediately();
                expect(count).toBe(1);
                dataManager.removeData(data2);
                expect(count).toBe(0);
            });
            it("calls callback while it's getting removed from the DataManager", function () {
                dataManager.removeObserver(itemCounter);
                expect(count).toBe(0);
            });
        });
    });
})(UT || (UT = {}));
//# sourceMappingURL=ut_Model.js.map