# Release Checklist

Verwenden Sie diese Checkliste vor jeder Veröffentlichung.

## Pre-Release

- [ ] Alle Features/Bugfixes sind implementiert
- [ ] Code ist committed und gepushed
- [ ] Branch ist aktuell (keine ausstehenden Merges)

## Tests

```bash
# Unit Tests
npm test

# Build
npm run build

# Kompatibilitätstests
npm run test:compat
```

- [ ] Unit Tests bestanden (`npm test`)
- [ ] Build erfolgreich (`npm run build`)
- [ ] Kompatibilitätstests bestanden (`npm run test:compat`)
- [ ] TypeScript kompiliert ohne Fehler

## Dokumentation

- [ ] README.md ist aktuell
- [ ] CHANGELOG.md wurde aktualisiert (falls vorhanden)
- [ ] Neue Features sind dokumentiert
- [ ] Breaking Changes sind klar gekennzeichnet

## Package Validation

```bash
# Package-Inhalt prüfen
npm pack --dry-run

# Lokaler Test
npm link
# In einem Test-Projekt:
npm link runq
```

- [ ] Package enthält alle notwendigen Dateien
- [ ] Keine unnötigen Dateien im Package
- [ ] `dist/` Verzeichnis ist vollständig

## Version & Release

```bash
# Version erhöhen (wählen Sie eine):
npm version patch  # Bugfixes: 0.0.1 → 0.0.2
npm version minor  # Features: 0.0.2 → 0.1.0
npm version major  # Breaking: 0.1.0 → 1.0.0

# Mit Custom Message:
npm version patch -m "Release v%s: Beschreibung"

# Tag pushen (löst GitHub Action aus)
git push origin main --follow-tags
```

- [ ] Richtige Version gewählt (patch/minor/major)
- [ ] Git Tag erstellt
- [ ] Tag zu GitHub gepushed

## GitHub Actions

- [ ] CI Workflow läuft erfolgreich durch
- [ ] Publish Workflow startet automatisch
- [ ] npm-Veröffentlichung erfolgreich

## Nach der Veröffentlichung

```bash
# Package testen
npm install runq
```

- [ ] Package ist auf npm verfügbar
- [ ] Installation funktioniert
- [ ] GitHub Release erstellt (optional)
- [ ] Social Media / Ankündigung (optional)

## Rollback (falls nötig)

Falls die Veröffentlichung fehlerhaft ist:

```bash
# Innerhalb von 72 Stunden:
npm unpublish runq@VERSION

# Danach nur deprecate möglich:
npm deprecate runq@VERSION "Reason for deprecation"
```

## Semantic Versioning Guide

**MAJOR** (x.0.0) - Breaking Changes
- API-Änderungen die nicht rückwärtskompatibel sind
- Entfernte Features
- Geänderte Verhalten

**MINOR** (0.x.0) - New Features
- Neue Features (rückwärtskompatibel)
- Neue Methoden
- Optionale Parameter

**PATCH** (0.0.x) - Bug Fixes
- Bugfixes
- Performance-Verbesserungen
- Dokumentation
- Interne Änderungen

## Schnell-Release (Erfahrene Benutzer)

```bash
# Alles in einem Befehl
npm test && npm run build && npm run test:compat && npm version patch && git push origin main --follow-tags
```

---

**Hinweis:** Die GitHub Action veröffentlicht automatisch zu npm, wenn ein Tag gepusht wird!

