
# EC200U Cellular Monitor Dashboard

<<<<<<< HEAD
A modern web dashboard for real-time monitoring of Quectel EC200U cellular modules.
=======
A modern web-based dashboard for monitoring **Quectel EC200U** cellular modules with real-time signal quality visualization. The dashboard connects to a FastAPI backend that provides the necessary AT command-based data to monitor signal strength, module information, SIM status, and connection state.
>>>>>>> coworker/main

![Python](https://img.shields.io/badge/Python-3.8+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

<<<<<<< HEAD
- **Real-time Monitoring**: Live signal quality (RSSI/BER) visualization
- **Dual Interface**: Simple mode for quick checks, Advanced mode for full control
- **Automatic Detection**: Auto-find EC200U module on USB ports
- **Responsive Design**: Works on desktop and mobile
- **REST API**: Clean FastAPI backend with comprehensive endpoints

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/Faridi1419/ARMEDIA.git
cd ARMEDIA/back-end
pip install -r requirements.txt
python main.py
2. Open Dashboard
bash
cd ../front-end
python -m http.server 3000
Open http://localhost:3000 in your browser.

📁 Project Structure
text
ARMEDIA/
├── back-end/          # FastAPI server + serial communication
│   ├── main.py                 # Main server with REST API
│   ├── ec200u_module.py       # Core AT command handling
│   └── requirements.txt        # Python dependencies
├── front-end/         # Web dashboard (HTML/CSS/JS)
│   ├── index.html             # Dual-mode HTML interface
│   ├── style.css              # Modern CSS with animations
│   └── script.js              # Enhanced JavaScript logic
└── README.md

🔌 API Reference
Endpoint	Method	Description
/api/health	GET	System health check
/api/signal	GET	Get signal quality
/api/info	GET	Get module & SIM info
/api/command/{cmd}	GET	Send custom AT command

🎮 Dashboard Modes
Simple Mode
One-click connection to backend

Auto-refresh every 2 seconds

Real-time signal visualization

Basic module information

Advanced Mode
Port scanning and selection

Manual refresh control

Custom AT command console

Detailed logging system

📊 Signal Quality Guide
RSSI	Quality	Description
0-4	Very Poor	Marginal or no signal
5-9	Poor	Weak signal
10-14	Fair	Moderate signal
15-19	Good	Good signal
20-24	Very Good	Strong signal
25-31	Excellent	Excellent signal

👥 Team
Amir Radnia (@amirradnia99) - Backend & serial communication

Reza Faridi (@Faridi1419) - Frontend & dashboard design

🐛 Troubleshooting
Common Issues:
Backend not reachable - Ensure python main.py is running

No module detected - Check USB connection and power

No signal data - Verify SIM card and antenna

API errors - Check if port 8000 is available

Quick Fixes:
Restart backend server

Reconnect EC200U module

Check browser console (F12) for errors

Verify Python dependencies are installed

📄 License
MIT License - see LICENSE file for details.
=======
### Backend (FastAPI Server)
- Real-time serial communication with the EC200U module.
- REST API endpoints for signal monitoring, module info, SIM status, and connection state.
- Automatic port detection and AT command execution with error handling.

### Frontend (Web Dashboard)
- **Real-time Signal Quality Visualization**: RSSI, BER, and Signal strength bars.
- **Modern, Responsive UI**: Designed to work seamlessly across mobile and desktop platforms.
- **Connection Status Monitoring**: Displays real-time connection status and auto-refresh every 2 seconds.
- **Signal Bars**: Color-coded visual indicators of signal quality.
- **Module Information**: Displays module model, revision, and SIM card status.
- **Interactive Controls**: Port scanning, manual connection, and log clearing functionalities.
  
## 📁 Project Structure

### Frontend Features:
- **Signal Monitoring**: Displays real-time RSSI and BER.
- **Visual Indicators**: Color-coded signal strength bars indicating connection quality.
- **Module Info**: Displays manufacturer and revision details.
- **SIM Status**: Shows SIM card readiness.
- **Auto-refresh**: Continuous monitoring every 2 seconds.
- **Responsive Design**: Optimized for both mobile and desktop.

### Backend Features:
- **Automatic AT Port Detection**: Identifies available USB/COM interfaces.
- **AT Command Diagnostics**: `/connect`, `/disconnect`, `/status` endpoints.
- **Error-Handled Serial Communication**: Graceful failure management with buffer resets.

## 📄 Project Setup

### Prerequisites:
- Python 3.8+.
- FastAPI and Uvicorn for backend:
  ```bash
  pip install fastapi uvicorn pyserial
  ```

### Running the Backend:
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ARMEDIA.git
   cd ARMEDIA
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
4. The backend will be available at: `http://127.0.0.1:8000`

### Running the Frontend:
1. Open `index.html` in a web browser to use the dashboard UI.
2. The frontend automatically connects to the backend API to fetch and display the signal status.

## 👥 Contributors

- **Backend Development**: Amir Radnia – Python serial communication, AT command handling, FastAPI backend.
- **Frontend Development**: Reza Faridi – Web interface design, dashboard integration, API interaction.
- **Project Integration**: Amir Radnia & Reza Faridi – System architecture and deployment.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📝 Commit History (Frontend Update)

### Title: 
**Enhance Frontend UI: Real-time signal quality visualization, updated module info display, and connection status features**

### Description:
- Updated `index.html` to improve the layout and add real-time signal quality visualization.
- Enhanced `style.css` with responsive design for mobile and desktop, and improved the signal indicator styling for better visibility.
- Refined `script.js` to support real-time fetching and display of signal quality (RSSI and BER values) from the backend API.
- Integrated auto-refresh functionality with visual feedback for connection status (Connected/Disconnected).
- Added interactive components for managing serial ports, including port scanning and manual connection handling.
- Improved the overall user experience with a more responsive and visually appealing dashboard design.

These changes improve the dashboard's usability and real-time monitoring features, making it easier to track the signal strength and connection status of the EC200U cellular module.

---

## 📄 Troubleshooting

### 1. **No AT port detected**
- Ensure that the **EC200U module** is powered and visible (`/dev/ttyUSB*` or `COMx`).
  
### 2. **CORS or Browser Errors**
- Verify that the backend is running and accessible.
- Ensure the correct URL is used in the `script.js` file to connect to the backend.

### 3. **Unexpected Timeouts**
- Try replacing the USB cable or increasing the serial timeout in `SerialManager`.

### 4. **Log Errors in Dashboard**
- Use the "Clear Log" button to reset the log container and eliminate any error-related information.
>>>>>>> coworker/main
