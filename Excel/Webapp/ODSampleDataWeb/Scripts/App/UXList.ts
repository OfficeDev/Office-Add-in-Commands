
module UX {
    export interface IListItemArtist<T extends Model.DataItem> {
        newJQuery(data: T): JQuery;
        refresh? (jqElement: JQuery, data: T);
    }

    class ListItem<T extends Model.DataItem> {
        private data: T;
        private itemArtist: IListItemArtist<T>;
        private jqElement: JQuery;

        constructor(data: T, itemArtist: IListItemArtist<T>) {
            this.data = data;
            this.itemArtist = itemArtist;
            this.jqElement = itemArtist.newJQuery(data);
            this.jqElement.attr("ObjectId", data._getId());
        }

        public static getObjectFromJQueryElement(jqElement: JQuery): string {
            return jqElement.attr("ObjectId");
        }

        public get DataObject(): T {
            return this.data;
        }

        public get JQElement(): JQuery {
            return this.jqElement;
        }

        public refresh() {
            if (this.itemArtist.refresh) {
                this.itemArtist.refresh(this.jqElement, this.data);
            }
        }

        public remove() {
            this.jqElement.remove();
        }
    }

    export class List<T extends Model.DataItem> extends Utility.ObjectBase implements Model.IObserver {
        private innerFilter: (data: T) => boolean;
        private jqElement: JQuery;
        private listItemArtist: IListItemArtist<T>;
        private comparer: (a: T, b: Utility.ObjectBase) => number;
        private items: Utility.StringMap<ListItem<T>>;
        private sortLater: Utility.CallLater;
        private dataObjects: T[];

        constructor(
            listItemArtist: IListItemArtist<T>,
            jqElement?: JQuery,
            comparer?: (a: T, b: T) => number) {
            super();

            this.innerFilter = () => false;
            this.listItemArtist = listItemArtist;
            this.comparer = comparer;

            this.jqElement = jqElement || $("<div/>");
            this.items = new Utility.StringMap<ListItem<T>>();
            this.sortLater = new Utility.CallLater(() => {
                this.sortElements();
            });
            this.dataObjects = [];
        }

        public get JQElement(): JQuery {
            return this.jqElement;
        }

        public getFilter() {
            return this.innerFilter;
        }

        public setFilter(value: (data: T) => boolean) {
            if (this.innerFilter !== value) {
                this.innerFilter = value;
            }
        }

        public filter(data: T): boolean {
            return this.innerFilter(data);
        }

        public onObserved(data: T) {
            if (data) {
                var newItem = new ListItem(data, this.listItemArtist);

                this.jqElement.append(newItem.JQElement);
                this.items[data._getId()] = newItem;
                this.dataObjects.push(data);

                this.sortLater.callOnceLater();
            }
        }

        public onUnobserved(data: T) {
            if (data) {
                var dataId = data._getId();
                var subElementToRemove: ListItem<T> = this.getItemByDataId(dataId);
                if (subElementToRemove) {
                    delete this.items[dataId];
                    subElementToRemove.remove();
                }
                var index = this.dataObjects.indexOf(data);
                if (index >= 0) {
                    this.dataObjects.splice(this.dataObjects.indexOf(data), 1);
                }
            }
        }

        public onUpdated(data: T) {
            if (data) {
                var item = this.getItemByDataId(data._getId());
                if (item) {
                    item.refresh();
                    this.sortLater.callOnceLater();
                }
            }
        }

        public remove() {
            this.sortLater.clear();
            for (var i in this.items) {
                this.items[i].remove();
                delete this.items[i];
            }

            this.jqElement.remove();
        }

        public getDataObjects(): T[] {
            return this.dataObjects;
        }

        public sortElementsImmediately() {
            this.sortLater.callImmediately();
        }

        public getElementByData(data: T): JQuery {
            if (!data) {
                return undefined;
            }

            var item = this.getItemByDataId(data._getId());
            if (!item) {
                return undefined;
            }

            return item.JQElement;
        }

        protected virtual_onItemsSorted() {
        }

        private getItemByDataId(dataId: string): ListItem<T> {
            return this.items[dataId];
        }

        private sortElements() {
            if (this.comparer) {
                var unsortedDataObjects = this.dataObjects.concat();
                this.dataObjects.sort(this.comparer);
                if (this.dataObjects.some((value, index) => unsortedDataObjects[index] !== value)) {
                    this.dataObjects.forEach((data: T) => {
                        var jqItemElement = this.getItemByDataId(data._getId()).JQElement;
                        jqItemElement.appendTo(this.jqElement);
                    });

                    this.virtual_onItemsSorted();
                }
            }
        }
    }
}