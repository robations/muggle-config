import { loadEnv, loadWithParameters } from "./index";

const config = loadWithParameters<{ database: string }>(
    "config/default.yaml",
    process.env,
);
const config2 = loadEnv("default");

console.log(config.database);
