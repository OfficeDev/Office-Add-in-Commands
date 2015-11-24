
module UT {
    describe("UX", () => {
        describe("List", () => {
            var dataManager: Model.DataManager;
            var data1: Helpers.NumberData;
            var data2: Helpers.NumberData;

            var artist: UX.IListItemArtist<Helpers.NumberData>;
            var listFor1: UX.List<Helpers.NumberData>;

            function compare(a: Helpers.NumberData, b: Helpers.NumberData) {
                return a.value - b.value;
            };

            function filterFor1(data: Helpers.NumberData) {
                return data && 1 === (data.value & 1);
            }

            beforeEach(() => {
                dataManager = new Model.DataManager();
                data1 = new Helpers.Data(1);
                data2 = new Helpers.Data(2);
                dataManager.addData(data1);
                dataManager.addData(data2);

                artist = { newJQuery: () => $("<div/>") };

                spyOn(artist, "newJQuery").and.callThrough();
                jasmine.clock().install();

                listFor1 = new UX.List(artist, $("<div/>"), compare);
                dataManager.addObserver(listFor1);
                listFor1.setFilter(filterFor1);
                dataManager.updateObserver(listFor1);
            });

            it("calls the artist to new an element for observed data", () => {
                expect(artist.newJQuery).toHaveBeenCalledWith(data1);
                expect(artist.newJQuery).not.toHaveBeenCalledWith(data2);
            });

            it("calls the artist to new an element for new observed data", () => {
                data2.value = 1;
                data2.notifyUpdateImmediately();
                expect(artist.newJQuery).toHaveBeenCalledWith(data2);
            });

            it("adds element for addition", () => {
                expect(listFor1.getDataObjects()).toHaveTheSameSetOf([data1]);

                data2.value = 1;
                data2.notifyUpdateImmediately();
                expect(listFor1.getDataObjects()).toHaveTheSameSetOf([data1, data2]);
            });

            it("removes element for removement", () => {
                data1.value = 2;
                data1.notifyUpdateImmediately();
                expect(listFor1.getDataObjects()).toHaveTheSameSetOf([]);
            });

            it("sorts the elements with compare function after data updated", () => {
                data1.value = 3;
                data1.notifyUpdateImmediately();
                expect(listFor1.getDataObjects()).toEqual([data1]);

                data2.value = 3;
                data2.notifyUpdateImmediately();
                jasmine.clock().tick(5);
                expect(listFor1.getDataObjects()).toEqual([data1, data2]);

                data1.value = 5;
                data1.notifyUpdateImmediately();
                jasmine.clock().tick(5);
                expect(listFor1.getDataObjects()).toEqual([data2, data1]);
            });
        });
    });
}
