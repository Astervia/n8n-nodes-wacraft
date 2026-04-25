import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    IDataObject,
} from "n8n-workflow";

import { wacraftApiRequest } from "./GenericFunctions";

export class Wacraft implements INodeType {
    description: INodeTypeDescription = {
        displayName: "Wacraft",
        name: "wacraft",
        icon: "file:wacraft.svg",
        group: ["transform"],
        version: 1,
        subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
        description: "Interact with the wacraft WhatsApp Cloud API server",
        defaults: {
            name: "Wacraft",
        },
        inputs: ["main"],
        outputs: ["main"],
        credentials: [
            {
                name: "wacraftApi",
                required: true,
            },
        ],
        properties: [
            // ------------------------------------------------------------------
            //  Resource selector
            // ------------------------------------------------------------------
            {
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
            },

            // ==================================================================
            //  BILLING PLAN operations
            // ==================================================================
            {
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
                        description:
                            "Returns a paginated list of billing plans based on optional filters.",
                    },
                ],
                default: "getMany",
            },

            // ==================================================================
            //  BILLING PLAN PRICE operations
            // ==================================================================
            {
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
            },

            // ==================================================================
            //  BILLING SUBSCRIPTION operations
            // ==================================================================
            {
                displayName: "Operation",
                name: "operation",
                type: "options",
                noDataExpression: true,
                displayOptions: { show: { resource: ["billingSubscription"] } },
                options: [
                    {
                        name: "Cancel a Subscription",
                        value: "cancel",
                        action: "Cancel a subscription",
                        description:
                            "Cancels an active subscription. Users can only cancel their own subscriptions.",
                    },
                    {
                        name: "Create Manual Subscription",
                        value: "createManual",
                        action: "Create manual subscription",
                        description:
                            "Creates a subscription manually for custom deals or enterprise plans. Requires billing.admin policy.",
                    },
                    {
                        name: "Initiate Checkout",
                        value: "initiateCheckout",
                        action: "Initiate checkout",
                        description:
                            "Creates a payment checkout session for purchasing a plan. Returns a URL to redirect the user to the payment provider.",
                    },
                    {
                        name: "Reactivate a Subscription",
                        value: "reactivate",
                        action: "Reactivate a subscription",
                        description:
                            "Reverses a pending cancellation for a recurring subscription, re-enabling auto-renewal. Only works when cancel_at_period_end is true and cancelled_at is not set.",
                    },
                    {
                        name: "Retrieve Subscriptions",
                        value: "getMany",
                        action: "Retrieve subscriptions",
                        description:
                            "Returns paginated subscriptions. Without X-Workspace-ID returns user subscriptions. With X-Workspace-ID returns workspace subscriptions (requires billing.read policy).",
                    },
                    {
                        name: "Retry Subscription Payment",
                        value: "retryPayment",
                        action: "Retry subscription payment",
                        description:
                            "Returns a URL to the payment provider where the user can pay an outstanding invoice for a past due subscription. Without X-Workspace-ID it operates on a user subscription. With X-Workspace-ID it operates on a workspace subscription (requires billing.manage policy).",
                    },
                    {
                        name: "Sync Subscription With Payment Provider",
                        value: "sync",
                        action: "Sync subscription with payment provider",
                        description:
                            "Fetches the current subscription state from the payment provider (e.g. Stripe) and updates the local record. Only works for subscription-mode subscriptions.",
                    },
                ],
                default: "getMany",
            },

            // ==================================================================
            //  BILLING USAGE operations
            // ==================================================================
            {
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
            },

            // ==================================================================
            //  CONTACT operations
            // ==================================================================
            {
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
            },

            // ==================================================================
            //  MESSAGE operations
            // ==================================================================
            {
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
            },

            // ==================================================================
            //  MESSAGING PRODUCT operations
            // ==================================================================
            {
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
            },

            // ==================================================================
            //  MESSAGING PRODUCT CONTACT operations
            // ==================================================================
            {
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
            },

