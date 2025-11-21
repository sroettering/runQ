# GitHub Actions Setup

Dieses Projekt verwendet GitHub Actions für CI/CD (Continuous Integration / Continuous Deployment).

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Trigger:** Push oder Pull Request auf `main`, `master` oder `develop` Branch

**Was wird getestet:**
- ✅ Unit Tests mit Vitest
- ✅ Build-Prozess
- ✅ Kompatibilitätstests (CommonJS, ESM, TypeScript)
- ✅ TypeScript Type-Checking

**Node.js Versionen:**
- Node.js 18.x
- Node.js 20.x
- Node.js 22.x

**Jobs:**
- `test` - Führt alle Tests auf mehreren Node.js-Versionen aus
- `lint` - Überprüft TypeScript Kompilierung

### 2. Publish Workflow (`.github/workflows/publish.yml`)

**Trigger:** Push eines Git-Tags mit `v*` (z.B. `v1.0.0`, `v0.0.2`)

**Schritte:**
1. ✅ Checkout Code
2. ✅ Node.js Setup
3. ✅ Dependencies installieren
4. ✅ Unit Tests ausführen
5. ✅ Package bauen
6. ✅ Kompatibilitätstests ausführen
7. ✅ Zu npm veröffentlichen (mit Provenance)

## Setup für npm-Veröffentlichung

### 1. NPM_TOKEN erstellen

1. Gehen Sie zu [npmjs.com](https://www.npmjs.com)
2. Melden Sie sich an
3. Gehen Sie zu **Account Settings** → **Access Tokens**
4. Klicken Sie auf **Generate New Token** → **Classic Token**
5. Wählen Sie **Automation** als Token-Typ
6. Kopieren Sie den Token

### 2. GitHub Secret hinzufügen

1. Gehen Sie zu Ihrem GitHub Repository
2. Klicken Sie auf **Settings** → **Secrets and variables** → **Actions**
3. Klicken Sie auf **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Fügen Sie Ihren npm-Token ein
6. Klicken Sie auf **Add secret**

### 3. Package.json vorbereiten

Stellen Sie sicher, dass Ihre `package.json` folgende Felder hat:

```json
{
  "name": "worker-queue",
  "version": "0.0.1",
  "description": "A lightweight, flexible task queue for Node.js",
  "author": "Ihr Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/IhrUsername/worker-queue.git"
  },
  "keywords": [
    "queue",
    "task-queue",
    "concurrency",
    "async",
    "typescript"
  ]
}
```

## Veröffentlichungsprozess

### Manuell veröffentlichen

```bash
# 1. Version erhöhen
npm version patch  # oder minor / major

# 2. Git Tag pushen
git push origin main --tags
```

### Automatisch mit Git Tags

```bash
# Version in package.json erhöhen und Git Tag erstellen
npm version patch -m "Release v%s"

# Alles pushen (Code + Tag)
git push origin main --follow-tags
```

Die GitHub Action wird automatisch ausgelöst und veröffentlicht das Package zu npm!

## Versioning

Folgen Sie [Semantic Versioning](https://semver.org/):

- **patch** (0.0.x) - Bugfixes
- **minor** (0.x.0) - Neue Features (rückwärtskompatibel)
- **major** (x.0.0) - Breaking Changes

```bash
npm version patch  # 0.0.1 → 0.0.2
npm version minor  # 0.0.2 → 0.1.0
npm version major  # 0.1.0 → 1.0.0
```

## Workflow-Status Badges

Fügen Sie diese Badges zu Ihrer `README.md` hinzu:

```markdown
[![CI](https://github.com/IhrUsername/worker-queue/actions/workflows/ci.yml/badge.svg)](https://github.com/IhrUsername/worker-queue/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/worker-queue.svg)](https://www.npmjs.com/package/worker-queue)
```

## Troubleshooting

### Problem: npm publish schlägt fehl mit 403 Forbidden

**Lösung:**
1. Überprüfen Sie, ob der `NPM_TOKEN` korrekt als GitHub Secret gesetzt ist
2. Stellen Sie sicher, dass der Token die **Automation**-Berechtigung hat
3. Überprüfen Sie, ob der Package-Name auf npm verfügbar ist

### Problem: Tests schlagen fehl

**Lösung:**
1. Führen Sie die Tests lokal aus: `npm test`
2. Überprüfen Sie die GitHub Actions Logs
3. Stellen Sie sicher, dass alle Dependencies in `package.json` aufgelistet sind

### Problem: Build schlägt fehl

**Lösung:**
1. Führen Sie den Build lokal aus: `npm run build`
2. Überprüfen Sie `tsup.config.ts` und `tsconfig.json`
3. Stellen Sie sicher, dass alle TypeScript-Fehler behoben sind

### Problem: Workflow wird nicht ausgelöst

**Lösung:**
1. Überprüfen Sie den Branch-Namen in `.github/workflows/ci.yml`
2. Für Publish: Stellen Sie sicher, dass der Tag mit `v` beginnt (z.B. `v1.0.0`)
3. Überprüfen Sie die Workflow-Berechtigungen in Repository Settings

## Lokale Tests vor Veröffentlichung

Bevor Sie veröffentlichen, führen Sie lokal aus:

```bash
# Alle Tests
npm test

# Build
npm run build

# Kompatibilitätstests
npm run test:compat

# Package-Vorschau
npm pack --dry-run
```

## Weitere Ressourcen

- [GitHub Actions Dokumentation](https://docs.github.com/en/actions)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)

