import { IExecuteFunctions, INodeExecutionData, INodeProperties } from "n8n-workflow";

export interface WacraftOperationResult {
    data?: unknown;
    items?: INodeExecutionData[];
}

export type WacraftOperationExecutor = (
    this: IExecuteFunctions,
    itemIndex: number,
    workspaceId?: string,
) => Promise<WacraftOperationResult>;

export interface WacraftResourceDefinition {
    description: INodeProperties[];
    operations: Record<string, WacraftOperationExecutor>;
}
