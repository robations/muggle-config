import * as yaml from "js-yaml";
import * as fs from "fs";
import * as im from "immutable";
import {dirname, resolve} from "path";
import {extname} from "path";
import {join} from "path";

export interface Loaded<R, C> {
    data: {};

    // Represents a resolved context.
    // This is important so we can resolve resources relative to each other.
    resolved: C;
}

export interface Loader<R, C> {
    (resource: R, context?: C): Loaded<R, C>;
}

export function genericLoad<R, C>(resource: R, loader: Loader<R, C>, context?: C): any {
    const {data, resolved} = loader(resource, context);
    const doc = im.fromJS(data);

    if (doc.has("_imports")) {
        return doc
            .get("_imports")
            .reduceRight(
                (agg: any, x: R) => {
                    const base = genericLoad<R, C>(x, loader, resolved);
                    return base.mergeDeep(agg);
                },
                doc
            )
        ;
    }
    return doc;
}

export function load(resource: string, loader: Loader<string, string> = extensionLoader, context?: string): any {
    return genericLoad<string, string>(resource, loader, context);
}

export function loadEnv(env?: string, loader: Loader<string, string> = extensionLoader, context?: string): any {
    if (env === void 0) {
        env = process.env.NODE_ENV;
    }
    let configDir = join(process.cwd(), "config");
    if (configDir.indexOf('.') === 0) {
        configDir = join(process.cwd(), configDir);
    }
    const extensions = im.List(["js", "json", "yaml", "yml"]);

    const found = extensions
        .map((x: string) => join(configDir, env) + "." + x)
        .find((x: string) => fs.existsSync(x))
    ;

    if (found === void 0) {
        throw new Error(`No matching configurations found for environment ${env}`);
    }

    return load(found, loader, context);
}

/**
 * Loads resources based on file extension.
 */
export function extensionLoader(resource: string, context?: string) {
    const types: {[key: string]: Loader<string, string>} = {
        ".yaml": yamlLoader,
        ".yml": yamlLoader,
        ".js": jsLoader,
        ".json": jsLoader
    };
    const ext = extname(resource).toLocaleLowerCase();

    return types[ext](resource, context);
}

export function yamlLoader(resource: string, context?: string) {
    const resolved = context
        ? resolve(dirname(context), resource)
        : resource
    ;

    return {
        data: yaml.safeLoad(fs.readFileSync(resolved, "utf8")),
        resolved: resolved
    };
}

export function jsLoader(resource: string, context?: string) {
    const resolved = context
        ? resolve(process.cwd(), dirname(context), resource)
        : resolve(resource)
    ;

    return {
        data: require(resolved),
        resolved: resolved
    };
}

/**
 * This loader expects the whole resource string to be a valid JSON string that is the configuration.
 */
export function testLoader(resource: {}): Loaded<{}, {}> {
    return {
        data: resource,
        resolved: resource
    };
}
