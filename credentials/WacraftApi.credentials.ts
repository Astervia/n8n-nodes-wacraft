import {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from "n8n-workflow";

export class WacraftApi implements ICredentialType {
    name = "wacraftApi";
    displayName = "Wacraft API";
    documentationUrl = "https://github.com/Astervia/wacraft-server";

    properties: INodeProperties[] = [
        {
            displayName: "Base URL",
            name: "baseUrl",
            type: "string",
            default: "http://localhost:6900",
            placeholder: "https://your-wacraft-server.com",
            description: "The base URL of your wacraft server (no trailing slash)",
        },
        {
            displayName: "Username (Email)",
            name: "username",
            type: "string",
            default: "",
            placeholder: "user@mail.com",
        },
        {
            displayName: "Password",
            name: "password",
            type: "string",
            typeOptions: { password: true },
            default: "",
        },
        {
            displayName: "Default Workspace ID",
            name: "workspaceId",
            type: "string",
            default: "",
            description:
                "Default workspace UUID sent as X-Workspace-ID header. Can be overridden per operation.",
        },
    ];

    // The credential test hits the token endpoint with password grant
    test: ICredentialTestRequest = {
        request: {
            baseURL: "={{$credentials.baseUrl}}",
            url: "/user/oauth/token",
            method: "POST",
            body: {
                grant_type: "password",
                username: "={{$credentials.username}}",
                password: "={{$credentials.password}}",
            },
        },
    };
}
