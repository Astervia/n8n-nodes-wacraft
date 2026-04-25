import { INodeProperties } from "n8n-workflow";

import { billingPlan } from "./billingPlan";
import { billingPlanPrice } from "./billingPlanPrice";
import { billingSubscription } from "./billingSubscription";
import { billingUsage } from "./billingUsage";
import { contact } from "./contact";
import { media } from "./media";
import { message } from "./message";
import { messagingProduct } from "./messagingProduct";
import { messagingProductContact } from "./messagingProductContact";
import { resourceSelector, workspaceIdOverride } from "./shared";
import { template } from "./template";
import { WacraftResourceDefinition } from "./types";

export const resources: Record<string, WacraftResourceDefinition> = {
    billingPlan,
    billingPlanPrice,
    billingSubscription,
    billingUsage,
    contact,
    message,
    messagingProduct,
    messagingProductContact,
    media,
    template,
};

export const properties: INodeProperties[] = [
    resourceSelector,
    ...Object.values(resources).flatMap(resource => resource.description),
    workspaceIdOverride,
];
