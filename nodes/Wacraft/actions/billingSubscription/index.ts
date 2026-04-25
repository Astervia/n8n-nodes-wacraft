import { IDataObject, INodeProperties } from "n8n-workflow";

import { wacraftApiRequest } from "../../GenericFunctions";
import { datePaginationFilters } from "../shared";
import { WacraftResourceDefinition } from "../types";

const operation: INodeProperties = {
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
};

const fields: INodeProperties[] = [
    datePaginationFilters(["billingSubscription"]),
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
];

export const billingSubscription: WacraftResourceDefinition = {
    description: [operation, ...fields],
    operations: {
        async getMany(itemIndex, workspaceId) {
            const filters = this.getNodeParameter("filters", itemIndex, {}) as IDataObject;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                "/billing/subscription/",
                undefined,
                filters,
                workspaceId,
            );
            return { data };
        },
        async cancel(itemIndex, workspaceId) {
            const id = this.getNodeParameter("subscriptionId", itemIndex) as string;
            const data = await wacraftApiRequest.call(
                this,
                "DELETE",
                "/billing/subscription/",
                undefined,
                { id },
                workspaceId,
            );
            return { data };
        },
        async initiateCheckout(itemIndex, workspaceId) {
            const planId = this.getNodeParameter("planId", itemIndex) as string;
            const scope = this.getNodeParameter("scope", itemIndex) as string;
            const successUrl = this.getNodeParameter("successUrl", itemIndex) as string;
            const cancelUrl = this.getNodeParameter("cancelUrl", itemIndex) as string;
            const currency = this.getNodeParameter("currency", itemIndex, "") as string;
            const paymentMode = this.getNodeParameter("paymentMode", itemIndex) as string;
            const checkoutWorkspaceId = this.getNodeParameter(
                "checkoutWorkspaceId",
                itemIndex,
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
            if (checkoutWorkspaceId) body.workspace_id = checkoutWorkspaceId;

            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/billing/subscription/checkout",
                body,
                {},
                workspaceId,
            );
            return { data };
        },
        async createManual(itemIndex, workspaceId) {
            const planId = this.getNodeParameter("planId", itemIndex) as string;
            const scope = this.getNodeParameter("scope", itemIndex) as string;
            const userId = this.getNodeParameter("userId", itemIndex) as string;
            const manualSubscriptionFields = this.getNodeParameter(
                "manualSubscriptionFields",
                itemIndex,
                {},
            ) as IDataObject;
            const body: IDataObject = {
                plan_id: planId,
                scope,
                user_id: userId,
                ...manualSubscriptionFields,
            };
            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/billing/subscription/manual",
                body,
                {},
                workspaceId,
            );
            return { data };
        },
        async reactivate(itemIndex, workspaceId) {
            const id = this.getNodeParameter("subscriptionId", itemIndex) as string;
            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/billing/subscription/reactivate",
                undefined,
                { id },
                workspaceId,
            );
            return { data };
        },
        async retryPayment(itemIndex, workspaceId) {
            const id = this.getNodeParameter("subscriptionId", itemIndex) as string;
            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/billing/subscription/retry",
                undefined,
                { id },
                workspaceId,
            );
            return { data };
        },
        async sync(itemIndex, workspaceId) {
            const id = this.getNodeParameter("subscriptionId", itemIndex) as string;
            const data = await wacraftApiRequest.call(
                this,
                "POST",
                "/billing/subscription/sync",
                undefined,
                { id },
                workspaceId,
            );
            return { data };
        },
    },
};
