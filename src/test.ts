import {loadWithParameters} from "./index";

const config = loadWithParameters<{database: string}>("config/default.yaml", process.env);

console.log(config.database);
