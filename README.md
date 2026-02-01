# @astervia/n8n-nodes-wacraft

n8n community node for [wacraft](https://github.com/Astervia/wacraft-server) — a WhatsApp Cloud API backend server. This node lets you manage contacts, send messages, handle media, and retrieve templates directly from your n8n workflows.

## Installation

### Community node (recommended)

1. Open your n8n instance.
2. Go to **Settings > Community Nodes**.
3. Search for `@astervia/n8n-nodes-wacraft` and click **Install**.

### Manual installation

```bash
cd ~/.n8n/custom
npm install @astervia/n8n-nodes-wacraft
```

Then restart n8n.

### Development (npm link)

```bash
git clone https://github.com/Astervia/n8n-nodes-wacraft.git
cd n8n-nodes-wacraft
npm install
npm run build
npm link

cd ~/.n8n
npm link @astervia/n8n-nodes-wacraft
```

Restart n8n. The **Wacraft** node will appear in the node picker.

## Credentials

Create a **Wacraft API** credential with the following fields:

| Field                    | Description                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------- |
| **Base URL**             | Your wacraft server URL (e.g. `http://localhost:6900`). No trailing slash.              |
| **Username (Email)**     | The email used to sign in.                                                              |
| **Password**             | The account password.                                                                   |
| **Default Workspace ID** | UUID sent as `X-Workspace-ID` header on every request. Can be overridden per operation. |

### Authentication flow

The node authenticates via `POST /user/oauth/token` using the **password** grant type. Tokens are cached in memory and automatically refreshed using the **refresh_token** grant before expiry. If a refresh fails, the node falls back to a fresh password grant.

## Resources and operations

### Contact

| Operation    | Description                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| **Get Many** | Retrieve a paginated list of contacts with optional filters (name, email, sort order, limit, offset). |
| **Create**   | Create a new contact (name, email, photo path).                                                       |
| **Update**   | Update an existing contact by ID.                                                                     |
| **Delete**   | Delete a contact by ID.                                                                               |

### Message

| Operation                 | Description                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Get Many**              | Retrieve a paginated list of messages with filters (from/to ID, messaging product ID, date range).                                   |
| **Search by Content**     | Search messages using ILIKE text matching against content fields.                                                                    |
| **Send WhatsApp Message** | Send a WhatsApp message to a messaging product contact. Accepts the message payload as JSON following the WhatsApp Cloud API format. |
| **Mark as Read**          | Mark the latest message in a conversation as read (shows double blue check).                                                         |
| **Send Typing**           | Mark as read and display a typing indicator to the WhatsApp user.                                                                    |

### Messaging Product

| Operation    | Description                                            |
| ------------ | ------------------------------------------------------ |
| **Get Many** | Retrieve messaging products (currently only WhatsApp). |

### Messaging Product Contact

| Operation                 | Description                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Get Many**              | Retrieve messaging product contacts with filters.                            |
| **Get WhatsApp Contacts** | Retrieve WhatsApp-specific contacts with phone number and WA ID filters.     |
| **Search by Content**     | Search contacts by content text using ILIKE.                                 |
| **Create**                | Create a messaging product contact linking a contact to a messaging product. |
| **Create WhatsApp**       | Create a WhatsApp contact with phone number and WA ID.                       |
| **Delete**                | Delete a messaging product contact by ID.                                    |
| **Block**                 | Block a messaging product contact.                                           |
| **Unblock**               | Unblock a messaging product contact.                                         |

### Media

| Operation    | Description                                                               |
| ------------ | ------------------------------------------------------------------------- |
| **Get Info** | Get media info including a temporary download URL (expires in 5 minutes). |
| **Download** | Download WhatsApp media by ID. Returns binary data.                       |
| **Upload**   | Upload a media file to WhatsApp. Accepts a binary property and MIME type. |

### Template

| Operation    | Description                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Get Many** | Retrieve WhatsApp message templates with filters for category, status, quality score, language, name, and cursor-based pagination. |

## Workspace ID override

Every operation includes an optional **Workspace ID Override** field. When set, it replaces the default workspace ID from the credentials for that specific execution. This is useful when a single n8n instance interacts with multiple wacraft workspaces.

## Sending a WhatsApp message

The **Send WhatsApp Message** operation requires:

- **To ID**: The messaging product contact ID (not a phone number).
- **Sender Data (JSON)**: The WhatsApp Cloud API message payload.

Example sender data for a text message:

```json
{
    "messaging_product": "whatsapp",
    "type": "text",
    "text": {
        "body": "Hello from n8n!"
    }
}
```

Example sender data for a template message:

```json
{
    "messaging_product": "whatsapp",
    "type": "template",
    "template": {
        "name": "hello_world",
        "language": {
            "code": "en_US"
        }
    }
}
```

## Development

```bash
npm install       # Install dependencies
npm run build     # Compile TypeScript and copy icons
npm run dev       # Watch mode for TypeScript
npm run lint      # Lint with ESLint
npm run lint:fix  # Lint and auto-fix
npm run format    # Format code with Prettier
```

## Project structure

```
n8n-nodes-wacraft/
├── .github/workflows/
│   ├── codeql-analysis.yml          # CodeQL SAST scanning
│   ├── quality-and-security.yml     # Lint, format, audit, build on push/PR
│   └── release.yml                  # Publish to npm on GitHub Release
├── credentials/
│   └── WacraftApi.credentials.ts    # Credential definition
├── nodes/Wacraft/
│   ├── GenericFunctions.ts          # Auth helpers and API request functions
│   ├── Wacraft.node.ts              # Node definition with all resources
│   └── wacraft.svg                  # Node icon
├── eslint.config.mjs
├── gulpfile.js
├── package.json
└── tsconfig.json
```

## License

[MIT](https://opensource.org/licenses/MIT)
