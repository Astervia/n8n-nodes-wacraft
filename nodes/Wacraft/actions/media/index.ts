import { INodeProperties } from "n8n-workflow";

import { wacraftApiRequest } from "../../GenericFunctions";
import { WacraftResourceDefinition } from "../types";

const operation: INodeProperties = {
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
};

const fields: INodeProperties[] = [
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
];

export const media: WacraftResourceDefinition = {
    description: [operation, ...fields],
    operations: {
        async getInfo(itemIndex, workspaceId) {
            const mediaId = this.getNodeParameter("mediaId", itemIndex) as string;
            const data = await wacraftApiRequest.call(
                this,
                "GET",
                `/media/whatsapp/${encodeURIComponent(mediaId)}`,
                undefined,
                {},
                workspaceId,
            );
            return { data };
        },
        async download(itemIndex) {
            const mediaId = this.getNodeParameter("mediaId", itemIndex) as string;
            const credentials = await this.getCredentials("wacraftApi");
            const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, "");

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

            return {
                items: [
                    {
                        json: { mediaId },
                        binary: { data: binaryData },
                    },
                ],
            };
        },
        async upload(itemIndex, workspaceIdOverride) {
            const binaryProperty = this.getNodeParameter("binaryProperty", itemIndex) as string;
            const mimeType = this.getNodeParameter("mimeType", itemIndex) as string;
            const binaryData = this.helpers.assertBinaryData(itemIndex, binaryProperty);

            const credentials = await this.getCredentials("wacraftApi");
            const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, "");
            const workspaceId = workspaceIdOverride || (credentials.workspaceId as string);

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

            const dataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryProperty);

            const formData = new FormData();
            formData.append(
                "file",
                new Blob([dataBuffer], { type: mimeType }),
                binaryData.fileName || "file",
            );
            formData.append("type", mimeType);

            const data = await this.helpers.httpRequest({
                method: "POST",
                url: `${baseUrl}/media/whatsapp/upload`,
                body: formData,
                headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                    ...(workspaceId ? { "X-Workspace-ID": workspaceId } : {}),
                },
            });
            return { data };
        },
    },
};
