import { IDataObject, INodeProperties } from "n8n-workflow";

import { wacraftApiRequest } from "../../GenericFunctions";
import { WacraftResourceDefinition } from "../types";

const operation: INodeProperties = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["messagingProductContact"] } },
    options: [
        {
            name: "Block",
            value: "block",
            action: "Block a contact",
            description: "Block a messaging product contact",
        },
        {
            name: "Create",
            value: "create",
            action: "Create a messaging product contact",
            description: "Create a messaging product contact",
        },
        {
            name: "Create WhatsApp",
            value: "createWhatsApp",
            action: "Create a WhatsApp contact",
            description: "Create a WhatsApp messaging product contact",
        },
        {
            name: "Delete",
            value: "delete",
            action: "Delete a messaging product contact",
            description: "Delete a messaging product contact",
        },
        {
            name: "Get Many",
            value: "getMany",
            action: "Get many messaging product contacts",
            description: "Retrieve messaging product contacts",
        },
        {
            name: "Get WhatsApp Contacts",
            value: "getWhatsApp",
            action: "Get WhatsApp contacts",
            description: "Retrieve WhatsApp messaging product contacts",
        },
        {
            name: "Search by Content",
            value: "searchByContent",
            action: "Search contacts by content",
            description: "Search messaging product contacts by content text",
        },
        {
            name: "Unblock",
            value: "unblock",
            action: "Unblock a contact",
            description: "Unblock a messaging product contact",
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
            show: { resource: ["messagingProductContact"], operation: ["getMany"] },
        },
        options: [
            { displayName: "Blocked", name: "blocked", type: "boolean", default: false },
            { displayName: "Contact ID", name: "contact_id", type: "string", default: "" },
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
        ],
    },
    {
        displayName: "Additional Filters",
        name: "filters",
        type: "collection",
        placeholder: "Add Filter",
        default: {},
        displayOptions: {
            show: { resource: ["messagingProductContact"], operation: ["getWhatsApp"] },
        },
        options: [
            { displayName: "Contact ID", name: "contact_id", type: "string", default: "" },
            { displayName: "ID", name: "id", type: "string", default: "" },
            {
                displayName: "Limit",
                name: "limit",
                type: "number",
                default: 10,
                typeOptions: { minValue: 1 },
            },
            { displayName: "Offset", name: "offset", type: "number", default: 0 },
            { displayName: "Phone Number", name: "phone_number", type: "string", default: "" },
            { displayName: "WA ID", name: "wa_id", type: "string", default: "" },
        ],
    },
    {
        displayName: "Search Text",
        name: "likeText",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["messagingProductContact"], operation: ["searchByContent"] },
        },
        description: "Text to search using ILIKE against contact fields",
    },
    {
        displayName: "Additional Filters",
        name: "filters",
        type: "collection",
        placeholder: "Add Filter",
        default: {},
        displayOptions: {
            show: { resource: ["messagingProductContact"], operation: ["searchByContent"] },
        },
        options: [
            { displayName: "Blocked", name: "blocked", type: "boolean", default: false },
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
        displayName: "Contact ID",
        name: "contactId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["messagingProductContact"], operation: ["create"] },
        },
        description: "The contact ID to link",
    },
    {
        displayName: "Messaging Product ID",
        name: "messagingProductId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["messagingProductContact"], operation: ["create"] },
        },
        description: "The messaging product ID to associate with",
    },
    {
        displayName: "Product Details (JSON)",
        name: "productDetails",
        type: "json",
        default: "{}",
        displayOptions: {
            show: { resource: ["messagingProductContact"], operation: ["create"] },
        },
        description: "Product-specific details (phone_number, wa_id)",
    },
    {
        displayName: "Contact ID",
        name: "contactId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: { resource: ["messagingProductContact"], operation: ["createWhatsApp"] },
        },
        description: "The contact ID to link",
    },
    {
        displayName: "Phone Number",
        name: "phoneNumber",
        type: "string",
        default: "",
        displayOptions: {
            show: { resource: ["messagingProductContact"], operation: ["createWhatsApp"] },
        },
        description: "WhatsApp phone number",
    },
    {
        displayName: "WA ID",
        name: "waId",
        type: "string",
        default: "",
        displayOptions: {
            show: { resource: ["messagingProductContact"], operation: ["createWhatsApp"] },
        },
        description: "WhatsApp ID",
    },
    {
        displayName: "Messaging Product Contact ID",
        name: "messagingProductContactId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
            show: {
                resource: ["messagingProductContact"],
                operation: ["delete", "block", "unblock"],
            },
        },
        description: "ID of the messaging product contact",
    },
];

export const messagingProductContact: WacraftResourceDefinition = {
    description: [operation, ...fields],
    operations: {
        async getMany(itemIndex, workspaceId) {
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                "/messaging-product/contact",
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
        async getWhatsApp(itemIndex, workspaceId) {
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                "/messaging-product/contact/whatsapp",
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
                `/messaging-product/contact/content/like/${encodeURIComponent(likeText)}`,
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
        async create(itemIndex, workspaceId) {
            const contactId = this.getNodeParameter("contactId", itemIndex) as string;
            const messagingProductId = this.getNodeParameter(
                "messagingProductId",
                itemIndex,
            ) as string;
            const productDetailsRaw = this.getNodeParameter("productDetails", itemIndex, "{}") as
                | string
                | IDataObject;
            const productDetails =
                typeof productDetailsRaw === "string"
                    ? JSON.parse(productDetailsRaw)
                    : productDetailsRaw;
            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/messaging-product/contact",
                {
                    contact_id: contactId,
                    messaging_product_id: messagingProductId,
                    product_details: productDetails,
                },
                {},
                workspaceId,
            );
            return { data };
        },
        async createWhatsApp(itemIndex, workspaceId) {
            const contactId = this.getNodeParameter("contactId", itemIndex) as string;
            const phoneNumber = this.getNodeParameter("phoneNumber", itemIndex, "") as string;
            const waId = this.getNodeParameter("waId", itemIndex, "") as string;
            const productDetails: IDataObject = {};
            if (phoneNumber) productDetails.phone_number = phoneNumber;
            if (waId) productDetails.wa_id = waId;
            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/messaging-product/contact/whatsapp",
                {
                    contact_id: contactId,
                    product_details: productDetails,
                },
                {},
                workspaceId,
            );
            return { data };
        },
        async delete(itemIndex, workspaceId) {
            const id = this.getNodeParameter("messagingProductContactId", itemIndex) as string;
            const data = await wacraftApiRequest.call(
                this,
                "DELETE",
                "/messaging-product/contact",
                { id },
                {},
                workspaceId,
            );
            return { data };
        },
        async block(itemIndex, workspaceId) {
            const id = this.getNodeParameter("messagingProductContactId", itemIndex) as string;
            const data = await wacraftApiRequest.call(
                this,
                "PATCH",
                "/messaging-product/contact/block",
                { id },
                {},
                workspaceId,
            );
            return { data };
        },
        async unblock(itemIndex, workspaceId) {
            const id = this.getNodeParameter("messagingProductContactId", itemIndex) as string;
            const data = await wacraftApiRequest.call(
                this,
                "DELETE",
                "/messaging-product/contact/block",
                { id },
                {},
                workspaceId,
            );
            return { data };
        },
    },
};
