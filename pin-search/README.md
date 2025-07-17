# Pinterest Image Search API

This project provides an API to search Pinterest and stream image URLs using Selenium and FastAPI.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Download ChromeDriver:**
   - Make sure you have Chrome installed.
   - Download the matching ChromeDriver from https://chromedriver.chromium.org/downloads
   - Place it in your PATH or specify its path in the script if needed.

3. **Run the API server:**
   ```bash
   uvicorn pinterest_api:app --reload
   ```

## Usage

Send a POST request to `/search` with a JSON body containing your search term:

```
curl -X POST "http://127.0.0.1:8000/search" \
     -H "Content-Type: application/json" \
     -d '{"search_term": "batman"}'
```

The response will be a stream of image URLs (one per line).

## Notes
- The default Pinterest credentials are hardcoded for demo. You can pass them in the request body if needed.
- This script uses Selenium in headless mode and requires a working Chrome/Chromedriver setup.
- For production, consider using environment variables for credentials and running with proper error handling/security. 