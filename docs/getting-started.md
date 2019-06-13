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
const someValue = myConfig.foo; // "bar"
```

---

**Intent:** I want to load sensitive or volatile parts of my configuration as
*separate parameters

```yaml
# /etc/myapp/default.yaml
parameters:
    HOST: localhost
    PORT: 3306
    USERNAME: ~
    PASSWORD: ~

database_conn: "mysql://%USERNAME%:%PASSWORD%@%HOST%:%PORT%"
```

```ecmascript6
// index.js
import {loadWithParameters} from "muggle-config";

const myConfig = loadWithParameters("/etc/myapp/default.yaml", process.env);

// string values will be taken from parameters object or environment variable
// e.g. "mysql://mydb:secret%20password@localhost:3306"
const pass = myConfig.database_conn;
```

Parameters can either be loaded from a key within the config called `parameters`
(if nothing else, this can be a place to define required parameters) or
from a separate source such as environment variables. Parameters are passed
in explicitly so you have the choice of loading this from (say) the environment,
another config file, or some kind of secure parameter store.

Missing, null, or undefined parameters will throw an error.

There is no attempt to de-serialize parameter values so parameters are always
strings.


---

**Intent:** I want to evaluate configuration files only once in my project.

```ecmascript6
// config.js
import {loadEnv} from "muggle-config";

// Any more complicated configuration logic could go in here, such as schema
// validation or setting defaults.

export const config = loadEnv();


// another.js
import {config} from "./config";

console.log(config.foo);
```

Create a module within your project, say `config.js`, which evaluates and
exports your configuration for use elsewhere. Since NodeJS/CommonJS only
evaluates a module once you can be sure you’ll get the same configuration each
time.

---

**Intent:** I want to load configuration depending on the current node
environment variable

Note that the `loadEnv()` function is now DEPRECATED. Although there is no
immediate plan to remove this function you may do better by using either
`load()` or `loadWithParameters()` and specifying the config path explicitly.
Less magic is generally better, and some modules make wild assumptions about
behavior based on `NODE_ENV` (React and others).
 
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
const someValue = myConfig.foo;

console.log(someValue);
```

```console
$ NODE_ENV=prod node index.js
i'm in production!

$ NODE_ENV=dev node index.js
i'm in development!
```

**Explanation:** Like with the [config]() module, `loadEnv()` determines the
*environment name from `process.env.NODE_ENV` and looks for a corresponding file
*in the `config/` directory. `loadEnv()` will search for a file with the
*extension **.js**, **.json**, *.yaml** and **.yml**, in that order.

The `_imports` key in the YAML files above indicates configurations that must be
loaded before the current file can be resolved. With a custom loader you could
load from any source, although note that we are currently limited to synchronous
operations.
