#!/usr/bin/env python3
import http.server
import urllib.request
import json
from urllib.parse import urlparse, parse_qs
import sys

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    LOCAL_URL = "http://localhost:3000"
    
    def do_GET(self):
        try:
            # Forward GET requests to local server
            url = self.LOCAL_URL + self.path
            req = urllib.request.Request(url)
            
            with urllib.request.urlopen(req, timeout=10) as response:
                content = response.read()
                self.send_response(response.status)
                
                for header, value in response.headers.items():
                    self.send_header(header, value)
                self.end_headers()
                self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            url = self.LOCAL_URL + self.path
            req = urllib.request.Request(url, data=body, method='POST')
            req.add_header('Content-type', self.headers.get('Content-type', 'application/json'))
            
            with urllib.request.urlopen(req, timeout=10) as response:
                content = response.read()
                self.send_response(response.status)
                
                for header, value in response.headers.items():
                    self.send_header(header, value)
                self.end_headers()
                self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def log_message(self, format, *args):
        print(f"[{self.client_address[0]}] {format % args}")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = http.server.HTTPServer(("", port), ProxyHandler)
    print(f"✓ ReviewIntels proxy running on port {port}")
    print(f"  -> Forwarding to http://localhost:3000")
    server.serve_forever()
