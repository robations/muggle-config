import * as yaml from "js-yaml";
import * as fs from "fs";
import * as im from "immutable";
import {dirname, resolve} from "path";
import {extname} from "path";

export interface Loaded {
    data: {};

    // Represents a resolved context.
    // This is important so we can resolve resources relative to each other.
    resolved: string;
}

export interface Loader {
    (resource: string, context?: string): Loaded;
}

function importFile(resource: string, loader: Loader = extensionLoader, context?: string) {
    const {data, resolved} = loader(resource, context);
    const doc = im.fromJS(data);

    if (doc.has("_imports")) {
        return doc
            .get("_imports")
            .reduce(
                (agg: any, x: string) => {
                    const base = importFile(x, loader, resolved);
                    return base.mergeDeep(agg);
                },
                doc
            )
        ;
    }
    return doc;
}

/**
 * Loads resources based on file extension.
 *
 * @param resource
 * @param context
 */
export function extensionLoader(resource: string, context?: string) {
    const types: {[key: string]: Loader} = {
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

export default importFile;

