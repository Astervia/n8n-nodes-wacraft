import { IDataObject, INodeExecutionData, INodeProperties } from "n8n-workflow";

export const resourceSelector: INodeProperties = {
    displayName: "Resource",
    name: "resource",
    type: "options",
    noDataExpression: true,
    options: [
        { name: "Billing Plan", value: "billingPlan" },
        { name: "Billing Plan Price", value: "billingPlanPrice" },
        { name: "Billing Subscription", value: "billingSubscription" },
        { name: "Billing Usage", value: "billingUsage" },
        { name: "Contact", value: "contact" },
        { name: "Media", value: "media" },
        { name: "Message", value: "message" },
        { name: "Messaging Product", value: "messagingProduct" },
        { name: "Messaging Product Contact", value: "messagingProductContact" },
        { name: "Template", value: "template" },
    ],
    default: "contact",
};

export const workspaceIdOverride: INodeProperties = {
    displayName: "Workspace ID Override",
    name: "workspaceIdOverride",
    type: "string",
    default: "",
    description:
        "Override the default workspace ID for this operation. Leave empty to use the credential default.",
};

export const datePaginationFilters = (
    resources: string[],
    operations: string[] = ["getMany"],
): INodeProperties => ({
    displayName: "Additional Filters",
    name: "filters",
    type: "collection",
    placeholder: "Add Filter",
    default: {},
    displayOptions: {
        show: {
            resource: resources,
            operation: operations,
        },
    },
    options: [
        {
            displayName: "Created At Order",
            name: "created_at",
            type: "options",
            options: [
                { name: "Ascending", value: "asc" },
                { name: "Descending", value: "desc" },
            ],
            default: "desc",
        },
        {
            displayName: "Created At Greater Than or Equal",
            name: "created_at_geq",
            type: "string",
            default: "",
        },
        {
            displayName: "Created At Less Than or Equal",
            name: "created_at_leq",
            type: "string",
            default: "",
        },
        {
            displayName: "Limit",
            name: "limit",
            type: "number",
            default: 10,
            typeOptions: { minValue: 1 },
            description: "Number of items to return",
        },
        {
            displayName: "Offset",
            name: "offset",
            type: "number",
            default: 0,
            description: "The offset from where to start the items",
        },
        {
            displayName: "Updated At Order",
            name: "updated_at",
            type: "options",
            options: [
                { name: "Ascending", value: "asc" },
                { name: "Descending", value: "desc" },
            ],
            default: "desc",
        },
        {
            displayName: "Updated At Greater Than or Equal",
            name: "updated_at_geq",
            type: "string",
            default: "",
        },
        {
            displayName: "Updated At Less Than or Equal",
            name: "updated_at_leq",
            type: "string",
            default: "",
        },
    ],
});

export function normalizeResult(data: unknown): INodeExecutionData[] {
    if (Array.isArray(data)) {
        return data.map(item => ({ json: item as IDataObject }));
    }

    if (typeof data === "object" && data !== null) {
        return [{ json: data as IDataObject }];
    }

    return [{ json: { data } as IDataObject }];
}
