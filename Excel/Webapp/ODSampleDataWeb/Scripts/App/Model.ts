
module Model {
    export class DataItem extends Utility.ObjectBase {
        private _dataManager: DataManager;
        private _notifier: Utility.CallLater;

        constructor() {
            super();
            this._notifier = new Utility.CallLater(() => {
                this.innerNotify();
            });
        }

        public setDataManager(newManager: DataManager) {
            var originalManager = this._dataManager;
            if (originalManager === newManager) {
                return;
            }

            this.flushNotification();
            this._dataManager = newManager;

            if (originalManager) {
                originalManager.removeData(this);
            }

            if (newManager) {
                newManager.addData(this);
            }
        }

        public getDataManager(): DataManager {
            return this._dataManager;
        }

        public notifyUpdateLater() {
            this._notifier.callOnceLater();
        }

        public flushNotification() {
            this._notifier.flush();
        }

        public notifyUpdateImmediately() {
            this._notifier.callImmediately();
        }

        public removeFromDataManager() {
            if (this._dataManager) {
                this.flushNotification();
                this._dataManager.removeData(this);
            }
        }

        private innerNotify() {
            if (this._dataManager) {
                this._dataManager.onDataUpdated(this);
            }
        }
    }

    export interface IObserver extends Utility.IObject {
        filter(data: DataItem): boolean;
        onObserved? (data: DataItem);
        onUpdated? (data: DataItem);
        onUnobserved? (data: DataItem);
        setDataItemSetObject? (dataItemSetObject: Utility.ObjectSet<DataItem>);
    }

    export class DataManager {
        private _dataSet: Utility.ObjectSet<DataItem>;
        private _observerMap: { [key: string]: ObserverHelper };

        constructor() {
            this._dataSet = new Utility.ObjectSet<DataItem>();
            this._observerMap = {};
        }

        public getAllData(): DataItem[] {
            return this._dataSet.toArray();
        }

        public addData(data: DataItem) {
            if (!this._dataSet.has(data)) {
                this._dataSet.add(data);
                data.setDataManager(this);
                data.notifyUpdateLater();
            }
        }

        public removeData(data: DataItem) {
            if (this._dataSet.has(data)) {
                this._dataSet.remove(data);

                this.forEachObserverHelper((helper: ObserverHelper) => {
                    helper.unobserve(data);
                });
            }
        }

        public onDataUpdated(data: DataItem) {
            if (this._dataSet.has(data)) {
                this.forEachObserverHelper((helper: ObserverHelper) => {
                    helper.onUpdated(data);
                });
            }
        }

        public addObserver(observer: IObserver) {
            if (!observer) {
                return;
            }

            var observerId = observer._getId();
            if (!this._observerMap[observerId]) {
                var helper = new ObserverHelper(observer);
                this._observerMap[observerId] = helper;

                this._dataSet.forEach((data: DataItem) => {
                    helper.observeIfAccepted(data);
                });
            }
        }

        public updateObserver(observer: IObserver) {
            if (!observer) {
                return;
            }

            var observerId = observer._getId();
            var helper = this._observerMap[observerId];
            if (helper) {
                this._dataSet.forEach((data: DataItem) => {
                    helper.onUpdated(data);
                });
            }
        }

        public removeObserver(observer: IObserver) {
            if (!observer) {
                return;
            }

            var observerId = observer._getId();
            var helper = this._observerMap[observerId];
            if (helper) {
                delete this._observerMap[observerId];
                helper.unobserveAll();
            }
        }

        private forEachObserverHelper(callback: (helper: ObserverHelper) => void) {
            Utility.MapEx.forEach(this._observerMap, callback);
        }
    }

    class ObserverHelper extends Utility.ObjectBase {
        private observer: IObserver;
        private observedData: Utility.ObjectSet<DataItem>;

        constructor(observer: IObserver) {
            super();
            this.observer = observer;
            this.observedData = new Utility.ObjectSet<DataItem>();

            if (observer.setDataItemSetObject) {
                observer.setDataItemSetObject(this.observedData);
            }
        }

        public observeIfAccepted(data: DataItem) {
            if (data && !this.observedData.has(data) && this.observer.filter(data)) {
                this.innerObserve(data);
            }
        }

        public unobserve(data: DataItem) {
            if (this.observedData.has(data)) {
                this.innerUnobserve(data);
            }
        }

        public unobserveAll() {
            this.observedData.forEach((data: DataItem) => {
                this.innerUnobserve(data);
            });
        }

        public onUpdated(data: DataItem) {
            var hasBeenObserved = this.observedData.has(data);
            var needsToBeObserved = this.observer.filter(data);

            if (hasBeenObserved === needsToBeObserved) {
                if (hasBeenObserved && this.observer.onUpdated) {
                    this.observer.onUpdated(data);
                }
            } else if (needsToBeObserved) {
                this.innerObserve(data);
            } else {
                this.innerUnobserve(data);
            }
        }

        private innerObserve(data: DataItem) {
            this.observedData.add(data);
            if (this.observer.onObserved) {
                this.observer.onObserved(data);
            }
        }

        private innerUnobserve(data: DataItem) {
            this.observedData.remove(data);
            if (this.observer.onUnobserved) {
                this.observer.onUnobserved(data);
            }
        }
    }

    export class ItemCounter extends Utility.ObjectBase implements IObserver {
        private innerFilter: (data: DataItem) => boolean;
        private callback: (count: number) => void;
        private dataItemSet: Utility.ObjectSet<DataItem>;
        private getCount: () => number;

        constructor(filter: (data: DataItem) => boolean, callback: (count: number) => void) {
            super();

            this.innerFilter = filter;
            this.callback = callback;
            this.callback(0);
        }

        public filter(data: DataItem): boolean {
            return this.innerFilter(data);
        }

        public onObserved(data: DataItem) {
            this.callback(this.dataItemSet.Count);
        }

        public onUnobserved(data: DataItem) {
            this.callback(this.dataItemSet.Count);
        }

        public setDataItemSetObject(dataItemSetObject: Utility.ObjectSet<DataItem>) {
            this.dataItemSet = dataItemSetObject;
        }
    }

    export class OnNewOrChanged extends Utility.ObjectBase implements IObserver {
        constructor(public filter: (data: DataItem) => boolean, private callback: (data: DataItem) => void) {
            super();
        }

        public onObserved(data: DataItem) {
            this.callback(data);
        }

        public onUpdated(data: DataItem) {
            this.callback(data);
        }
    }

    export class OnChanged extends Utility.ObjectBase implements IObserver {
        constructor(public filter: (data: DataItem) => boolean, private callback: (data: DataItem) => void) {
            super();
        }

        public onUpdated(data: DataItem) {
            this.callback(data);
        }
    }
}
