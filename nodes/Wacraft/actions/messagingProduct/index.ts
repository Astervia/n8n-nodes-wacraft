import { IDataObject, INodeProperties } from "n8n-workflow";

import { wacraftApiRequest } from "../../GenericFunctions";
import { WacraftResourceDefinition } from "../types";

const operation: INodeProperties = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["messagingProduct"] } },
    options: [
        {
            name: "Get Many",
            value: "getMany",
            action: "Get many messaging products",
            description: "Retrieve messaging products",
        },
    ],
    default: "getMany",
};

const fields: INodeProperties[] = [
    {
        displayName: "Additional Filters",
        name: "filters",
        type: "collection",
        placeholder: "Add Filter",
        default: {},
        displayOptions: {
            show: { resource: ["messagingProduct"], operation: ["getMany"] },
        },
        options: [
            { displayName: "ID", name: "id", type: "string", default: "" },
            {
                displayName: "Limit",
                name: "limit",
                type: "number",
                default: 10,
                typeOptions: { minValue: 1 },
            },
            {
                displayName: "Name",
                name: "name",
                type: "options",
                options: [{ name: "WhatsApp", value: "WhatsApp" }],
                default: "WhatsApp",
            },
            { displayName: "Offset", name: "offset", type: "number", default: 0 },
        ],
    },
];

export const messagingProduct: WacraftResourceDefinition = {
    description: [operation, ...fields],
    operations: {
        async getMany(itemIndex, workspaceId) {
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                "/messaging-product",
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
    },
};
