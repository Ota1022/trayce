# Raycast Store Submission Checklist

## ✅ Completed Requirements

- [x] **Author username** in package.json (`ota1022`)
- [x] **License** set to MIT in package.json
- [x] **package-lock.json** present (using npm)
- [x] **Build script** configured and passing
- [x] **Lint script** configured and passing
- [x] **Icon** is 512x512px PNG format
- [x] **Command naming** follows guidelines
- [x] **Preferences API** properly configured
- [x] **README.md** with setup instructions
- [x] **API key documentation** included

## ❌ Missing Requirements

### Critical (Must Have Before Submission)

- [x] **CHANGELOG.md** - Create changelog file in root directory
  - Format: `## [Change Title] - {PR_MERGE_DATE}`
  - Document notable changes for each release

- [x] **LICENSE** - Add MIT license file
  - Include full MIT license text in root directory

- [x] **Categories** - Add categories field to package.json
  - Add at least one category in Title Case
  - Suggested: `"categories": ["Productivity", "Documentation"]`

- [ ] **Screenshots** - Create 3-6 screenshots (2000x1250px PNG)
  - Show extension in use within Raycast
  - Use consistent backgrounds with good contrast
  - Avoid sensitive data
  - Place in `metadata/` or `media/` folder

### Recommended Improvements

- [x] **Extension Title** - Consider more descriptive title
  - Current: "Trayce"
  - Suggested: "Trayce - Procedure Documentation" or similar

- [x] **Latest API Version** - Verify using latest @raycast/api
  - Current: `^1.89.4`
  - Check for updates before submission


## 📋 Pre-Submission Final Checks

- [x] Run `npm run build` successfully
- [x] Run `npm run lint` with no errors
- [ ] Test all commands work as expected
- [ ] Verify API key setup flow
- [ ] Review all documentation for clarity
- [ ] Check for typos in README and package.json
- [ ] Ensure no sensitive data in code or screenshots

## 📚 Reference

- Store Preparation Guide: https://developers.raycast.com/basics/prepare-an-extension-for-store
- Icon Generator: https://icon.ray.so
- Raycast Categories: Productivity, Developer Tools, Documentation, Communication, Data, Design Tools, Finance, Fun, Media, News, Productivity, Security, System, Web

## 🎯 Priority Order

1. Create CHANGELOG.md
2. Add LICENSE file
3. Add categories to package.json
4. Create screenshots (2000x1250px)
5. Review and test everything
6. Submit to store
