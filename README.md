# ARMEDIA

# EC200U Web Dashboard

A modern web-based dashboard for monitoring Quectel EC200U cellular modules.

## Features

- **Real-time Signal Monitoring**: Live signal strength with visual bars
- **Automatic Port Detection**: Scans and lists available serial ports
- **Module Information**: Displays model, revision, and SIM status
- **Interactive Controls**: Manual refresh and auto-refresh options
- **Command Log**: Detailed log of all AT commands and responses
- **Responsive Design**: Works on desktop and mobile devices

## Setup

1. **Enable Web Serial API**:
   - Chrome/Edge: Enable `#enable-experimental-web-platform-features` in chrome://flags
   - Or use a local web server (required for security)

2. **Serve the Files**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server


   
## Key Features of this Dashboard:

1. **Modern UI**: Glass morphism design with smooth animations
2. **Real-time Monitoring**: Live signal strength with visual indicators
3. **Auto-refresh**: Continuous monitoring every 2 seconds
4. **Port Management**: Automatic port scanning and selection
5. **Comprehensive Logging**: Full command/response logging
6. **Responsive**: Works on both desktop and mobile devices
7. **Error Handling**: Robust error handling and status updates

## To Use:

1. Serve the files using a local web server
2. Open in Chrome/Edge (Web Serial API support required)
3. Connect your EC200U module via USB
4. Click "Connect" and select your device

The dashboard will automatically handle all the AT command communication and provide a beautiful, real-time visualization of your cellular signal quality!

## Contributors

- **Reza faridi(https://github.com/Faridi1419)** - Web dashboard development
- **Amir Radnia(https://github.com/amirradnia99)** - Original Python AT command implementation
