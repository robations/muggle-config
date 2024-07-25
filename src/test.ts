import { loadEnv, loadWithParameters, loadWithSafeParameters } from "./index";

const config = loadWithParameters<{ database: string }>(
    "config/default.yaml",
    process.env,
);
const config2 = loadEnv("default");

console.log(config.database);

const config3: any = loadWithSafeParameters("./config/importsJs.yaml", {});

console.log(config3, typeof config3.date);
