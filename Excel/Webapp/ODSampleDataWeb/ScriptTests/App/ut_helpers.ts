
module UT.Helpers {
    export class Observer extends Utility.ObjectBase implements Model.IObserver {
        private innerFilter: (data: Model.DataItem) => boolean;

        constructor(filter: (data: Model.DataItem) => boolean) {
            super();
            this.innerFilter = filter;
        }

        public filter(data: Model.DataItem) {
            return this.innerFilter(data);
        }

        public onObserved(data: Model.DataItem) { }
        public onUpdated(data: Model.DataItem) { }
        public onUnobserved(data: Model.DataItem) { }
        public setDataItemSetObject(dataItemSetObject: Utility.ObjectSet<Model.DataItem>) { }
    }

    export class Data<BaseType> extends Model.DataItem {
        public value: BaseType;
        constructor(value: BaseType) {
            super();
            this.value = value;
        }
    }

    export class NumberData extends Data<number> {
    };

    export class StringData extends Data<string> {
    };
}
