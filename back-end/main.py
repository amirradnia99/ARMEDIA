from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import serial
import serial.tools.list_ports
import time
import uvicorn

app = FastAPI(title="EC200U Dashboard API")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration - from coworker's code
BAUDRATE = 115200
TIMEOUT = 2

# Your coworker's functions (copy exactly)
def find_at_port():
    print("Scanning for AT command port...")
    ports = list(serial.tools.list_ports.comports())
    candidates = [p.device for p in ports if "USB" in p.device or "COM" in p.device]
    
    for port in candidates:
        try:
            print(f"Testing {port}...", end="", flush=True)
            with serial.Serial(port, BAUDRATE, timeout=1) as ser:
                ser.reset_input_buffer()
                ser.write(b"AT\r\n")
                start = time.time()
                while (time.time() - start) < 1.0:
                    line = ser.readline().decode('utf-8', errors='ignore').strip()
                    if "OK" in line:
                        print(" Found!")
                        return port
            print(" No response.")
        except (OSError, serial.SerialException):
            print(" Busy/Error.")
            pass
    return None

def send_at_command(ser, cmd, timeout=TIMEOUT):
    try:
        full_cmd = cmd + "\r\n"
        ser.write(full_cmd.encode())
        response_lines = []
        start_time = time.time()
        
        while (time.time() - start_time) < timeout:
            line_bytes = ser.readline()
            if not line_bytes:
                continue
            line = line_bytes.decode('utf-8', errors='ignore').strip()
            if not line or line == cmd:
                continue
            response_lines.append(line)
            if line == "OK":
                return {"status": "success", "data": response_lines}
            if "ERROR" in line:
                return {"status": "error", "data": response_lines}
        return {"status": "timeout", "data": response_lines}
    except serial.SerialException as e:
        return {"status": "comm_error", "data": [str(e)]}

# Global serial connection
ser_connection = None

@app.on_event("startup")
def startup_event():
    global ser_connection
    print("🔍 Looking for EC200U module...")
    port = find_at_port()
    if port:
        try:
            ser_connection = serial.Serial(port, BAUDRATE, timeout=1)
            send_at_command(ser_connection, "ATE0")
            print(f"✅ Connected to {port}")
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            ser_connection = None
    else:
        print("❌ No EC200U module found")

# API Endpoints
@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "connected": ser_connection is not None,
        "service": "EC200U Dashboard API"
    }

@app.get("/api/signal")
async def get_signal():
    if not ser_connection:
        raise HTTPException(status_code=503, detail="Module not connected")
    
    result = send_at_command(ser_connection, "AT+CSQ")
    return result

@app.get("/api/info")
async def get_module_info():
    if not ser_connection:
        raise HTTPException(status_code=503, detail="Module not connected")
    
    module_info = send_at_command(ser_connection, "ATI")
    sim_status = send_at_command(ser_connection, "AT+CPIN?")
    
    return {
        "module": module_info,
        "sim": sim_status
    }

@app.get("/api/command/{cmd}")
async def send_command(cmd: str):
    if not ser_connection:
        raise HTTPException(status_code=503, detail="Module not connected")
    
    result = send_at_command(ser_connection, cmd)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)