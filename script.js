class CellularDashboard {
    constructor() {
        this.isConnected = false;
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.apiBase = 'http://127.0.0.1:8000'; // Points to your Python Backend

        this.initializeEventListeners();
        this.log('Dashboard loaded. Click "Connect" to start simulation.', 'info');
    }

    initializeEventListeners() {
        document.getElementById('connectBtn').addEventListener('click', () => this.toggleConnection());
        document.getElementById('clearLog').addEventListener('click', () => this.clearLog());
        
        document.getElementById('autoRefresh').addEventListener('change', (e) => {
            this.autoRefresh = e.target.checked;
            if (this.autoRefresh && this.isConnected) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }
        });
    }

    async toggleConnection() {
        if (this.isConnected) {
            await this.disconnect();
        } else {
            await this.connect();
        }
    }

    async connect() {
        this.log('Connecting to backend...', 'info');
        try {
            const response = await fetch(`${this.apiBase}/connect`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Connection failed');
            }

            const data = await response.json();
            this.isConnected = true;
            this.updateConnectionStatus(true);
            
            document.getElementById('portInfo').textContent = data.port;
            this.log(`✅ ${data.message || 'Connected successfully'}`, 'success');

            await this.fetchStatus();

            if (this.autoRefresh) this.startAutoRefresh();

        } catch (error) {
            this.log(`❌ Connection failed: ${error.message}`, 'error');
            console.error('Connection error:', error);
        }
    }

    async disconnect() {
        try {
            await fetch(`${this.apiBase}/disconnect`, { method: 'POST' });
        } catch (error) {
            console.error('Disconnect error:', error);
        }
        
        this.isConnected = false;
        this.stopAutoRefresh();
        this.updateConnectionStatus(false);
        this.log('🔌 Disconnected', 'info');
        this.resetUI();
    }

    async fetchStatus() {
        if (!this.isConnected) return;

        try {
            const response = await fetch(`${this.apiBase}/status`);
            if (!response.ok) throw new Error('Failed to fetch status');
            
            const data = await response.json();
            
            // Pass the "data" array from the JSON response
            this.processInfo(data.info ? data.info.data : []);
            this.processSIM(data.sim ? data.sim.data : []);
            this.processSignal(data.signal ? data.signal.data : []);
            
            this.updateLastUpdateTime();

        } catch (error) {
            // Only log error if we haven't already cleaned up
            if (this.isConnected) {
                this.log(`❌ Status error: ${error.message}`, 'error');
                await this.disconnect();
            }
        }
    }

    processInfo(lines) {
        if (lines && lines.length > 0) {
            document.getElementById('modelInfo').textContent = lines[0] || '--';
        }
    }

    processSIM(lines) {
        if (!lines) return;
        const line = lines.find(l => l.includes('+CPIN:'));
        if (line) {
            const status = line.split(':')[1]?.trim() || 'Unknown';
            document.getElementById('simStatus').textContent = status;
        }
    }

    processSignal(lines) {
        if (!lines) return;
        const csqLine = lines.find(l => l.includes('+CSQ:'));
        if (csqLine) {
            const match = csqLine.match(/\+CSQ:\s*(\d+),(\d+)/);
            if (match) {
                const rssi = parseInt(match[1]);
                const ber = parseInt(match[2]);
                
                document.getElementById('signalValue').textContent = rssi;
                document.getElementById('rssiValue').textContent = this.rssiToDbm(rssi);
                document.getElementById('berValue').textContent = ber + '%';
                document.getElementById('qualityText').textContent = this.getQualityText(rssi);
                this.updateSignalBars(rssi);
            }
        }
    }

    rssiToDbm(rssi) {
        if (rssi === 0) return '-113 dBm or less';
        if (rssi === 1) return '-111 dBm';
        if (rssi >= 2 && rssi <= 30) return (-109 + 2 * (rssi - 2)) + ' dBm';
        if (rssi === 31) return '-51 dBm or greater';
        return 'Unknown';
    }

    getQualityText(rssi) {
        if (rssi >= 25) return 'Excellent';
        if (rssi >= 20) return 'Very Good';
        if (rssi >= 15) return 'Good';
        if (rssi >= 10) return 'Fair';
        if (rssi >= 5) return 'Poor';
        return 'Very Poor';
    }

    updateSignalBars(rssi) {
        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => bar.classList.remove('active'));
        if (rssi >= 10) bars[0].classList.add('active');
        if (rssi >= 15) bars[1].classList.add('active');
        if (rssi >= 20) bars[2].classList.add('active');
        if (rssi >= 25) bars[3].classList.add('active');
        if (rssi >= 30) bars[4].classList.add('active');
    }

    updateConnectionStatus(connected) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.connection-status span:last-child');
        const connectBtn = document.getElementById('connectBtn');

        if (connected) {
            statusDot.classList.add('connected');
            statusText.textContent = 'Connected';
            connectBtn.innerHTML = '<i class="fas fa-plug"></i> Disconnect';
            connectBtn.classList.replace('btn-primary', 'btn-secondary');
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'Disconnected';
            connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect to Backend';
            connectBtn.classList.replace('btn-secondary', 'btn-primary');
        }
    }

    resetUI() {
        document.getElementById('portInfo').textContent = '--';
        document.getElementById('modelInfo').textContent = '--';
        document.getElementById('simStatus').textContent = '--';
        document.getElementById('signalValue').textContent = '--';
        document.getElementById('rssiValue').textContent = '-- dBm';
        this.updateSignalBars(0);
    }

    updateLastUpdateTime() {
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    }

    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshInterval = setInterval(() => this.fetchStatus(), 2000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
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
        document.getElementById('logContainer').innerHTML = '';
        this.log('Log cleared', 'info');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CellularDashboard();
});