            // ==================================================================
            //  MEDIA operations
            // ==================================================================
            {
                displayName: "Operation",
                name: "operation",
                type: "options",
                noDataExpression: true,
                displayOptions: { show: { resource: ["media"] } },
                options: [
                    {
                        name: "Download",
                        value: "download",
                        action: "Download media",
                        description: "Download WhatsApp media by ID",
                    },
                    {
                        name: "Get Info",
                        value: "getInfo",
                        action: "Get media info",
                        description: "Get media info / temporary URL",
                    },
                    {
                        name: "Upload",
                        value: "upload",
                        action: "Upload media",
                        description: "Upload a media file to WhatsApp",
                    },
                ],
                default: "getInfo",
            },

            // ==================================================================
            //  TEMPLATE operations
            // ==================================================================
            {
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
            },

            // ==================================================================
            //  SHARED: Workspace ID override
            // ==================================================================
            {
                displayName: "Workspace ID Override",
                name: "workspaceIdOverride",
                type: "string",
                default: "",
                description:
                    "Override the default workspace ID for this operation. Leave empty to use the credential default.",
            },

            // ==================================================================
            //  BILLING fields
            // ==================================================================
            {
                displayName: "Additional Filters",
                name: "filters",
                type: "collection",
                placeholder: "Add Filter",
                default: {},
                displayOptions: {
                    show: {
                        resource: ["billingPlan", "billingPlanPrice", "billingSubscription"],
                        operation: ["getMany"],
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
            },
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
            {
                displayName: "Plan ID",
                name: "planId",
                type: "string",
                required: true,
                default: "",
                displayOptions: {
                    show: {
                        resource: ["billingSubscription"],
                        operation: ["initiateCheckout", "createManual"],
                    },
                },
                description: "Plan ID",
            },
            {
                displayName: "Subscription ID",
                name: "subscriptionId",
                type: "string",
                required: true,
                default: "",
                displayOptions: {
                    show: {
                        resource: ["billingSubscription"],
                        operation: ["cancel", "reactivate", "retryPayment", "sync"],
                    },
                },
                description: "Subscription ID",
            },
            {
                displayName: "Scope",
                name: "scope",
                type: "options",
                required: true,
                options: [
                    { name: "User", value: "user" },
                    { name: "Workspace", value: "workspace" },
                ],
                default: "user",
                displayOptions: {
                    show: {
                        resource: ["billingSubscription"],
                        operation: ["initiateCheckout", "createManual"],
                    },
                },
                description: "Billing subscription scope",
            },
            {
                displayName: "Success URL",
                name: "successUrl",
                type: "string",
                required: true,
                default: "",
                displayOptions: {
                    show: { resource: ["billingSubscription"], operation: ["initiateCheckout"] },
                },
                description: "URL to redirect to after a successful checkout",
            },
            {
                displayName: "Cancel URL",
                name: "cancelUrl",
                type: "string",
                required: true,
                default: "",
                displayOptions: {
                    show: { resource: ["billingSubscription"], operation: ["initiateCheckout"] },
                },
                description: "URL to redirect to if checkout is cancelled",
            },
            {
                displayName: "Currency",
                name: "currency",
                type: "string",
                default: "",
                displayOptions: {
                    show: { resource: ["billingSubscription"], operation: ["initiateCheckout"] },
                },
                description: "Currency to use. If empty, the plan's default price is used.",
            },
            {
                displayName: "Payment Mode",
                name: "paymentMode",
                type: "options",
                options: [
                    { name: "One-Time Payment", value: "payment" },
                    { name: "Subscription", value: "subscription" },
                ],
                default: "payment",
                displayOptions: {
                    show: { resource: ["billingSubscription"], operation: ["initiateCheckout"] },
                },
                description: 'Defaults to "payment" if empty',
            },
            {
                displayName: "Workspace ID",
                name: "checkoutWorkspaceId",
                type: "string",
                default: "",
                displayOptions: {
                    show: { resource: ["billingSubscription"], operation: ["initiateCheckout"] },
                },
                description: "Required by the API when scope is workspace",
            },
            {
                displayName: "User ID",
                name: "userId",
                type: "string",
                required: true,
                default: "",
                displayOptions: {
                    show: { resource: ["billingSubscription"], operation: ["createManual"] },
                },
                description: "User who purchased or owns the subscription",
            },
            {
                displayName: "Manual Subscription Fields",
                name: "manualSubscriptionFields",
                type: "collection",
                placeholder: "Add Field",
                default: {},
                displayOptions: {
                    show: { resource: ["billingSubscription"], operation: ["createManual"] },
                },
                options: [
                    {
                        displayName: "Throughput Override",
                        name: "throughput_override",
                        type: "number",
                        default: 0,
                        description: "Admin override for custom plans",
                    },
                    {
                        displayName: "Workspace ID",
                        name: "workspace_id",
                        type: "string",
                        default: "",
                    },
                ],
            },

            // ==================================================================
            //  CONTACT fields
            // ==================================================================
            // --- Create ---
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
            // --- Update ---
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
            // --- Delete ---
            {
                displayName: "Contact ID",
                name: "contactId",
                type: "string",
                required: true,
                default: "",
                displayOptions: { show: { resource: ["contact"], operation: ["delete"] } },
                description: "ID of the contact to delete",
            },
            // --- Get Many ---
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

            // ==================================================================
            //  MESSAGE fields
            // ==================================================================
            // --- Get Many ---
            {
                displayName: "Additional Filters",
                name: "filters",
                type: "collection",
                placeholder: "Add Filter",
                default: {},
                displayOptions: { show: { resource: ["message"], operation: ["getMany"] } },
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
                ],
            },
            // --- Search by Content ---
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
            // --- Send WhatsApp ---
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
            // --- Mark as Read ---
            {
                displayName: "Additional Filters",
                name: "filters",
                type: "collection",
                placeholder: "Add Filter",
                default: {},
                displayOptions: {
                    show: { resource: ["message"], operation: ["markAsRead", "sendTyping"] },
                },
                options: [
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
                ],
            },

            // ==================================================================
            //  MESSAGING PRODUCT fields
            // ==================================================================
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

            // ==================================================================
            //  MESSAGING PRODUCT CONTACT fields
            // ==================================================================
            // --- Get Many ---
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
            // --- Get WhatsApp ---
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
                    {
                        displayName: "Phone Number",
                        name: "phone_number",
                        type: "string",
                        default: "",
                    },
                    { displayName: "WA ID", name: "wa_id", type: "string", default: "" },
                ],
            },
            // --- Search by Content ---
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
            // --- Create ---
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
            // --- Create WhatsApp ---
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
            // --- Delete / Block / Unblock ---
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

            // ==================================================================
            //  MEDIA fields
            // ==================================================================
            {
                displayName: "Media ID",
                name: "mediaId",
                type: "string",
                required: true,
                default: "",
                displayOptions: {
                    show: { resource: ["media"], operation: ["download", "getInfo"] },
                },
                description: "The WhatsApp media ID",
            },
            // --- Upload ---
            {
                displayName: "Binary Property",
                name: "binaryProperty",
                type: "string",
                required: true,
                default: "data",
                displayOptions: { show: { resource: ["media"], operation: ["upload"] } },
                description: "Name of the binary property containing the file to upload",
            },
            {
                displayName: "MIME Type",
                name: "mimeType",
                type: "string",
                required: true,
                default: "",
                placeholder: "image/jpeg",
                displayOptions: { show: { resource: ["media"], operation: ["upload"] } },
                description: "MIME type of the media file",
            },

            // ==================================================================
            //  TEMPLATE fields
            // ==================================================================
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
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const resource = this.getNodeParameter("resource", 0) as string;
        const operation = this.getNodeParameter("operation", 0) as string;

        for (let i = 0; i < items.length; i++) {
            try {
                const workspaceIdOverride = this.getNodeParameter(
                    "workspaceIdOverride",
                    i,
                    "",
                ) as string;
                const wsId = workspaceIdOverride || undefined;
                let responseData: any;

                // ==============================================================
                //  BILLING PLAN
                // ==============================================================
                if (resource === "billingPlan") {
                    if (operation === "getMany") {
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            "/billing/plan/",
                            undefined,
                            filters,
                            wsId,
                        );
                    }
                }

                // ==============================================================
                //  BILLING PLAN PRICE
                // ==============================================================
                else if (resource === "billingPlanPrice") {
                    if (operation === "getMany") {
                        const planId = this.getNodeParameter("planId", i) as string;
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            `/billing/plan/${encodeURIComponent(planId)}/price/`,
                            undefined,
                            filters,
                            wsId,
                        );
                    }
                }

                // ==============================================================
                //  BILLING SUBSCRIPTION
                // ==============================================================
                else if (resource === "billingSubscription") {
                    if (operation === "getMany") {
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            "/billing/subscription/",
                            undefined,
                            filters,
                            wsId,
                        );
                    } else if (operation === "cancel") {
                        const id = this.getNodeParameter("subscriptionId", i) as string;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "DELETE",
                            "/billing/subscription/",
                            undefined,
                            { id },
                            wsId,
                        );
                    } else if (operation === "initiateCheckout") {
                        const planId = this.getNodeParameter("planId", i) as string;
                        const scope = this.getNodeParameter("scope", i) as string;
                        const successUrl = this.getNodeParameter("successUrl", i) as string;
                        const cancelUrl = this.getNodeParameter("cancelUrl", i) as string;
                        const currency = this.getNodeParameter("currency", i, "") as string;
                        const paymentMode = this.getNodeParameter("paymentMode", i) as string;
                        const workspaceId = this.getNodeParameter(
                            "checkoutWorkspaceId",
                            i,
                            "",
                        ) as string;
                        const body: IDataObject = {
                            plan_id: planId,
                            scope,
                            success_url: successUrl,
                            cancel_url: cancelUrl,
                            payment_mode: paymentMode,
                        };
                        if (currency) body.currency = currency;
                        if (workspaceId) body.workspace_id = workspaceId;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/billing/subscription/checkout",
                            body,
                            {},
                            wsId,
                        );
                    } else if (operation === "createManual") {
                        const planId = this.getNodeParameter("planId", i) as string;
                        const scope = this.getNodeParameter("scope", i) as string;
                        const userId = this.getNodeParameter("userId", i) as string;
                        const manualSubscriptionFields = this.getNodeParameter(
                            "manualSubscriptionFields",
                            i,
                            {},
                        ) as IDataObject;
                        const body: IDataObject = {
                            plan_id: planId,
                            scope,
                            user_id: userId,
                            ...manualSubscriptionFields,
                        };
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/billing/subscription/manual",
                            body,
                            {},
                            wsId,
                        );
                    } else if (operation === "reactivate") {
                        const id = this.getNodeParameter("subscriptionId", i) as string;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/billing/subscription/reactivate",
                            undefined,
                            { id },
                            wsId,
                        );
                    } else if (operation === "retryPayment") {
                        const id = this.getNodeParameter("subscriptionId", i) as string;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/billing/subscription/retry",
                            undefined,
                            { id },
                            wsId,
                        );
                    } else if (operation === "sync") {
                        const id = this.getNodeParameter("subscriptionId", i) as string;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/billing/subscription/sync",
                            undefined,
                            { id },
                            wsId,
                        );
                    }
                }

                // ==============================================================
                //  BILLING USAGE
                // ==============================================================
                else if (resource === "billingUsage") {
                    if (operation === "get") {
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            "/billing/usage",
                            undefined,
                            {},
                            wsId,
                        );
                    }
                }

                // ==============================================================
                //  CONTACT
                // ==============================================================
                else if (resource === "contact") {
                    if (operation === "getMany") {
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            "/contact",
                            undefined,
                            filters,
                            wsId,
                        );
                    } else if (operation === "create") {
                        const body: IDataObject = {};
                        const name = this.getNodeParameter("name", i, "") as string;
                        const email = this.getNodeParameter("email", i, "") as string;
                        const photoPath = this.getNodeParameter("photoPath", i, "") as string;
                        if (name) body.name = name;
                        if (email) body.email = email;
                        if (photoPath) body.photo_path = photoPath;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/contact",
                            body,
                            {},
                            wsId,
                        );
                    } else if (operation === "update") {
                        const contactId = this.getNodeParameter("contactId", i) as string;
                        const updateFields = this.getNodeParameter(
                            "updateFields",
                            i,
                            {},
                        ) as IDataObject;
                        const body: IDataObject = { id: contactId, ...updateFields };
                        responseData = await wacraftApiRequest.call(
                            this,
                            "PUT",
                            "/contact",
                            body,
                            {},
                            wsId,
                        );
                    } else if (operation === "delete") {
                        const contactId = this.getNodeParameter("contactId", i) as string;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "DELETE",
                            "/contact",
                            { id: contactId },
                            {},
                            wsId,
                        );
                    }
                }

                // ==============================================================
                //  MESSAGE
                // ==============================================================
                else if (resource === "message") {
                    if (operation === "getMany") {
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            "/message",
                            undefined,
                            filters,
                            wsId,
                        );
                    } else if (operation === "searchByContent") {
                        const likeText = this.getNodeParameter("likeText", i) as string;
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            `/message/content/like/${encodeURIComponent(likeText)}`,
                            undefined,
                            filters,
                            wsId,
                        );
                    } else if (operation === "sendWhatsApp") {
                        const toId = this.getNodeParameter("toId", i) as string;
                        const senderDataRaw = this.getNodeParameter("senderData", i) as
                            | string
                            | IDataObject;
                        const senderData =
                            typeof senderDataRaw === "string"
                                ? JSON.parse(senderDataRaw)
                                : senderDataRaw;
                        const body: IDataObject = {
                            to_id: toId,
                            sender_data: senderData,
                        };
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/message/whatsapp",
                            body,
                            {},
                            wsId,
                        );
                    } else if (operation === "markAsRead") {
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/message/whatsapp/mark-as-read",
                            undefined,
                            filters,
                            wsId,
                        );
                    } else if (operation === "sendTyping") {
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/message/whatsapp/send-typing",
                            undefined,
                            filters,
                            wsId,
                        );
                    }
                }

                // ==============================================================
                //  MESSAGING PRODUCT
                // ==============================================================
                else if (resource === "messagingProduct") {
                    if (operation === "getMany") {
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            "/messaging-product",
                            undefined,
                            filters,
                            wsId,
                        );
                    }
                }

                // ==============================================================
                //  MESSAGING PRODUCT CONTACT
                // ==============================================================
                else if (resource === "messagingProductContact") {
                    if (operation === "getMany") {
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            "/messaging-product/contact",
                            undefined,
                            filters,
                            wsId,
                        );
                    } else if (operation === "getWhatsApp") {
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            "/messaging-product/contact/whatsapp",
                            undefined,
                            filters,
                            wsId,
                        );
                    } else if (operation === "searchByContent") {
                        const likeText = this.getNodeParameter("likeText", i) as string;
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            `/messaging-product/contact/content/like/${encodeURIComponent(likeText)}`,
                            undefined,
                            filters,
                            wsId,
                        );
                    } else if (operation === "create") {
                        const contactId = this.getNodeParameter("contactId", i) as string;
                        const messagingProductId = this.getNodeParameter(
                            "messagingProductId",
                            i,
                        ) as string;
                        const productDetailsRaw = this.getNodeParameter(
                            "productDetails",
                            i,
                            "{}",
                        ) as string | IDataObject;
                        const productDetails =
                            typeof productDetailsRaw === "string"
                                ? JSON.parse(productDetailsRaw)
                                : productDetailsRaw;
                        const body: IDataObject = {
                            contact_id: contactId,
                            messaging_product_id: messagingProductId,
                            product_details: productDetails,
                        };
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/messaging-product/contact",
                            body,
                            {},
                            wsId,
                        );
                    } else if (operation === "createWhatsApp") {
                        const contactId = this.getNodeParameter("contactId", i) as string;
                        const phoneNumber = this.getNodeParameter("phoneNumber", i, "") as string;
                        const waId = this.getNodeParameter("waId", i, "") as string;
                        const productDetails: IDataObject = {};
                        if (phoneNumber) productDetails.phone_number = phoneNumber;
                        if (waId) productDetails.wa_id = waId;
                        const body: IDataObject = {
                            contact_id: contactId,
                            product_details: productDetails,
                        };
                        responseData = await wacraftApiRequest.call(
                            this,
                            "POST",
                            "/messaging-product/contact/whatsapp",
                            body,
                            {},
                            wsId,
                        );
                    } else if (operation === "delete") {
                        const id = this.getNodeParameter("messagingProductContactId", i) as string;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "DELETE",
                            "/messaging-product/contact",
                            { id },
                            {},
                            wsId,
                        );
                    } else if (operation === "block") {
                        const id = this.getNodeParameter("messagingProductContactId", i) as string;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "PATCH",
                            "/messaging-product/contact/block",
                            { id },
                            {},
                            wsId,
                        );
                    } else if (operation === "unblock") {
                        const id = this.getNodeParameter("messagingProductContactId", i) as string;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "DELETE",
                            "/messaging-product/contact/block",
                            { id },
                            {},
                            wsId,
                        );
                    }
                }

                // ==============================================================
                //  MEDIA
                // ==============================================================
                else if (resource === "media") {
                    if (operation === "getInfo") {
                        const mediaId = this.getNodeParameter("mediaId", i) as string;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            `/media/whatsapp/${encodeURIComponent(mediaId)}`,
                            undefined,
                            {},
                            wsId,
                        );
                    } else if (operation === "download") {
                        const mediaId = this.getNodeParameter("mediaId", i) as string;
                        const credentials = await this.getCredentials("wacraftApi");
                        const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, "");

                        // We request the binary data directly
                        const response = await this.helpers.httpRequestWithAuthentication.call(
                            this,
                            "wacraftApi",
                            {
                                method: "GET",
                                url: `${baseUrl}/media/whatsapp/download/${encodeURIComponent(mediaId)}`,
                                encoding: "arraybuffer",
                                returnFullResponse: true,
                                json: false,
                            } as any,
                        );

                        const binaryData = await this.helpers.prepareBinaryData(
                            Buffer.from(response.body as Buffer),
                            undefined,
                            response.headers?.["content-type"] as string,
                        );
                        returnData.push({
                            json: { mediaId },
                            binary: { data: binaryData },
                        });
                        continue;
                    } else if (operation === "upload") {
                        const binaryProperty = this.getNodeParameter("binaryProperty", i) as string;
                        const mimeType = this.getNodeParameter("mimeType", i) as string;
                        const binaryData = this.helpers.assertBinaryData(i, binaryProperty);

                        const credentials = await this.getCredentials("wacraftApi");
                        const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, "");
                        const workspaceId = wsId || (credentials.workspaceId as string);

                        // Get a fresh token via a simple helper call
                        const tokenResponse = await this.helpers.httpRequest({
                            method: "POST",
                            url: `${baseUrl}/user/oauth/token`,
                            body: {
                                grant_type: "password",
                                username: credentials.username as string,
                                password: credentials.password as string,
                            },
                            json: true,
                        });

                        const dataBuffer = await this.helpers.getBinaryDataBuffer(
                            i,
                            binaryProperty,
                        );

                        const formData = new FormData();
                        formData.append(
                            "file",
                            new Blob([dataBuffer], { type: mimeType }),
                            binaryData.fileName || "file",
                        );
                        formData.append("type", mimeType);

                        responseData = await this.helpers.httpRequest({
                            method: "POST",
                            url: `${baseUrl}/media/whatsapp/upload`,
                            body: formData,
                            headers: {
                                Authorization: `Bearer ${tokenResponse.access_token}`,
                                ...(workspaceId ? { "X-Workspace-ID": workspaceId } : {}),
                            },
                        });
                    }
                }

                // ==============================================================
                //  TEMPLATE
                // ==============================================================
                else if (resource === "template") {
                    if (operation === "getMany") {
                        const filters = this.getNodeParameter("filters", i, {}) as IDataObject;
                        responseData = await wacraftApiRequest.call(
                            this,
                            "GET",
                            "/whatsapp-template",
                            undefined,
                            filters,
                            wsId,
                        );
                    }
                }

                // Normalize output
                if (responseData !== undefined) {
                    if (Array.isArray(responseData)) {
                        returnData.push(...responseData.map((item: any) => ({ json: item })));
                    } else if (typeof responseData === "object" && responseData !== null) {
                        returnData.push({ json: responseData as IDataObject });
                    } else {
                        returnData.push({ json: { data: responseData } });
                    }
                }
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: (error as Error).message } });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}
