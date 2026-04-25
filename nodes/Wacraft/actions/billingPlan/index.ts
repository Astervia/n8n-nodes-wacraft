import { IDataObject, INodeProperties } from "n8n-workflow";

import { wacraftApiRequest } from "../../GenericFunctions";
import { datePaginationFilters } from "../shared";
import { WacraftResourceDefinition } from "../types";

const operation: INodeProperties = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["billingPlan"] } },
    options: [
        {
            name: "Retrieve Billing Plans",
            value: "getMany",
            action: "Retrieve billing plans",
            description: "Returns a paginated list of billing plans based on optional filters.",
        },
    ],
    default: "getMany",
};

export const billingPlan: WacraftResourceDefinition = {
    description: [operation, datePaginationFilters(["billingPlan"])],
    operations: {
        async getMany(itemIndex, workspaceId) {
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                "/billing/plan/",
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
    },
};
