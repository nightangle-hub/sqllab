# SQL Lab

12 fictional banking investigations with embedded SQLite and offline SQL coaching.

## Run

Open `index.html` in a browser that supports JavaScript and Web Workers, or serve it with any static web host. No installation, build step, backend or external API is required. SQLite licence notices are included in the HTML.

Drafts and progress save in the current browser when storage is available. Progress does not automatically transfer between devices, browsers or domains. Downloaded HTML works offline; a hosted first visit requires internet and does not install an offline cache.

## Verification

The exported HTML matches `SQL-Lab-Guided-Final.html` exactly (SHA-256: `8b41476af8c08455f9a36591ad1dfc7927f791bbe8927ac4a80a4fdd21faf983`).

Passed: static startup under `/sqllab/`, all 12 canonical solutions with network offline, solution gating on an incorrect attempt, draft persistence on reload, standalone offline startup and query execution. No external HTTP requests or uncaught page errors were observed. Physical iPhone Safari remains unverified.

## Optional GitHub Pages setup

Publishing is pending owner approval. Once the pull request is approved and merged, an administrator can select **Settings → Pages → Deploy from a branch → main → /(root) → Save**. No build configuration is required.

The expected default address is https://nightangle-hub.github.io/sqllab/; this address is not a verified live deployment.

[GitHub Pages setup documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
