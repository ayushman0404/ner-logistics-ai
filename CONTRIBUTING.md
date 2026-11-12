# Contributing to the NER Logistics & Accessibility Intelligence Platform

Thank you for your interest in contributing to the **AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)**!

Whether you are an open-source developer, a GIS engineer, an ML researcher, or a domain specialist in transport logistics, we welcome contributions that strengthen infrastructure resilience in North East India.

---

## 📋 Code of Conduct

All contributors and maintainers are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please ensure respectful and constructive engagement across discussions, issue threads, and pull requests.

---

## 🛠️ Development Setup

### 1. Prerequisites
- Python 3.10, 3.11, or 3.12
- Git
- Modern Web Browser (Chrome, Firefox, Edge, Safari)

### 2. Fork & Clone
```bash
git clone https://github.com/ayushman0404/ner-logistics-ai.git
cd ner-logistics-ai
```

### 3. Create a Virtual Environment
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Start the Server Locally
```bash
python run.py
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🧪 Running Tests & Verifications

Before submitting any code changes, ensure all test suites pass with green checks:

```bash
# Run End-to-End Problem Statement 26002 Verification
python test_complete_platform.py

# Run Integration & Routing Test Suite
python test_integration.py
```

---

## 🌿 Contribution Workflow

1. **Find or Open an Issue**: Review existing [GitHub Issues](https://github.com/ayushman0404/ner-logistics-ai/issues) or submit a new one using our templates.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```
3. **Make Atomic, Well-Documented Commits**:
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add new weather radar caching layer`
   - `fix: correct bridge structural health threshold`
   - `docs: update API endpoints documentation`
   - `test: add test coverage for Manipuri localization`
4. **Push & Create a Pull Request**:
   Push to your fork and submit a PR against `main`. Provide a clear summary of your changes using the [Pull Request Template](.github/pull_request_template.md).

---

## 📐 Architecture & Coding Guidelines

- **Zero External Paid APIs**: All mapping, routing, weather, Doppler radar, and machine learning components must remain 100% free, open, and unrestricted. Do not introduce dependencies requiring paid API keys (e.g. Google Maps paid APIs, commercial translation cloud APIs).
- **Client-Side Localization (`i18n.js`)**: If adding new UI strings, ensure translation entries are provided across all 5 regional languages (English, Assamese, Hindi, Bengali, Manipuri).
- **Backend Cleanliness**: The backend uses Python's high-performance native HTTP architecture. Keep route handlers modular within `backend/`.

---

## 🤝 Questions & Discussion

For questions, feature proposals, or security discussions, open a GitHub Discussion or submit an issue. Thank you for contributing to accessible, intelligent regional infrastructure!
