# Muggle Config

Configuration without the magic.

[![NPM](https://nodei.co/npm/muggle-config.png?downloads=true)](https://nodei.co/npm/muggle-config/)

[![Build Status](https://travis-ci.org/robations/muggle-config.svg?branch=master)](https://travis-ci.org/robations/muggle-config)


## Why

Designed as a drop in replacement* for the doughty node-config module. Node-config fits lots of use cases, but I often
find it becomes hard to use when I have a more complex requirement, such as multiple config inheritance. In my opinion
it tries to do too much work automatically by taking instructions from the environment and by trying to be a singleton.
This project aims to be both simpler to understand and more configurable, which is handy for a module handling
configuration.

<small>\* This is a lie, it differs in many significant ways. However it has enough similarities to make replacing
existing usages within the bounds of feasibility.</small>


## How

```
$ npm i muggle-config
```

```typescript
import {load} from "muggle-config";

const myConfig = load("./config/wayne.yaml");
const someValue = myConfig.foo; // "bar"
```

```yaml
# ./config/wayne.yaml
foo: bar
```

You can explicitly create multiple configuration hierarchies:

```yaml
# ./config/harold.yaml
_imports:
    # resolved relative to current config file
    - wayne.yaml

# deep nested merging is the current behaviour
foo: buzz
```

Using the default configuration loader, the filetype will be detected from the file extension. The currently supported
filetypes are YAML (`.yaml`, `.yml`), CommonJS Javascript (`.js`) and JSON (`.json`).

You can also create your own configuration loader that must match the `Loader` interface. Here’s an example for loading
ini files:

```typescript
import {readFileSync} from "fs";
import * as ini from "ini";
import {resolve, dirname} from "path";
import {load} from "muggle-config";

function iniLoader(resource: string, context?: string) {
    // Resolve path relative to file.
    // You could also make your own rules here as long as your config files obey these rules.
    const resolved = context
        ? resolve(process.cwd(), dirname(context), resource)
        : resolve(resource)
    ;

    return {
        // The actual data as a JS object/array.
        data: ini.parse(readFileSync(resolved, "utf-8")),

        // The resolved path (allows resolution of recursive configs).
        resolved: resolved
    };
}

const myConfig = load("graham.ini", iniLoader);
```

# Who

Contribute by trying out this module and reporting back any usability problems, questions or bugs on [the issue
tracker]([![Build
Status](https://travis-ci.org/robations/muggle-config.svg?branch=master)](https://travis-ci.org/robations/muggle-config)).
Pull requests are welcome but please check before doing work to avoid disappointment.


# Upgrading from v0.0.x to v1

1. Returned configuration no longer uses the ImmutableJS library and will be
Plain Old Javascript Objects.

2. Consider migrating away from using `loadEnv()` in preference to `load()` or
`loadWithParameters()`.

3. `muggle-config` now has a dependency on some `ramda` functions. Make sure
that tree-shaking is working if using in the browser.


## TODO

- [x] file extension loader (load files based on extension)
- [x] document basic usage
- [x] add some unit tests
- [x] ensure minimal npm publish (don't include bloat files)
- [x] set up continuous integration
- [x] clearer documentation of common use cases
- [x] developer documentation
- [ ] add a changelog
- [ ] blanket test coverage
- [ ] allow to configure resolving imports
- [ ] mechanism to replace keys instead of merging?
- [ ] support synchronous and async loading?
