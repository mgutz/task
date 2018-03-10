"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolvers = require("./resolvers");
const server_1 = require("./server");
const defaults = {
    port: 4200,
    resolvers,
};
exports.run = (ctx) => {
    server_1.start(ctx, defaults);
};
//# sourceMappingURL=index.js.map