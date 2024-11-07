import express from "express";
import startServer from "./loaders";
// import "module-alias/register";

const app = express();
startServer(app);
