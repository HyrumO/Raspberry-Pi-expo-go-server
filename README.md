# Raspberry-Pi-expo-go-server

Expo Go development server with ngrok tunnel and basic authentication support. This setup provides a stable URL for accessing your Expo app from any network, with built-in security features.

## Features

- ✅ **Stable URL** - Uses ngrok's free static domain (never changes)
- ✅ **Basic Authentication** - Username/password protection
- ✅ **HTTPS/TLS Encryption** - All traffic encrypted in transit
- ✅ **QR Code Generation** - Terminal display and PNG file
- ✅ **Cross-Platform** - Works on Windows, macOS, Linux, and Raspberry Pi
- ✅ **Automatic Setup** - Handles ngrok authentication and tunnel startup

## Prerequisites

1. **Node.js** (v14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **ngrok** - Install from [ngrok.com/download](https://ngrok.com/download)
   - Windows: `choco install ngrok` (or download installer)
   - macOS: `brew install ngrok`
   - Linux: Download binary or use package manager
   - Verify: `ngrok version`

3. **ngrok Account** - Sign up at [ngrok.com](https://ngrok.com) (free tier includes one static domain)

## Setup

### 1. Install ngrok

Download and install ngrok from [ngrok.com/download](https://ngrok.com/download), or use your package manager.

### 2. Get Your ngrok Static Domain

1. Log in to [ngrok dashboard](https://dashboard.ngrok.com)
2. Navigate to **"Cloud Edge"** → **"Domains"**
3. Click **"New Domain"** or **"Reserve Domain"**
4. Choose a free static domain (e.g., `yourapp.ngrok-free.app`)
5. Copy your **auth token** from **"Your Authtoken"** section

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

Create a `.env` file in the project root:

```bash
# Copy the example (if available) or create manually
cp .env.example .env
```

Edit `.env` and configure:

```env
# ngrok Configuration
NGROK_AUTH_TOKEN=your_ngrok_auth_token_here
NGROK_DOMAIN=yourapp.ngrok-free.app
NGROK_PORT=8081

# Expo Configuration
EXPO_PORT=8081

# Security Configuration
BASIC_AUTH_ENABLED=true
BASIC_AUTH_USERNAME=dev_user
BASIC_AUTH_PASSWORD=your_secure_password_here
```

**Important:** Replace all placeholder values with your actual credentials.

## Usage

Start the server:

```bash
npm start
```

The script will:
1. ✅ Verify ngrok is installed
2. ✅ Authenticate ngrok with your token
3. ✅ Start ngrok tunnel with your static domain and basic auth
4. ✅ Generate and display QR code
5. ✅ Start Expo development server

### Accessing Your App

1. Open **Expo Go** app on your phone
2. Scan the QR code displayed in terminal (or saved as `expo-qr.png`)
3. When prompted, enter your basic auth credentials:
   - Username: (from `.env` file)
   - Password: (from `.env` file)
4. Your app will load using the stable ngrok URL

## Benefits of Static Domain

- ✅ **Stable URL** - Never changes, even after restart
- ✅ **No QR code regeneration needed** - Same QR code always works
- ✅ **Works across different networks** - Access from anywhere
- ✅ **Free tier** - One static domain included with free account

## Security

This setup includes basic authentication to protect your development server. See [SECURITY.md](SECURITY.md) for detailed security best practices.

**Key Security Features:**
- Basic authentication (username/password)
- HTTPS/TLS encryption
- Environment variable management (no hardcoded secrets)

## Troubleshooting

### ngrok not found

**Error:** `ngrok is not installed or not in PATH`

**Solution:**
- Make sure ngrok is installed: `ngrok version`
- Add ngrok to your system PATH
- Or use full path to ngrok executable

### Authentication failed

**Error:** `Failed to authenticate ngrok`

**Solution:**
- Check your `NGROK_AUTH_TOKEN` in `.env` file
- Get a fresh token from [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
- Make sure there are no extra spaces in the token

### Domain already in use

**Error:** `ERR_NGROK` or domain conflict

**Solution:**
- Make sure no other ngrok instance is using your domain
- Check ngrok dashboard for active tunnels
- Restart the server

### Port already in use

**Error:** Port 8081 is already in use

**Solution:**
- Change `NGROK_PORT` and `EXPO_PORT` in `.env` to a different port (e.g., 8082)
- Or stop the process using port 8081

### Expo not starting

**Error:** `Failed to start Expo`

**Solution:**
- Make sure dependencies are installed: `npm install`
- Check that `@expo/cli` is installed
- Verify Node.js version: `node --version` (should be v14+)

### QR code not working

**Solution:**
- Make sure basic auth credentials are correct
- Try entering the URL manually in Expo Go
- Check that ngrok tunnel is running (visit the URL in a browser)
- Verify the URL format: `https://yourdomain.ngrok-free.app`

## Stopping the Server

Press `Ctrl+C` to gracefully stop both ngrok and Expo servers.

## Project Structure

```
.
├── server.js          # Main server script
├── config.js          # Configuration loader
├── package.json       # Dependencies and scripts
├── .env               # Your configuration (not in git)
├── .env.example       # Configuration template
├── .gitignore         # Git ignore rules
├── README.md          # This file
├── SECURITY.md        # Security best practices
└── expo-qr.png        # Generated QR code (not in git)
```

## License

Apache-2.0
