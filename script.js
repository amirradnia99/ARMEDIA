class CellularDashboard {
    constructor() {
        this.serialPort = null;
        this.reader = null;
        this.writer = null;
        this.isConnected = false;
        this.autoRefresh = true;
        this.refreshInterval = null;
        
        this.initializeEventListeners();
        this.log('Dashboard initialized. Click Connect to start monitoring.', 'info');
    }

    initializeEventListeners() {
        // Button event listeners
        document.getElementById('connectBtn').addEventListener('click', () => this.toggleConnection());
        document.getElementById('refreshBtn').addEventListener('click', () => this.manualRefresh());
        document.getElementById('scanBtn').addEventListener('click', () => this.scanPorts());
        document.getElementById('clearLog').addEventListener('click', () => this.clearLog());
        
        // Auto-refresh toggle
        document.getElementById('autoRefresh').addEventListener('change', (e) => {
            this.autoRefresh = e.target.checked;
            if (this.autoRefresh && this.isConnected) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }
        });

        // Modal event listeners
        document.querySelector('.close-btn').addEventListener('click', () => this.hideModal());
        document.getElementById('refreshPorts').addEventListener('click', () => this.scanPorts());
        document.getElementById('connectManual').addEventListener('click', () => this.connectToSelectedPort());
        
        // Close modal when clicking outside
        document.getElementById('connectionModal').addEventListener('click', (e) => {
            if (e.target.id === 'connectionModal') {
                this.hideModal();
            }
        });
    }

    async toggleConnection() {
        if (this.isConnected) {
            await this.disconnect();
        } else {
            await this.showPortSelection();
        }
    }

    async showPortSelection() {
        await this.scanPorts();
        this.showModal();
    }

    async scanPorts() {
        try {
            const ports = await navigator.serial.getPorts();
            this.displayPorts(ports);
            this.log(`Found ${ports.length} serial port(s)`, 'info');
        } catch (error) {
            this.log('Error scanning ports: ' + error.message, 'error');
        }
    }

    displayPorts(ports) {
        const portList = document.getElementById('portList');
        portList.innerHTML = '';

        if (ports.length === 0) {
            portList.innerHTML = '<div class="port-item">No serial ports found</div>';
            return;
        }

        ports.forEach(port => {
            const portItem = document.createElement('div');
            portItem.className = 'port-item';
            portItem.textContent = port.getInfo().usbProductId ? 
                `USB Device (Product ID: ${port.getInfo().usbProductId})` : 
                'Serial Port';
            
            portItem.addEventListener('click', () => {
                document.querySelectorAll('.port-item').forEach(item => item.classList.remove('selected'));
                portItem.classList.add('selected');
                document.getElementById('connectManual').disabled = false;
                this.selectedPort = port;
            });

            portList.appendChild(portItem);
        });
    }

    async connectToSelectedPort() {
        if (!this.selectedPort) {
            this.log('Please select a port first', 'warning');
            return;
        }

        try {
            await this.selectedPort.open({ baudRate: 115200 });
            this.serialPort = this.selectedPort;
            this.writer = this.serialPort.writable.getWriter();
            this.reader = this.serialPort.readable.getReader();
            
            this.isConnected = true;
            this.updateConnectionStatus();
            this.hideModal();
            
            this.log('Connected to serial port', 'success');
            await this.initializeModule();
            
            if (this.autoRefresh) {
                this.startAutoRefresh();
            }
            
        } catch (error) {
            this.log('Connection failed: ' + error.message, 'error');
        }
    }

    async initializeModule() {
        // Turn off echo
        await this.sendATCommand('ATE0');
        
        // Get module info
        const info = await this.sendATCommand('ATI');
        if (info.status === 'success') {
            this.updateModuleInfo(info.data);
        }
        
        // Check SIM status
        const simStatus = await this.sendATCommand('AT+CPIN?');
        if (simStatus.status === 'success') {
            this.updateSIMStatus(simStatus.data);
        }
    }

    async sendATCommand(command, timeout = 2000) {
        if (!this.writer) {
            return { status: 'error', data: ['Not connected'] };
        }

        try {
            // Send command
            const encoder = new TextEncoder();
            await this.writer.write(encoder.encode(command + '\r\n'));
            
            this.log(`Sent: ${command}`, 'info');
            
            // Read response
            let response = '';
            const startTime = Date.now();
            
            while (Date.now() - startTime < timeout) {
                const { value, done } = await this.reader.read();
                
                if (done) break;
                
                const chunk = new TextDecoder().decode(value);
                response += chunk;
                
                // Check for termination
                if (response.includes('OK') || response.includes('ERROR')) {
                    break;
                }
            }
            
            const lines = response.split('\r\n')
                .filter(line => line && !line.includes(command))
                .map(line => line.trim());
                
            const status = response.includes('OK') ? 'success' : 
                          response.includes('ERROR') ? 'error' : 'timeout';
                          
            this.log(`Received: ${lines.join(' | ')}`, 'info');
            
            return { status, data: lines };
            
        } catch (error) {
            this.log('Command error: ' + error.message, 'error');
            return { status: 'error', data: [error.message] };
        }
    }

    async manualRefresh() {
        if (!this.isConnected) return;
        await this.checkSignalQuality();
    }

    async checkSignalQuality() {
        const result = await this.sendATCommand('AT+CSQ');
        
        if (result.status === 'success') {
            const csqLine = result.data.find(line => line.includes('+CSQ:'));
            if (csqLine) {
                this.updateSignalQuality(csqLine);
            }
        }
        
        this.updateLastUpdateTime();
    }

    updateSignalQuality(csqLine) {
        // Parse +CSQ: <rssi>,<ber>
        const match = csqLine.match(/\+CSQ:\s*(\d+),(\d+)/);
        if (!match) return;
        
        const rssi = parseInt(match[1]);
        const ber = parseInt(match[2]);
        
        // Update signal bars
        this.updateSignalBars(rssi);
        
        // Update values
        document.getElementById('signalValue').textContent = rssi;
        document.getElementById('rssiValue').textContent = this.rssiToDbm(rssi) + ' dBm';
        document.getElementById('berValue').textContent = ber + ' %';
        document.getElementById('qualityText').textContent = this.getQualityText(rssi);
    }

    updateSignalBars(rssi) {
        const bars = document.querySelectorAll('.bar');
        
        // Reset all bars
        bars.forEach(bar => bar.classList.remove('active'));
        
        // Activate bars based on RSSI
        if (rssi >= 10) bars[0].classList.add('active');
        if (rssi >= 15) bars[1].classList.add('active');
        if (rssi >= 20) bars[2].classList.add('active');
        if (rssi >= 25) bars[3].classList.add('active');
        if (rssi >= 30) bars[4].classList.add('active');
    }

    rssiToDbm(rssi) {
        // Convert RSSI to dBm (approximate conversion)
        if (rssi === 0) return '-113 dBm or less';
        if (rssi === 1) return '-111 dBm';
        if (rssi >= 2 && rssi <= 30) return -109 + 2 * (rssi - 2) + ' dBm';
        if (rssi === 31) return '-51 dBm or greater';
        return 'Unknown';
    }

    getQualityText(rssi) {
        if (rssi >= 20) return 'Excellent';
        if (rssi >= 15) return 'Good';
        if (rssi >= 10) return 'Fair';
        if (rssi >= 5) return 'Poor';
        return 'Very Poor';
    }

    updateModuleInfo(infoLines) {
        if (infoLines.length > 0) {
            document.getElementById('modelInfo').textContent = infoLines[0];
        }
        if (infoLines.length > 1) {
            document.getElementById('revisionInfo').textContent = infoLines[1];
        }
    }

    updateSIMStatus(simLines) {
        const simLine = simLines.find(line => line.includes('+CPIN:'));
        if (simLine) {
            const status = simLine.split(':')[1]?.trim() || 'Unknown';
            document.getElementById('simStatus').textContent = status;
        }
    }

    updateLastUpdateTime() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = 
            now.toLocaleTimeString();
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const statusDot = statusElement.querySelector('.status-dot');
        const connectBtn = document.getElementById('connectBtn');
        const refreshBtn = document.getElementById('refreshBtn');

        if (this.isConnected) {
            statusDot.classList.add('connected');
            statusElement.querySelector('span:last-child').textContent = 'Connected';
            connectBtn.innerHTML = '<i class="fas fa-plug"></i> Disconnect';
            refreshBtn.disabled = false;
        } else {
            statusDot.classList.remove('connected');
            statusElement.querySelector('span:last-child').textContent = 'Disconnected';
            connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect';
            refreshBtn.disabled = true;
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshInterval = setInterval(() => {
            if (this.isConnected) {
                this.checkSignalQuality();
            }
        }, 2000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async disconnect() {
        this.stopAutoRefresh();
        
        if (this.reader) {
            await this.reader.cancel();
            this.reader = null;
        }
        
        if (this.writer) {
            await this.writer.close();
            this.writer = null;
        }
        
        if (this.serialPort) {
            await this.serialPort.close();
            this.serialPort = null;
        }
        
        this.isConnected = false;
        this.updateConnectionStatus();
        this.log('Disconnected from serial port', 'info');
    }

    showModal() {
        document.getElementById('connectionModal').classList.add('show');
    }

    hideModal() {
        document.getElementById('connectionModal').classList.remove('show');
    }

    log(message, type = 'info') {
        const logContainer = document.getElementById('logContainer');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> <span>${message}</span>`;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    clearLog() {
        document.getElementById('logContainer').innerHTML = 
            '<div class="log-entry info"><span class="timestamp">[00:00:00]</span><span>Log cleared</span></div>';
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CellularDashboard();
});