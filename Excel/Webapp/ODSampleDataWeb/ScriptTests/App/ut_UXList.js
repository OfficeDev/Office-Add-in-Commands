var UT;
(function (UT) {
    describe("UX", function () {
        describe("List", function () {
            var dataManager;
            var data1;
            var data2;
            var artist;
            var listFor1;
            function compare(a, b) {
                return a.value - b.value;
            }
            ;
            function filterFor1(data) {
                return data && 1 === (data.value & 1);
            }
            beforeEach(function () {
                dataManager = new Model.DataManager();
                data1 = new UT.Helpers.Data(1);
                data2 = new UT.Helpers.Data(2);
                dataManager.addData(data1);
                dataManager.addData(data2);
                artist = { newJQuery: function () { return $("<div/>"); } };
                spyOn(artist, "newJQuery").and.callThrough();
                jasmine.clock().install();
                listFor1 = new UX.List(artist, $("<div/>"), compare);
                dataManager.addObserver(listFor1);
                listFor1.setFilter(filterFor1);
                dataManager.updateObserver(listFor1);
            });
            it("calls the artist to new an element for observed data", function () {
                expect(artist.newJQuery).toHaveBeenCalledWith(data1);
                expect(artist.newJQuery).not.toHaveBeenCalledWith(data2);
            });
            it("calls the artist to new an element for new observed data", function () {
                data2.value = 1;
                data2.notifyUpdateImmediately();
                expect(artist.newJQuery).toHaveBeenCalledWith(data2);
            });
            it("adds element for addition", function () {
                expect(listFor1.getDataObjects()).toHaveTheSameSetOf([data1]);
                data2.value = 1;
                data2.notifyUpdateImmediately();
                expect(listFor1.getDataObjects()).toHaveTheSameSetOf([data1, data2]);
            });
            it("removes element for removement", function () {
                data1.value = 2;
                data1.notifyUpdateImmediately();
                expect(listFor1.getDataObjects()).toHaveTheSameSetOf([]);
            });
            it("sorts the elements with compare function after data updated", function () {
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
})(UT || (UT = {}));
//# sourceMappingURL=ut_UXList.js.map