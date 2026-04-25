import { IDataObject, INodeProperties } from "n8n-workflow";

import { wacraftApiRequest } from "../../GenericFunctions";
import { datePaginationFilters } from "../shared";
import { WacraftResourceDefinition } from "../types";

const operation: INodeProperties = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["billingPlanPrice"] } },
    options: [
        {
            name: "List Plan Prices",
            value: "getMany",
            action: "List plan prices",
            description: "Returns all currency-specific prices for a billing plan.",
        },
    ],
    default: "getMany",
};

const fields: INodeProperties[] = [
    datePaginationFilters(["billingPlanPrice"]),
    {
        displayName: "Plan ID",
        name: "planId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: {
                resource: ["billingPlanPrice"],
                operation: ["getMany"],
            },
        },
        description: "Plan ID",
    },
];

export const billingPlanPrice: WacraftResourceDefinition = {
    description: [operation, ...fields],
    operations: {
        async getMany(itemIndex, workspaceId) {
            const planId = this.getNodeParameter("planId", itemIndex) as string;
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                `/billing/plan/${encodeURIComponent(planId)}/price/`,
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
    },
};
