"""
Launcher for NER AI Logistics Intelligence Platform
Starts the backend REST server and serves the web frontend.
"""

import sys
import os
import webbrowser

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import run_server

if __name__ == "__main__":
    port = 8080
    url = f"http://localhost:{port}"
    print("=" * 70)
    print("  AI-Based Smart Logistics & Accessibility Intelligence Platform")
    print("  North Eastern Region (NER) • Phase 1 Multi-Corridor Routing")
    print("=" * 70)
    print(f"  Server URL: {url}")
    print("  Press Ctrl+C to terminate.")
    print("=" * 70)

    try:
        run_server(port)
    except KeyboardInterrupt:
        print("\nShutting down server gracefully.")
