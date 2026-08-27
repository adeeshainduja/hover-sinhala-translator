# Release Checklist

- [ ] Extension and backend tests pass
- [ ] Production backend uses HTTPS
- [ ] Production CORS origins are explicitly configured
- [ ] No API keys or secrets are committed
- [ ] `.env` and virtual environments are ignored
- [ ] Manifest version and permissions reviewed
- [ ] Provider timeout and error mapping reviewed
- [ ] Popup uses safe text rendering
- [ ] Cache, settings, hover, and request lifecycle tested
- [ ] README reviewed
- [ ] Release ZIP created with `npm run package`
- [ ] Chrome unpacked-install test completed

Recommended commit message: `feat: prepare extension for production release`
