import { IDataObject, INodeProperties } from "n8n-workflow";

import { wacraftApiRequest } from "../../GenericFunctions";
import { WacraftResourceDefinition } from "../types";

const operation: INodeProperties = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["message"] } },
    options: [
        {
            name: "Get Many",
            value: "getMany",
            action: "Get many messages",
            description: "Retrieve a paginated list of messages",
        },
        {
            name: "Mark as Read",
            value: "markAsRead",
            action: "Mark as read",
            description: "Mark last message as read",
        },
        {
            name: "Search by Content",
            value: "searchByContent",
            action: "Search messages by content",
            description: "Search messages by content text",
        },
        {
            name: "Send WhatsApp Message",
            value: "sendWhatsApp",
            action: "Send a WhatsApp message",
            description: "Send a WhatsApp message",
        },
        {
            name: "Send Typing",
            value: "sendTyping",
            action: "Send typing indicator",
            description: "Mark as read and show typing indicator",
        },
    ],
    default: "getMany",
};

const listFilterOptions: INodeProperties[] = [
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
    { displayName: "From ID", name: "from_id", type: "string", default: "" },
    { displayName: "ID", name: "id", type: "string", default: "" },
    {
        displayName: "Limit",
        name: "limit",
        type: "number",
        default: 10,
        typeOptions: { minValue: 1 },
    },
    {
        displayName: "Messaging Product ID",
        name: "messaging_product_id",
        type: "string",
        default: "",
    },
    { displayName: "Offset", name: "offset", type: "number", default: 0 },
    { displayName: "To ID", name: "to_id", type: "string", default: "" },
];

const fields: INodeProperties[] = [
    {
        displayName: "Additional Filters",
        name: "filters",
        type: "collection",
        placeholder: "Add Filter",
        default: {},
        displayOptions: { show: { resource: ["message"], operation: ["getMany"] } },
        options: listFilterOptions,
    },
    {
        displayName: "Search Text",
        name: "likeText",
        type: "string",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["message"], operation: ["searchByContent"] } },
        description: "Text to search using ILIKE against message content fields",
    },
    {
        displayName: "Additional Filters",
        name: "filters",
        type: "collection",
        placeholder: "Add Filter",
        default: {},
        displayOptions: { show: { resource: ["message"], operation: ["searchByContent"] } },
        options: [
            {
                displayName: "Limit",
                name: "limit",
                type: "number",
                default: 10,
                typeOptions: { minValue: 1 },
            },
            { displayName: "Offset", name: "offset", type: "number", default: 0 },
        ],
    },
    {
        displayName: "To ID (Messaging Product Contact ID)",
        name: "toId",
        type: "string",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["message"], operation: ["sendWhatsApp"] } },
        description: "Messaging product contact ID to send the message to",
    },
    {
        displayName: "Sender Data (JSON)",
        name: "senderData",
        type: "json",
        required: true,
        default: "{}",
        displayOptions: { show: { resource: ["message"], operation: ["sendWhatsApp"] } },
        description:
            "The WhatsApp message payload as JSON (follows the WhatsApp Cloud API message format)",
    },
    {
        displayName: "Additional Filters",
        name: "filters",
        type: "collection",
        placeholder: "Add Filter",
        default: {},
        displayOptions: {
            show: { resource: ["message"], operation: ["markAsRead", "sendTyping"] },
        },
        options: listFilterOptions.filter(field => field.name !== "created_at"),
    },
];

export const message: WacraftResourceDefinition = {
    description: [operation, ...fields],
    operations: {
        async getMany(itemIndex, workspaceId) {
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                "/message",
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
        async searchByContent(itemIndex, workspaceId) {
            const likeText = this.getNodeParameter("likeText", itemIndex) as string;
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                `/message/content/like/${encodeURIComponent(likeText)}`,
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
        async sendWhatsApp(itemIndex, workspaceId) {
            const toId = this.getNodeParameter("toId", itemIndex) as string;
            const senderDataRaw = this.getNodeParameter("senderData", itemIndex) as
                | string
                | IDataObject;
            const senderData =
                typeof senderDataRaw === "string" ? JSON.parse(senderDataRaw) : senderDataRaw;
            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/message/whatsapp",
                {
                    to_id: toId,
                    sender_data: senderData,
                },
                {},
                workspaceId,
            );
            return { data };
        },
        async markAsRead(itemIndex, workspaceId) {
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/message/whatsapp/mark-as-read",
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
        async sendTyping(itemIndex, workspaceId) {
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/message/whatsapp/send-typing",
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
    },
};
