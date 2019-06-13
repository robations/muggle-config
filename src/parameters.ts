import { isNil, map } from "ramda";

export function recursiveMap(fn: (x: any) => any): any {
    function r(x: any): any {
        return typeof x === "object" && x !== null ? map(r, x) : fn(x);
    }

    return r;
}

export const applyParameter = (params: Record<any, string>) => (x: any) =>
    typeof x === "string"
        ? x.replace(/%([^%]+)%/g, (_, match) => {
              if (isNil(params[match])) {
                  throw new Error(
                      `Missing parameter '${match} found in config`,
                  );
              } else {
                  return params[match];
              }
          })
        : x;

export function applyParameters<C extends {}, P extends {}>(
    config: C,
    parameters: P,
): C {
    return recursiveMap(applyParameter(parameters))(config);
}
