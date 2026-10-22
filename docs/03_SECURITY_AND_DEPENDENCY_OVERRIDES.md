# Security Hardening & Dependency Overrides (`unison-admin-dashboard-main`)

This document records the vulnerability audit results, patched advisories, and the exact npm override strategy configured in `package.json`.

---

## 1. Vulnerability Audit History

Prior to hardening, `npm audit` flagged **16 vulnerabilities (2 critical, 5 high, 9 moderate)** in dependencies. All have been neutralized.

### 1.1 Critical Vulnerabilities Fixed
1. **Tinypool Prototype Pollution to RCE (GHSA-5gmw-xhrv-c9v3, GHSA-85c8-ppgw-ccpr)**:
   - Severity: Critical (CVSS 9.8).
   - Mechanism: Prototype pollution gadget in worker options allowed remote code execution via test execution pools.
   - Fix: Upgraded `vitest` to `^5.0.5` and configured `"tinypool": "^2.1.2"` override.

2. **React Router SSR Hydration & Constructor Injection (GHSA-337j-9hxr-rhxg, GHSA-wrjc-x8rr-h8h6)**:
   - Severity: Moderate / High.
   - Mechanism: Arbitrary constructor injection via `deserializeErrors()` and backslash open-redirect bypass.
   - Fix: Upgraded direct dependency `react-router-dom` to `^7.18.4`.

3. **Quill Cross-Site Scripting (GHSA-4943-9vgg-gr5r)**:
   - Severity: Moderate.
   - Mechanism: HTML export feature permitted script injection in Quill <= 1.3.7.
   - Fix: Replaced `react-quill` with `react-quill-new` (version `3.7.0`), locked `quill` to `2.0.2` via nested override.

---

## 2. Configured Overrides in `package.json`

The following overrides block in [`package.json`](file:///c:/Users/ranah/Desktop/Unison/unison-admin-dashboard-main/package.json) prevents npm from pulling vulnerable sub-dependencies:

```json
{
  "dependencies": {
    "react-quill-new": "3.7.0",
    "react-router-dom": "^7.18.4"
  },
  "devDependencies": {
    "vitest": "^5.0.5"
  },
  "overrides": {
    "react-quill-new": {
      "quill": "2.0.2"
    },
    "quill": "2.0.2",
    "chokidar": "^4.0.3",
    "braces": "^3.0.3",
    "micromatch": "^4.0.8",
    "tinypool": "^2.1.2",
    "postcss-selector-parser": "^7.1.6",
    "@vitest/mocker": "^4.1.12"
  }
}
```

> **IMPORTANT**:
> Do NOT run `npm audit fix --force` as it may attempt to downgrade `react-quill-new` to ancient `0.0.2` or upgrade Tailwind to v4 (which introduces breaking changes to existing config). The overrides block guarantees clean production builds while securing the application.
