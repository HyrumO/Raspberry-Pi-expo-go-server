const { spawn } = require('child_process');
const { exec } = require('child_process');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const config = require('./config');
const fs = require('fs');
const path = require('path');

let ngrokProcess = null;
let expoProcess = null;
let currentUrl = null;

// Check if ngrok is installed
function checkNgrokInstalled() {
  return new Promise((resolve, reject) => {
    exec('ngrok version', (error) => {
      if (error) {
        console.error('❌ ngrok is not installed or not in PATH');
        console.log('\n📥 Please install ngrok:');
        console.log('   Windows: choco install ngrok');
        console.log('   macOS: brew install ngrok');
        console.log('   Linux: Download from https://ngrok.com/download');
        console.log('   Or visit: https://ngrok.com/download');
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Authenticate ngrok
function authenticateNgrok() {
  return new Promise((resolve, reject) => {
    if (!config.ngrok.authToken) {
      console.error('❌ NGROK_AUTH_TOKEN not found in .env file');
      console.log('\n💡 Create a .env file from .env.example and add your ngrok auth token');
      reject(new Error('Missing auth token'));
      return;
    }

    exec(`ngrok config add-authtoken ${config.ngrok.authToken}`, (error, stdout, stderr) => {
      if (error && !stderr.includes('already exists')) {
        console.error('❌ Failed to authenticate ngrok:', error);
        reject(error);
      } else {
        console.log('✅ ngrok authenticated');
        resolve();
      }
    });
  });
}

// Build ngrok security arguments
function getSecurityArgs() {
  const args = [];
  
  // Basic Authentication
  if (config.security.basicAuth.enabled) {
    if (config.security.basicAuth.username && config.security.basicAuth.password) {
      args.push('--basic-auth', `${config.security.basicAuth.username}:${config.security.basicAuth.password}`);
      console.log('🔐 Basic authentication enabled');
    } else {
      console.warn('⚠️  Basic auth enabled but credentials missing in .env');
      console.warn('   Please set BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD');
    }
  } else {
    console.warn('⚠️  WARNING: No authentication enabled - URL is publicly accessible!');
    console.warn('   Set BASIC_AUTH_ENABLED=true in .env to enable security');
  }
  
  return args;
}

// Start ngrok tunnel with security
function startNgrok() {
  return new Promise((resolve, reject) => {
    if (!config.ngrok.domain) {
      console.error('❌ NGROK_DOMAIN not found in .env file');
      console.log('\n💡 Reserve a free static domain at: https://dashboard.ngrok.com/cloud-edge/domains');
      reject(new Error('Missing ngrok domain'));
      return;
    }

    console.log(`\n🚇 Starting ngrok tunnel on domain: ${config.ngrok.domain}`);
    console.log(`   Port: ${config.ngrok.port}\n`);

    const securityArgs = getSecurityArgs();
    const ngrokArgs = [
      'http',
      `--domain=${config.ngrok.domain}`,
      ...securityArgs,
      config.ngrok.port.toString()
    ];

    ngrokProcess = spawn('ngrok', ngrokArgs, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let ngrokOutput = '';
    
    ngrokProcess.stdout.on('data', (data) => {
      ngrokOutput += data.toString();
      process.stdout.write(data);
      
      // Check if tunnel is ready
      if (ngrokOutput.includes('started tunnel') || ngrokOutput.includes('Session Status')) {
        setTimeout(() => {
          const url = `https://${config.ngrok.domain}`;
          currentUrl = url;
          resolve(url);
        }, 2000);
      }
    });

    ngrokProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('ERR_NGROK')) {
        console.error('❌ ngrok error:', error);
        reject(new Error(error));
      } else {
        process.stderr.write(data);
      }
    });

    ngrokProcess.on('error', (error) => {
      console.error('❌ Failed to start ngrok:', error.message);
      reject(error);
    });

    ngrokProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`\n❌ ngrok exited with code ${code}`);
      }
    });
  });
}

// Generate QR code with security warning
function generateQRCode(url) {
  console.log('\n📱 Expo Go Connection URL:');
  console.log(`   ${url}\n`);
  
  // Security status
  if (config.security.basicAuth.enabled && config.security.basicAuth.username) {
    console.log('🔐 Security: Basic Authentication Required');
    console.log(`   Username: ${config.security.basicAuth.username}`);
    console.log('   Password: (set in .env file)\n');
  } else {
    console.log('⚠️  WARNING: No authentication enabled - URL is publicly accessible!\n');
  }
  
  // Generate QR code in terminal
  qrcode.generate(url, { small: true }, (qr) => {
    console.log(qr);
  });

  // Also save QR code as image
  const qrPath = path.join(__dirname, 'expo-qr.png');
  QRCode.toFile(qrPath, url, {
    width: 300,
    margin: 2
  }, (err) => {
    if (err) {
      console.error('⚠️  Could not save QR code image:', err.message);
    } else {
      console.log(`\n💾 QR code saved to: ${qrPath}`);
    }
  });
}

// Start Expo dev server
function startExpo() {
  return new Promise((resolve, reject) => {
    console.log('\n🚀 Starting Expo development server...\n');

    const appDir = path.join(__dirname, 'app');
    
    // Check if app directory exists
    if (!fs.existsSync(appDir)) {
      console.error('❌ App directory not found:', appDir);
      console.log('\n💡 Make sure the app/ directory exists with your Expo app');
      reject(new Error('App directory not found'));
      return;
    }

    const env = {
      ...process.env,
      EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
    };

    expoProcess = spawn('npx', ['expo', 'start', '--tunnel'], {
      stdio: 'inherit',
      env: env,
      shell: true,
      cwd: appDir
    });

    expoProcess.on('error', (error) => {
      console.error('❌ Failed to start Expo:', error.message);
      console.log('\n💡 Make sure @expo/cli is installed: npm install');
      reject(error);
    });

    expoProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`\n⚠️  Expo exited with code ${code}`);
      }
    });

    // Give Expo a moment to start
    setTimeout(() => {
      resolve();
    }, 3000);
  });
}

// Cleanup function
function cleanup() {
  console.log('\n\n🛑 Shutting down...');
  
  if (ngrokProcess) {
    ngrokProcess.kill();
    console.log('   ✓ ngrok stopped');
  }
  
  if (expoProcess) {
    expoProcess.kill();
    console.log('   ✓ Expo stopped');
  }
  
  process.exit(0);
}

// Main function
async function main() {
  try {
    console.log('🎯 Secure Expo Go Server with ngrok Tunnel\n');
    console.log('='.repeat(50));

    // Check prerequisites
    await checkNgrokInstalled();
    await authenticateNgrok();

    // Start ngrok
    const tunnelUrl = await startNgrok();
    
    // Generate QR code
    generateQRCode(tunnelUrl);

    // Start Expo
    await startExpo();

    console.log('\n✅ Secure server is running!');
    console.log(`📱 Scan the QR code above with Expo Go app`);
    console.log(`🌐 Or enter this URL manually: ${tunnelUrl}`);
    
    if (config.security.basicAuth.enabled && config.security.basicAuth.username) {
      console.log(`\n🔐 Authentication required: ${config.security.basicAuth.username}`);
      console.log('   You will be prompted for credentials when accessing the URL');
    }
    
    console.log('\n💡 Press Ctrl+C to stop the server\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    cleanup();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the server
main();

