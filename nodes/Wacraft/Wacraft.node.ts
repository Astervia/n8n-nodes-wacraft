import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
} from "n8n-workflow";

import { properties, resources } from "./actions";
import { normalizeResult } from "./actions/shared";

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
        properties,
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter("resource", i) as string;
                const operation = this.getNodeParameter("operation", i) as string;
                const workspaceIdOverride = this.getNodeParameter(
                    "workspaceIdOverride",
                    i,
                    "",
                ) as string;
                const workspaceId = workspaceIdOverride || undefined;
                const executeOperation = resources[resource]?.operations[operation];

                if (!executeOperation) {
                    throw new NodeOperationError(
                        this.getNode(),
                        `Unsupported Wacraft operation: ${resource}.${operation}`,
                        { itemIndex: i },
                    );
                }

                const result = await executeOperation.call(this, i, workspaceId);

                if (result.items) {
                    returnData.push(...result.items);
                } else if (result.data !== undefined) {
                    returnData.push(...normalizeResult(result.data));
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
