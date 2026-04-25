import { INodeProperties } from "n8n-workflow";

import { wacraftApiRequest } from "../../GenericFunctions";
import { WacraftResourceDefinition } from "../types";

const operation: INodeProperties = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["billingUsage"] } },
    options: [
        {
            name: "Get Throughput Usage",
            value: "get",
            action: "Get throughput usage",
            description:
                "Returns current throughput usage. Always includes user-scoped usage. If X-Workspace-ID is provided, also includes workspace-scoped usage.",
        },
    ],
    default: "get",
};

export const billingUsage: WacraftResourceDefinition = {
    description: [operation],
    operations: {
        async get(_itemIndex, workspaceId) {
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                "/billing/usage",
                undefined,
                {},
                workspaceId,
            );
            return { data };
        },
    },
};
