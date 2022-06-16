import * as index from "./index";
import {
    jsLoader,
    load,
    loadEnv,
    loadWithParameters,
    loadWithSafeParameters,
    testLoader,
    yamlLoader,
} from "./index";
import { applyParameters } from "./parameters";

describe("entry point", function () {
    it("should have the expected exports", function () {
        expect(typeof index.genericLoad).toEqual("function");
        expect(typeof index.load).toEqual("function");
        expect(typeof index.loadEnv).toEqual("function");
        expect(typeof index.loadWithParameters).toEqual("function");
        expect(typeof index.loadWithSafeParameters).toEqual("function");

        expect(typeof index.extensionLoader).toEqual("function");
        expect(typeof index.yamlLoader).toEqual("function");
        expect(typeof index.jsLoader).toEqual("function");
    });

    it("should support importing nested config", function () {
        const config = {
            _imports: [
                {
                    _imports: [
                        {
                            additionalParameter: [99],
                            heavySurf: "this should be loaded",
                            someParameter: "never see the light of day",
                        },
                    ],
                    someParameter: "someValue",
                },
            ],
            someParameter: "overriding value",
            additionalParameter: [1, 2, 3],
        };

        const result = index.genericLoad(config, testLoader);

        expect(result.someParameter).toEqual("overriding value");
        expect(result.additionalParameter).toEqual([1, 2, 3]);
        expect(result.heavySurf).toEqual("this should be loaded");
    });

    it("should handle overriding values so that the last value wins", function () {
        const config = {
            _imports: [{ key: "one", key2: "ay" }, { key2: "bee" }],
            key: "three",
        };

        const result = index.genericLoad(config, testLoader);

        expect(result.key).toEqual("three");
        expect(result.key2).toEqual("bee");
    });
});

describe("loadEnv()", function () {
    const envTemp = process.env.NODE_ENV;

    afterEach(function () {
        process.env.NODE_ENV = envTemp;
    });

    it("should throw an appropriate error if NODE_ENV is not set", function () {
        delete process.env.NODE_ENV;

        expect(() => loadEnv()).toThrow();
    });

    it("should try to load a file based on the passed env string (and fail)", function () {
        expect(() => loadEnv("boobs")).toThrowError(
            "No matching configurations found for environment boobs",
        );
    });

    it("should load a config file", () => {
        const res = loadEnv("default") as any;

        expect(res.foo).toEqual("bar");
    });
});

test("loadWithParameters() should apply parameters from the environment", () => {
    const res: any = loadWithParameters(
        "example.yaml",
        {
            USER: "user",
            PASS: "pass",
            HOST: "host",
            PORT: "port",
        },
        () => ({
            data: { database: "mysql://%USER%:%PASS%@%HOST%:%PORT%" },
            resolved: "example.yaml",
        }),
    );

    expect(res.database).toEqual("mysql://user:pass@host:port");
});

test("loadWithParameters() should apply parameters from the config and environment", () => {
    const res: any = loadWithParameters(
        "example.yaml",
        {
            PORT: "3306",
        },
        () => ({
            data: {
                database: "mysql://%USER%:%PASS%@%HOST%:%PORT%",
                parameters: {
                    USER: "user",
                    PASS: "pass",
                    HOST: "host",
                    PORT: "port",
                },
            },
            resolved: "example.yaml",
        }),
    );

    expect(res.database).toEqual("mysql://user:pass@host:3306");
});

test("loadWithSafeParameters() should merge external parameters within the config object", () => {
    const res: any = loadWithSafeParameters(
        "example.yaml",
        {
            PORT: "3306",
            ILLEGAL_ALIEN: "hello",
        },
        () => ({
            data: {
                database: "port=%PORT%",
                parameters: {
                    HOST: "host",
                    PORT: "port",
                },
            },
            resolved: "example.yaml",
        }),
    );

    expect(res.database).toEqual("port=3306");
    expect(res.parameters.PORT).toEqual("3306");
    expect(res.parameters.ILLEGAL_ALIEN).not.toBeDefined();
});

test("load()", () => {
    const res = load("example.yaml", () => ({
        data: {},
        resolved: "example.yaml",
    }));

    expect(res).toEqual({});
});

test("yamlLoader() with context", () => {
    const res: any = yamlLoader("./config/default.yaml", ".");

    expect(res.data.foo).toEqual("bar");
    expect(res.resolved).toMatch(/config\/default.yaml$/);
});

test("jsLoader() with context", () => {
    const res = jsLoader("./config/test.json", ".");

    expect(res.data.foo).toEqual("bar");
    expect(res.resolved).toMatch(/config\/test.json$/);
});

test("jsLoader() without context", () => {
    const res = jsLoader("./config/test.json");

    expect(res.data.foo).toEqual("bar");
    expect(res.resolved).toMatch(/config\/test.json$/);
});

test("jsLoader() should preserve regexps", () => {
    const res = jsLoader("./config/regexp.js");

    expect(res.data.regexp).toBeInstanceOf(RegExp);
    expect(res.data.foo.regexp).toBeInstanceOf(RegExp);
    expect(res.resolved).toMatch(/config\/regexp.js$/);
});

test("load() should preserve regexps", () => {
    const res: any = load("./config/regexp.js");

    expect(res.regexp).toBeInstanceOf(RegExp);
    expect(res.obj.regexp).toBeInstanceOf(RegExp);
    expect(res.array[0]).toBeInstanceOf(RegExp);
    expect(res.array[1].old).toBeInstanceOf(RegExp);
});

test("applyParameters() should preserve regexps", () => {
    const r: any = load("./config/regexp.js");

    expect(r.regexp).toBeInstanceOf(RegExp);
    expect(r.obj.regexp).toBeInstanceOf(RegExp);
    expect(r.array[0]).toBeInstanceOf(RegExp);
    expect(r.array[1].old).toBeInstanceOf(RegExp);

    const r2 = applyParameters(r, {});

    expect(r2.regexp).toBeInstanceOf(RegExp);
    expect(r2.obj.regexp).toBeInstanceOf(RegExp);
    expect(r2.array[0]).toBeInstanceOf(RegExp);
    expect(r2.array[1].old).toBeInstanceOf(RegExp);
});
