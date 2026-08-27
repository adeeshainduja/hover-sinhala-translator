# Release Candidate Checklist

- [ ] Version is `1.0.0` in manifest and package metadata
- [ ] CI passes
- [ ] Extension tests and backend tests pass
- [ ] Production build and release ZIP pass validation
- [ ] No secrets are present in Git or the ZIP
- [ ] Manifest and permissions reviewed
- [ ] Privacy policy and store description reviewed
- [ ] Screenshots and icons prepared
- [ ] Backend deployed with HTTPS and production CORS
- [ ] `/health` works
- [ ] End-to-end, cache, settings, and error flows tested
- [ ] Rollback plan reviewed

Tags are created manually only after approval, for example: `git tag v1.0.0`.
