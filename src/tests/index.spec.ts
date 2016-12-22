import * as index from "../index";
import {testLoader} from "../index";

describe("entry point", function () {
    it("should have the expected exports", function () {
        expect(typeof index.genericLoad).toEqual("function");
        expect(typeof index.load).toEqual("function");
        expect(typeof index.loadEnv).toEqual("function");

        expect(typeof index.extensionLoader).toEqual("function");
        expect(typeof index.yamlLoader).toEqual("function");
        expect(typeof index.jsLoader).toEqual("function");
    });

    it("should support importing nested config", function () {
        const config = {
            _imports: [
                {
                    someParameter: "someValue"
                }
            ],
            someParameter: "overriding value",
            additionalParameter: [1, 2, 3]
        };

        const result = index.genericLoad(config, testLoader);

        expect(result.get("someParameter")).toEqual("overriding value");
        expect(result.get("additionalParameter").toArray()).toEqual([1, 2, 3]);
    });

    it("should handle overriding values so that the last value wins", function () {
        const config = {
            _imports: [
                {key: "one", key2: "ay"},
                {key2: "bee"}
            ],
            key: "three"
        };

        const result = index.genericLoad(config, testLoader);

        expect(result.get("key")).toEqual("three");
        expect(result.get("key2")).toEqual("bee");
    });
});
