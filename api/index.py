import sys
import os

# Add project root to path so `backend` package can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app  # noqa: F401  - Vercel detects the ASGI `app` variable
