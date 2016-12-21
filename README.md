# Muggle Config

Configuration without the magic.


## Why

Designed as a drop in replacement* for the doughty node-config module. Node-config fits lots of use cases, but I often
find it becomes hard to use when I have a more complex requirement, such as multiple config inheritance. In my opinion
it tries to do too much work automatically by taking instructions from the environment and by trying to be a singleton.
This project aims to be both simpler to understand and more configurable, which is handy for a module handling
configuration.

<small>\* This is a lie, it differs in many significant ways. However, it has enough similarities to not scare me away
from replacing existing usages.)</small>


## How

```
$ npm i muggle-config
```

```javascript
import default as config from "muggle-config";

const c = config("./config/wayne.yaml")
const x = c.get("foo"); // "bar" 
```

## TODO

- [x] file extension loader (load files based on extension)
- [ ] document basic usage
- [ ] unit tests
- [ ] function that emulates node-config module more closely with `NODE_ENV` file loading
- [ ] allow to configure resolving imports
- [ ] mechanism to replace keys instead of merging?
- [ ] support synchronous and async loading?
