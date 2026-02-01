import {
    IExecuteFunctions,
    IHookFunctions,
    ILoadOptionsFunctions,
    IHttpRequestMethods,
    IHttpRequestOptions,
    IDataObject,
    NodeApiError,
} from "n8n-workflow";

/**
 * In-memory token cache keyed by `username@baseUrl`.
 * Holds the access_token, refresh_token and an approximate expiry timestamp.
 */
interface TokenEntry {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // epoch ms
}

const tokenCache = new Map<string, TokenEntry>();

/**
 * Obtains (or refreshes) a bearer token and returns it.
 */
async function getAccessToken(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
): Promise<string> {
    const credentials = await this.getCredentials("wacraftApi");
    const baseUrl = credentials.baseUrl as string;
    const username = credentials.username as string;
    const password = credentials.password as string;
    const cacheKey = `${username}@${baseUrl}`;

    const cached = tokenCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + 30_000) {
        // still valid (with 30 s margin)
        return cached.accessToken;
    }

    // Try refresh first, fall back to password grant
    let body: IDataObject;
    if (cached?.refreshToken) {
        body = {
            grant_type: "refresh_token",
            refresh_token: cached.refreshToken,
        };
    } else {
        body = {
            grant_type: "password",
            username,
            password,
        };
    }

    const options: IHttpRequestOptions = {
        method: "POST",
        url: `${baseUrl}/user/oauth/token`,
        body,
        json: true,
    };

    let response: IDataObject;
    try {
        response = (await this.helpers.httpRequest(options)) as IDataObject;
    } catch (error) {
        // If refresh failed, retry with password
        if (cached?.refreshToken) {
            const retryOptions: IHttpRequestOptions = {
                method: "POST",
                url: `${baseUrl}/user/oauth/token`,
                body: {
                    grant_type: "password",
                    username,
                    password,
                },
                json: true,
            };
            response = (await this.helpers.httpRequest(retryOptions)) as IDataObject;
        } else {
            throw error;
        }
    }

    const accessToken = response.access_token as string;
    const refreshToken = response.refresh_token as string;
    const expiresIn = (response.expires_in as number) || 3600;

    tokenCache.set(cacheKey, {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000,
    });

    return accessToken;
}

/**
 * Makes an authenticated request to the wacraft API.
 *
 * - Automatically obtains / refreshes tokens.
 * - Sends X-Workspace-ID header (parameter override > credential default).
 */
export async function wacraftApiRequest(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject | IDataObject[] | undefined = undefined,
    qs: IDataObject = {},
    overrideWorkspaceId?: string,
): Promise<any> {
    const credentials = await this.getCredentials("wacraftApi");
    const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, "");
    const workspaceId = overrideWorkspaceId || (credentials.workspaceId as string);
    const token = await getAccessToken.call(this);

    const options: IHttpRequestOptions = {
        method,
        url: `${baseUrl}${endpoint}`,
        qs,
        json: true,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(workspaceId ? { "X-Workspace-ID": workspaceId } : {}),
        },
    };

    if (body !== undefined) {
        options.body = body;
    }

    try {
        return await this.helpers.httpRequest(options);
    } catch (error: any) {
        throw new NodeApiError(this.getNode(), error);
    }
}

/**
 * Makes an authenticated multipart/form-data request (used for media upload).
 */
export async function wacraftApiRequestMultipart(
    this: IExecuteFunctions,
    endpoint: string,
    formData: IDataObject,
    overrideWorkspaceId?: string,
): Promise<any> {
    const credentials = await this.getCredentials("wacraftApi");
    const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, "");
    const workspaceId = overrideWorkspaceId || (credentials.workspaceId as string);
    const token = await getAccessToken.call(this);

    const options: IHttpRequestOptions = {
        method: "POST",
        url: `${baseUrl}${endpoint}`,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(workspaceId ? { "X-Workspace-ID": workspaceId } : {}),
        },
        body: formData,
    };

    try {
        return await this.helpers.httpRequest(options);
    } catch (error: any) {
        throw new NodeApiError(this.getNode(), error);
    }
}
