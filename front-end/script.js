class CellularDashboard {
    constructor() {
        this.isConnected = false;
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.apiBase = 'http://127.0.0.1:8000';

        this.initializeEventListeners();
        this.log('Dashboard loaded. Click "Connect to Backend" to start.', 'info');
        
        // Auto-check backend health
        this.checkBackendHealth();
    }

    initializeEventListeners() {
        document.getElementById('connectBtn').addEventListener('click', () => this.toggleConnection());
        document.getElementById('refreshBtn').addEventListener('click', () => this.fetchStatus());
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

    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.apiBase}/api/health`);
            const data = await response.json();
            if (data.connected) {
                this.log('✅ Backend is running and connected to module', 'success');
                this.isConnected = true;
                this.updateConnectionStatus(true);
                this.fetchStatus();
                if (this.autoRefresh) this.startAutoRefresh();
            } else {
                this.log('⚠️ Backend is running but no module connected', 'warning');
            }
        } catch (error) {
            this.log('❌ Backend not reachable. Start backend server first.', 'error');
        }
    }

    async toggleConnection() {
        if (this.isConnected) {
            await this.disconnect();
        } else {
            await this.connect();
        }
    }

    async connect() {
        this.log('Checking backend connection...', 'info');
        try {
            const health = await fetch(`${this.apiBase}/api/health`);
            const data = await health.json();
            
            if (data.connected) {
                this.isConnected = true;
                this.updateConnectionStatus(true);
                this.log('✅ Connected to backend and module', 'success');
                await this.fetchStatus();
                if (this.autoRefresh) this.startAutoRefresh();
            } else {
                this.log('❌ Backend running but no module connected', 'error');
            }
        } catch (error) {
            this.log('❌ Cannot connect to backend. Is it running?', 'error');
        }
    }

    async disconnect() {
        this.isConnected = false;
        this.stopAutoRefresh();
        this.updateConnectionStatus(false);
        this.log('🔌 Disconnected from monitoring', 'info');
        this.resetUI();
    }

    async fetchStatus() {
        if (!this.isConnected) return;

        try {
            // Get signal
            const signalRes = await fetch(`${this.apiBase}/api/signal`);
            const signalData = await signalRes.json();
            
            // Get module info
            const infoRes = await fetch(`${this.apiBase}/api/info`);
            const infoData = await infoRes.json();
            
            // Process all data
            this.processSignal(signalData.data || []);
            
            if (infoData.module) {
                this.processInfo(infoData.module.data || []);
            }
            if (infoData.sim) {
                this.processSIM(infoData.sim.data || []);
            }
            
            this.updateLastUpdateTime();

        } catch (error) {
            this.log(`❌ Status error: ${error.message}`, 'error');
            if (this.isConnected) {
                await this.disconnect();
            }
        }
    }

    // Keep all his other methods as-is:
    // processInfo, processSIM, processSignal, rssiToDbm, etc.
    // ...
}