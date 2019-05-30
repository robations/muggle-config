import {applyParameter, applyParameters, recursiveMap} from "../parameters";

test("recursiveMap() should apply fn to individual value", () => {
    const res = recursiveMap(() => "hi")("bye");

    expect(res).toEqual("hi");
});

test("recursiveMap() should apply fn to an array", () => {
    const res = recursiveMap(() => "hi")([1, 2]);

    expect(res).toEqual(["hi", "hi"]);
});

test("recursiveMap() should apply fn to object values", () => {
    const res = recursiveMap(() => "hi")({one: {two: 2}, three: "3"});

    expect(res.one.two).toEqual("hi");
    expect(res.three).toEqual("hi");
});

test("recursiveMap() should not try to recurse into null property", () => {
    const res = recursiveMap(() => "hi")({one: null});

    expect(res.one).toEqual("hi");
});

test("applyParameter() should replace matched %PARAMS%", () => {
    const res = applyParameter({PASSWORD: "the secret is here"})("This is the '%PASSWORD%'.");

    expect(res).toEqual("This is the 'the secret is here'.");
});

test("applyParameter() should replace multiple params", () => {
    const res = applyParameter({HOST: "localhost", PORT: "3346", X: "YZ"})("mysql://user@pass:%HOST%:%PORT%");

    expect(res).toEqual("mysql://user@pass:localhost:3346");
});

test("applyParameter() should throw an error if param is missing", () => {
    expect(() => applyParameter({HoSt: "localhost", PORT: "3306"})("mysql://user@pass:%HOST%:%PORT%")).toThrow();
});

test("recursiveMap() should combine with applyParameter() nicely", () => {
    const config = {one: {two: 2}, three: "%ENDPOINT%"};
    const params = {ENDPOINT: "https://api.example.com/"};
    const res = recursiveMap(applyParameter(params))(config);

    expect(res.one.two).toEqual(2);
    expect(res.three).toEqual(params.ENDPOINT);
});

test("applyParameters() should throw an error if a parameter is missing", () => {
    const config = {one: "%ENDPOINT%"};
    const params = {EnDpOiNt: "https://api.example.com/"};

    expect(() => applyParameters(config, params)).toThrow();
});
