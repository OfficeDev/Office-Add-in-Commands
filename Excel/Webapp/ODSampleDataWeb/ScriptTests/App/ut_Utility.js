var UT;
(function (UT) {
    describe("Utility", function () {
        describe("Guid", function () {
            it("isValidGuid", function () {
                var testCases = [
                    { expected: false, guid: undefined },
                    { expected: false, guid: null },
                    { expected: false, guid: "" },
                    { expected: false, guid: 0 },
                    { expected: false, guid: "0" },
                    { expected: false, guid: "12345" },
                    { expected: false, guid: "GUID" },
                    { expected: false, guid: "Guid" },
                    { expected: false, guid: "guid" },
                    { expected: true, guid: "00000000-0000-0000-0000-000000000000" },
                    { expected: true, guid: "01234567-89ab-cdef-ABCD-EF0000000000" },
                    { expected: false, guid: "g0000000-0000-0000-0000-000000000000" },
                    { expected: false, guid: "G0000000-0000-0000-0000-000000000000" },
                    { expected: false, guid: "0000000-0000-0000-0000-000000000000" },
                    { expected: false, guid: "00000000-000-0000-0000-000000000000" },
                    { expected: false, guid: "00000000-0000-000-0000-000000000000" },
                    { expected: false, guid: "00000000-0000-0000-000-000000000000" },
                    { expected: false, guid: "00000000-0000-0000-0000-00000000000" },
                    { expected: false, guid: "000000000-0000-0000-0000-000000000000" },
                    { expected: false, guid: "00000000-00000-0000-0000-000000000000" },
                    { expected: false, guid: "00000000-0000-00000-0000-000000000000" },
                    { expected: false, guid: "00000000-0000-0000-00000-000000000000" },
                    { expected: false, guid: "00000000-0000-0000-0000-0000000000000" }
                ];
                testCases.forEach(function (testCase) {
                    expect(testCase.guid).toMatchResultForCall(testCase.expected, Utility.Guid.isValidGuid);
                });
            });
            describe("newGuid", function () {
                it("the result should be valid Guid", function () {
                    for (var i = 0; i < 1000; ++i) {
                        var newGuid = Utility.Guid.newGuid();
                        expect(newGuid).toPass(Utility.Guid.isValidGuid);
                    }
                });
                it("the result should not be the same", function () {
                    var modelGuid = Utility.Guid.newGuid();
                    for (var i = 0; i < 1000; ++i) {
                        expect(Utility.Guid.newGuid()).not.toBe(modelGuid);
                    }
                });
            });
        });
        describe("ObjectBase", function () {
            it("has id", function () {
                var obj1 = new Utility.ObjectBase();
                var obj2 = new Utility.ObjectBase();
                expect(obj1._getId()).not.toBe(obj2._getId());
            });
        });
        describe("ObjectSet", function () {
            var obj1;
            var obj2;
            var obj3;
            var theSet;
            beforeEach(function () {
                obj1 = new Utility.ObjectBase();
                obj2 = new Utility.ObjectBase();
                obj3 = new Utility.ObjectBase();
                theSet = new Utility.ObjectSet();
            });
            it("supports to add and remove object", function () {
                expect(theSet.toArray()).toEqual([]);
                theSet.add(obj1);
                expect(theSet.toArray()).toHaveTheSameSetOf([obj1]);
                theSet.add(obj1);
                expect(theSet.toArray()).toHaveTheSameSetOf([obj1]);
                theSet.add(obj2);
                expect(theSet.toArray()).toHaveTheSameSetOf([obj1, obj2]);
                theSet.remove(obj3);
                expect(theSet.toArray()).toHaveTheSameSetOf([obj1, obj2]);
                theSet.remove(obj1);
                expect(theSet.toArray()).toHaveTheSameSetOf([obj2]);
                theSet.remove(obj2);
                expect(theSet.toArray()).toHaveTheSameSetOf([]);
            });
            it("supports 'has'", function () {
                function isInTheSet(obj) {
                    return theSet.has(obj);
                }
                expect(obj1).not.toPass(isInTheSet);
                theSet.add(obj1);
                expect(obj1).toPass(isInTheSet);
                expect(obj2).not.toPass(isInTheSet);
                expect(obj3).not.toPass(isInTheSet);
            });
        });
        describe("CallAfterReady", function () {
            var doer;
            var spy1;
            var spy2;
            var spy3;
            beforeEach(function () {
                doer = new Utility.CallAfterReady();
                spy1 = jasmine.createSpy("spy1");
                spy2 = jasmine.createSpy("spy2");
                spy3 = jasmine.createSpy("spy3");
                doer.call(spy1);
                doer.call(spy2);
                doer.call(spy2);
            });
            it("doesn't call any callback before notification", function () {
                expect(spy1).not.toHaveBeenCalled();
                expect(spy2).not.toHaveBeenCalled();
                expect(spy3).not.toHaveBeenCalled();
            });
            it("calls all callbacks while notification is arrving", function () {
                doer.markAsReady();
                expect(spy1).toHaveBeenCalled();
                expect(spy2).toHaveBeenCalled();
                expect(2).toEqual(spy2.calls.count());
            });
            it("calls the callback immediately after the notification", function () {
                doer.markAsReady();
                expect(spy3).not.toHaveBeenCalled();
                doer.call(spy3);
                expect(spy3).toHaveBeenCalled();
            });
        });
    });
})(UT || (UT = {}));
//# sourceMappingURL=ut_Utility.js.map