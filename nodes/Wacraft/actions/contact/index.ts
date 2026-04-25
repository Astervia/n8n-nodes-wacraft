import { IDataObject, INodeProperties } from "n8n-workflow";

import { wacraftApiRequest } from "../../GenericFunctions";
import { WacraftResourceDefinition } from "../types";

const operation: INodeProperties = {
    displayName: "Operation",
    name: "operation",
    type: "options",
    noDataExpression: true,
    displayOptions: { show: { resource: ["contact"] } },
    options: [
        {
            name: "Create",
            value: "create",
            action: "Create a contact",
            description: "Create a new contact",
        },
        {
            name: "Delete",
            value: "delete",
            action: "Delete a contact",
            description: "Delete a contact by ID",
        },
        {
            name: "Get Many",
            value: "getMany",
            action: "Get many contacts",
            description: "Retrieve a paginated list of contacts",
        },
        {
            name: "Update",
            value: "update",
            action: "Update a contact",
            description: "Update an existing contact",
        },
    ],
    default: "getMany",
};

const fields: INodeProperties[] = [
    {
        displayName: "Name",
        name: "name",
        type: "string",
        default: "",
        displayOptions: { show: { resource: ["contact"], operation: ["create"] } },
        description: "Contact name",
    },
    {
        displayName: "Email",
        name: "email",
        type: "string",
        placeholder: "name@email.com",
        default: "",
        displayOptions: { show: { resource: ["contact"], operation: ["create"] } },
        description: "Contact email",
    },
    {
        displayName: "Photo Path",
        name: "photoPath",
        type: "string",
        default: "",
        displayOptions: { show: { resource: ["contact"], operation: ["create"] } },
        description: "Contact photo path",
    },
    {
        displayName: "Contact ID",
        name: "contactId",
        type: "string",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["contact"], operation: ["update"] } },
        description: "ID of the contact to update",
    },
    {
        displayName: "Update Fields",
        name: "updateFields",
        type: "collection",
        placeholder: "Add Field",
        default: {},
        displayOptions: { show: { resource: ["contact"], operation: ["update"] } },
        options: [
            {
                displayName: "Email",
                name: "email",
                type: "string",
                default: "",
                placeholder: "name@email.com",
            },
            { displayName: "Name", name: "name", type: "string", default: "" },
            { displayName: "Photo Path", name: "photo_path", type: "string", default: "" },
        ],
    },
    {
        displayName: "Contact ID",
        name: "contactId",
        type: "string",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["contact"], operation: ["delete"] } },
        description: "ID of the contact to delete",
    },
    {
        displayName: "Additional Filters",
        name: "filters",
        type: "collection",
        placeholder: "Add Filter",
        default: {},
        displayOptions: { show: { resource: ["contact"], operation: ["getMany"] } },
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
            { displayName: "Email", name: "email", type: "string", default: "" },
            { displayName: "ID", name: "id", type: "string", default: "" },
            {
                displayName: "Limit",
                name: "limit",
                type: "number",
                default: 10,
                typeOptions: { minValue: 1 },
            },
            { displayName: "Name", name: "name", type: "string", default: "" },
            { displayName: "Offset", name: "offset", type: "number", default: 0 },
        ],
    },
];

export const contact: WacraftResourceDefinition = {
    description: [operation, ...fields],
    operations: {
        async getMany(itemIndex, workspaceId) {
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                "/contact",
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
        async create(itemIndex, workspaceId) {
            const body: IDataObject = {};
            const name = this.getNodeParameter("name", itemIndex, "") as string;
            const email = this.getNodeParameter("email", itemIndex, "") as string;
            const photoPath = this.getNodeParameter("photoPath", itemIndex, "") as string;
            if (name) body.name = name;
            if (email) body.email = email;
            if (photoPath) body.photo_path = photoPath;
            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/contact",
                body,
                {},
                workspaceId,
            );
            return { data };
        },
        async update(itemIndex, workspaceId) {
            const contactId = this.getNodeParameter("contactId", itemIndex) as string;
            const updateFields = this.getNodeParameter(
                "updateFields",
                itemIndex,
                {},
            ) as IDataObject;
            const body: IDataObject = { id: contactId, ...updateFields };
            const data = await wacraftApiRequest.call(
                this,
                "PUT",
                "/contact",
                body,
                {},
                workspaceId,
            );
            return { data };
        },
        async delete(itemIndex, workspaceId) {
            const contactId = this.getNodeParameter("contactId", itemIndex) as string;
            const data = await wacraftApiRequest.call(
                this,
                "DELETE",
                "/contact",
                { id: contactId },
                {},
                workspaceId,
            );
            return { data };
        },
    },
};
