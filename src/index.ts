import * as yaml from "js-yaml";
import * as fs from "fs";
import { dirname, extname, join, resolve } from "path";
import {
    has,
    mergeDeepLeft,
    mergeDeepRight,
    merge,
    pipe,
    prop,
    reduce,
} from "ramda";
import { applyParameters } from "./parameters";

export interface Loaded<R, C> {
    data: {};

    // Represents a resolved context.
    // This is important so we can resolve resources relative to each other.
    resolved: C;
}

export interface Loader<R, C> {
    (resource: R, context?: C): Loaded<R, C>;
}

export function genericLoad<R, C>(
    resource: R,
    loader: Loader<R, C>,
    context?: C,
): any {
    const { data, resolved } = loader(resource, context);

    if (has("_imports", data)) {
        return pipe(
            prop("_imports"),
            reduce((agg: any, x: R) => {
                const base = genericLoad<R, C>(x, loader, resolved);
                return mergeDeepRight(agg, base);
            }, {}),
            mergeDeepLeft(data),
        )(data);
    }
    return data;
}

export function load<C extends {}>(
    resource: string,
    loader: Loader<string, string> = extensionLoader,
    context?: string,
): C {
    return genericLoad<string, string>(resource, loader, context);
}

/**
 * Load config from the specified resource and apply the passed environment
 * variables.
 *
 * The order of applying parameters is (i) from a `parameters` key within the
 * config, then (ii) from the passed `env` record.
 *
 * For example, you might call it like this:
 *
 * ```
 * const config = loadWithParameters("config/myconfig.yaml", process.env);
 * ```
 *
 * @param resource
 * @param loader
 * @param env
 * @param context
 */
export function loadWithParameters<C extends {}>(
    resource: string,
    env: Record<any, string> = {},
    loader: Loader<string, string> = extensionLoader,
    context?: string,
): C {
    const config = genericLoad<string, string>(resource, loader, context);
    const params = merge(config.parameters, env);

    return applyParameters(config, params);
}

/**
 * Load config for a specific environment
 *
 * @param env The environment to load. Will fall back to the NODE_ENV environment variable.
 * @param loader Loads a resource.
 * @param context A context for loading resources such as current working directory
 *
 * @deprecated This function contains or implies some "magic", which is not the
 * Muggle way to do things. Suggest to use load() or loadWithParameters()
 * instead and explicitly specify the path to the configuration file. If you
 * feel the need to switch based on the `env` parameter I suggest to use a
 * configuration parameter instead. No plans to remove this function in the
 * immediate future.
 */
export function loadEnv<C extends {}>(
    env?: string,
    loader: Loader<string, string> = extensionLoader,
    context?: string,
): C {
    if (env === undefined) {
        env = process.env.NODE_ENV;
    }
    if (env === undefined) {
        throw new Error(
            "NODE_ENV variable must be set when using loadEnv() or specify environment explicitly",
        );
    }
    let configDir = join(process.cwd(), "config");
    if (configDir.indexOf(".") === 0) {
        // TODO how/why do we trigger this case?
        configDir = join(process.cwd(), configDir);
    }
    const extensions = ["js", "json", "yaml", "yml"];

    const found = extensions
        .map((x: string) => join(configDir, env) + "." + x)
        .find((x: string) => fs.existsSync(x));

    if (found === undefined) {
        throw new Error(
            `No matching configurations found for environment ${env}`,
        );
    }

    return load(found, loader, context);
}

/**
 * Loads resources based on file extension.
 */
export function extensionLoader(resource: string, context?: string) {
    const types: { [key: string]: Loader<string, string> } = {
        ".yaml": yamlLoader,
        ".yml": yamlLoader,
        ".js": jsLoader,
        ".json": jsLoader,
    };
    const ext = extname(resource).toLocaleLowerCase();

    return types[ext](resource, context);
}

export function yamlLoader(resource: string, context?: string) {
    const resolved = context ? resolve(dirname(context), resource) : resource;

    return {
        data: yaml.safeLoad(fs.readFileSync(resolved, "utf8")),
        resolved,
    };
}

export function jsLoader(resource: string, context?: string) {
    const resolved = context
        ? resolve(process.cwd(), dirname(context), resource)
        : resolve(resource);

    return {
        data: require(resolved),
        resolved: resolved,
    };
}

/**
 * This loader expects the whole resource string to be a valid JS object that is the configuration.
 */
export function testLoader(resource: {}): Loaded<{}, {}> {
    return {
        data: resource,
        resolved: resource,
    };
}
