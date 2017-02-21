# Quick start

**Intent:** I want to load data from a YAML config file.

```
$ npm i muggle-config
```

```yaml
# ./data.yaml
foo: bar
```

```ecmascript6
// index.js
import {load} from "muggle-config";

const myConfig = load("./data.yaml");
const someValue = myConfig.get("foo"); // "bar"
```

The returned configuration object is an instance of an [Immutable](https://facebook.github.io/immutable-js/) Map which
provides a flexible interface for querying objects and object paths. If you'd rather work with plain old Javascript
objects, just call `.toJS()` on the returned value.

---

**Intent:** I want to load configuration depending on the current node environment variable
 
```yaml
# ./config/default.yaml
foo: bar

# ./config/prod.yaml
_imports: ["./default.yaml"]
foo: i'm in production!

# ./config/dev.yaml
_imports: ["./default.yaml"]
foo: i'm in development!
```

```ecmascript6
// index.js
import {loadEnv} from "muggle-config";

const myConfig = loadEnv();
const someValue = myConfig.get("foo");

console.log(someValue);
```

```console
$ NODE_ENV=prod node index.js
i'm in production!

$ NODE_ENV=dev node index.js
i'm in development!
```

**Explanation:** Like with the [config]() module, `loadEnv()` determines the environment name from
*`process.env.NODE_ENV` and looks for a corresponding file in the `config/` directory. `loadEnv()` will search for a
*file with the extension **.js**, **.json**, *.yaml** and **.yml**, in that order.

The `_imports` key in the YAML files above indicates configurations that must be loaded before the current file can be
resolved. With a custom loader you could load from any source, although note that we are currently limited to
synchronous operations.

---

**Intent:** I want to avoid re-evaluating configuration files and consolidate config logic in my project

```ecmascript6
// config.js
import {loadEnv} from "muggle-config";

// any more complicated configuration logic could go in here such as validation or setting defaults
export const config = loadEnv();


// another.js
import {config} from "./config";

console.log(config.get("foo"));
```

Create a module within your project, say `config.js`, which evaluates and exports your configuration for use elsewhere.
Since NodeJS/CommonJS only evaluates a module once you can be sure you‘ll get the same configuration each time,
and the ImmutableJS data structure ensures that nothing can change the configuration during runtime.
