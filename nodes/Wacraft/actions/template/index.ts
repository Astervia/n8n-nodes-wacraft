import { IDataObject, INodeProperties } from "n8n-workflow";

import { wacraftApiRequest } from "../../GenericFunctions";
import { WacraftResourceDefinition } from "../types";

const operation: INodeProperties = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["template"] } },
    options: [
        {
            name: "Get Many",
            value: "getMany",
            action: "Get many templates",
            description: "Retrieve WhatsApp templates",
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
        displayOptions: { show: { resource: ["template"], operation: ["getMany"] } },
        options: [
            { displayName: "After (Cursor)", name: "after", type: "string", default: "" },
            { displayName: "Before (Cursor)", name: "before", type: "string", default: "" },
            {
                displayName: "Category",
                name: "category",
                type: "options",
                options: [
                    { name: "Account Update", value: "ACCOUNT_UPDATE" },
                    { name: "Alert Update", value: "ALERT_UPDATE" },
                    { name: "Appointment Update", value: "APPOINTMENT_UPDATE" },
                    { name: "Authentication", value: "AUTHENTICATION" },
                    { name: "Auto Reply", value: "AUTO_REPLY" },
                    { name: "Free Service", value: "FREE_SERVICE" },
                    { name: "Issue Resolution", value: "ISSUE_RESOLUTION" },
                    { name: "Marketing", value: "MARKETING" },
                    { name: "OTP", value: "OTP" },
                    { name: "Payment Update", value: "PAYMENT_UPDATE" },
                    { name: "Personal Finance Update", value: "PERSONAL_FINANCE_UPDATE" },
                    { name: "Reservation Update", value: "RESERVATION_UPDATE" },
                    { name: "Shipping Update", value: "SHIPPING_UPDATE" },
                    { name: "Ticket Update", value: "TICKET_UPDATE" },
                    { name: "Transactional", value: "TRANSACTIONAL" },
                    { name: "Transportation Update", value: "TRANSPORTATION_UPDATE" },
                    { name: "Utility", value: "UTILITY" },
                ],
                default: "MARKETING",
            },
            { displayName: "Content", name: "content", type: "string", default: "" },
            { displayName: "Language", name: "language", type: "string", default: "" },
            { displayName: "Limit", name: "limit", type: "number", default: 10 },
            { displayName: "Name", name: "name", type: "string", default: "" },
            {
                displayName: "Name or Content",
                name: "name_or_content",
                type: "string",
                default: "",
            },
            {
                displayName: "Quality Score",
                name: "quality_score",
                type: "options",
                options: [
                    { name: "Green", value: "GREEN" },
                    { name: "Red", value: "RED" },
                    { name: "Unknown", value: "UNKNOWN" },
                    { name: "Yellow", value: "YELLOW" },
                ],
                default: "GREEN",
            },
            {
                displayName: "Status",
                name: "status",
                type: "options",
                options: [
                    { name: "Approved", value: "APPROVED" },
                    { name: "Archived", value: "ARCHIVED" },
                    { name: "Deleted", value: "DELETED" },
                    { name: "Disabled", value: "DISABLED" },
                    { name: "In Appeal", value: "IN_APPEAL" },
                    { name: "Limit Exceeded", value: "LIMIT_EXCEEDED" },
                    { name: "Paused", value: "PAUSED" },
                    { name: "Pending", value: "PENDING" },
                    { name: "Pending Deletion", value: "PENDING_DELETION" },
                    { name: "Rejected", value: "REJECTED" },
                ],
                default: "APPROVED",
            },
        ],
    },
];

export const template: WacraftResourceDefinition = {
    description: [operation, ...fields],
    operations: {
        async getMany(itemIndex, workspaceId) {
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                "/whatsapp-template",
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
    },
};
