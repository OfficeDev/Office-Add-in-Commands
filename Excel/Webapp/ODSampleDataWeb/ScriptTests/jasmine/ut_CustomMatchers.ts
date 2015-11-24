
describe("CustomMatchers", function () {
    describe("toMatchResultIfCall", function () {
        it("verifies the return value of the function with passing the actual value.", function () {
            expect(1).toMatchResultForCall(2, (n: number) => { return 2 * n; });
        });
    });

    describe("toPass", function () {
        var objectA = { name: "objectA" };
        var objectB = { name: "objectB" };
        function isObjectA(anObject: Object) {
            return anObject === objectA;
        }

        it("verifies whether the return value is true while calling the function with the actual value.", function () {
            expect(objectA).toPass(isObjectA);
            expect(objectB).not.toPass(isObjectA);
        });
    });

    describe("toHaveTheSameSetOf", function () {
        it("verifies whether the actual array and the expect array have the same set of objects.", function () {
            expect([]).toHaveTheSameSetOf([]);
            expect([1, "1"]).toHaveTheSameSetOf(["1", 1]);
            expect([1, "1", "1"]).toHaveTheSameSetOf(["1", 1, "1"]);
            expect([1, "2", 3, "4", 5]).toHaveTheSameSetOf([3, 5, "2", 1, "4"]);

            var obj = {};
            expect([2, "1", obj]).toHaveTheSameSetOf(["1", obj, 2]);

            expect([]).not.toHaveTheSameSetOf([1]);
            expect(["1"]).not.toHaveTheSameSetOf([]);
            expect(["1"]).not.toHaveTheSameSetOf([1]);
            expect([1, "1", "1"]).not.toHaveTheSameSetOf([1, 1, "1"]);
        });
    });
});
