# Strapi Custom API Builder plugin

Design your custom API's (or custom reports / or custom views) directly from the [Strapi CMS](https://github.com/strapi/strapi) admin panel. Simply select the fields you need to show, enter a valid slug and let the plugin magically create the routes, controllers & services for you. Very easy to create & even easier to maintain.
&nbsp;

![custom-api-builder-ss-3](https://user-images.githubusercontent.com/34507994/172046114-2cc9bf30-b2f1-4bec-9a60-b6a3117c61bc.png)

&nbsp;
## ⚙️ Versions

**Strapi v5** - (current) - [v2.x](https://github.com/vivmagarwal/strapi-plugin-custom-api-builder)
**Strapi v4** - (legacy) - [v1.x](https://github.com/vivmagarwal/strapi-plugin-custom-api-builder)

&nbsp;

## 🎯 Breaking changes in v2 (Strapi v5 Support)
- **Strapi 5 Compatibility**: Fully migrated to Strapi v5 APIs
- **Document Service API**: Migrated from Entity Service to Document Service API  
- **Helper Plugin Removed**: Custom implementation of translation utilities
- **React Router v6**: Updated to use React Router DOM v6
- **Design System Updates**: Updated to simplified Design System imports
- **Peer Dependencies**: Now requires `@strapi/strapi: ^5.0.0`
- **Required Dependencies**: Users must install additional dependencies (see installation)

## Breaking changes in v1
- Support for media & multiple media added
- Support for multiple relationships at the same level added
- The above features makes it incompatible with v0.x. The current version wont work with the custom API's created with v0.x.

## ✅ Production Ready

**v2.0.0 is production ready!** The plugin has been fully migrated to Strapi v5 and thoroughly tested. All core functionality is working and the plugin is actively maintained. 

## 🚧 Roadmap

- [x] Build an API Visually from the Admin UI
- [x] Auto compose Routes, Controllers and Services
- [ ] Complete UI tests
- [ ] Use built in slug system to auto generate slugs and validate if they are unique
- [ ] Add filtering capabilities
- [ ] Add ordering/sorting capabilities
- [ ] Add pagination capabilities
- [ ] Robust way to handle both multi / single value
- [x] Manage multiple relations
- [x] Support Media & Multiple Media
- [x] Disable if no content types
- [ ] Improve UI for scalability
- [ ] When we have a field in the builder and its deleted from the content-type, handle it in a graceful way
- [ ] When we have a new field, show it in the builder while editing
- [ ] Provide a way to visualise the constructed query


## ⏳ Installation

Install Strapi with this **Quickstart** command to create a Strapi project instantly:

- (Use **yarn** to install the Strapi project (recommended). [Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
# with yarn
yarn create strapi-app my-project --quickstart

# with npm/npx
npx create-strapi-app my-project --quickstart
```

_This command generates a brand new project with the default features (authentication, permissions, content management, content type builder & file upload). The **Quickstart** command installs Strapi using a **SQLite** database which is used for prototyping in development._

### 📦 Install the plugin

```bash
yarn add strapi-plugin-custom-api@latest

# or

npm i -S strapi-plugin-custom-api@latest
```

### ⚠️ **CRITICAL**: Install required dependencies

**For Strapi v5 compatibility, you MUST also install these dependencies:**

```bash
yarn add lodash @strapi/design-system @strapi/icons

# or

npm install lodash @strapi/design-system @strapi/icons
```

**Why these dependencies are needed:**
- `lodash`: Plugin uses lodash utilities (upperFirst, cloneDeepWith, cloneDeep)
- `@strapi/design-system`: UI components for the admin interface  
- `@strapi/icons`: Icon components for navigation and UI

**Without these dependencies, the plugin will not work properly in Strapi v5.**

### ⚙️ Configure the plugin

Add the following config to `/config/plugins.js` file:

```javascript
module.exports = {
  "custom-api": {
    enabled: true,
  },
};
```

**Note:** If you don't have a `plugins.js` file, create one in your `/config/` directory.


### 🚀 Start your application

After successful installation, build and start your Strapi application:

```bash
yarn build && yarn develop

# or

npm run build && npm run develop
```

For development with automatic admin rebuilding:

```bash
yarn develop --watch-admin

# or

npm run develop --watch-admin
```

## 🎬 Step by step installation video
https://www.loom.com/share/6ed4576bf2d645f5b7f45b7928c74def

The **Custom API Builder** plugin should appear in the **Plugins** section of Strapi sidebar after you restart your app.

## 🔧 Troubleshooting

### Plugin not loading?
1. **Check dependencies**: Ensure you've installed `lodash`, `@strapi/design-system`, and `@strapi/icons`
2. **Clear cache**: Delete `node_modules/.cache` and rebuild
3. **Check configuration**: Verify `plugins.js` is configured correctly
4. **Console errors**: Check browser console for specific error messages

### Common issues:
- **"Cannot resolve @strapi/design-system"**: Install the missing dependency
- **"Plugin not found"**: Verify the plugin is listed in your `package.json`
- **"Admin won't build"**: Clear cache and rebuild with `--watch-admin`

For more detailed troubleshooting, see `CLAUDE_CODE_GUIDE.md`.

## 📋 Requirements

- **Strapi**: v5.x
- **Node.js**: v18+ (recommended)
- **NPM/Yarn**: Latest stable version

## 🔄 Migration from v1.x

If you're upgrading from v1.x (Strapi v4):

1. **Upgrade Strapi to v5** first
2. **Install new dependencies** as shown above
3. **Update plugin version**: `npm install strapi-plugin-custom-api@latest`
4. **Test functionality** thoroughly
5. **Review CLAUDE_CODE_GUIDE.md** for detailed migration information

## 🚀 Usage

https://user-images.githubusercontent.com/34507994/172044022-7dce9138-d716-4806-a765-b446f24a94dd.mp4

As simple as that

## 🤖 AI-Assisted Development

This plugin's Strapi v5 migration was completed using **Claude Code**, Anthropic's AI development assistant. The comprehensive upgrade included:

- Complete API migration (Entity Service → Document Service)
- Dependency resolution and compatibility fixes
- End-to-end testing with Playwright automation
- Systematic debugging and troubleshooting

See `CLAUDE_CODE_GUIDE.md` for detailed documentation on maintaining this plugin with AI assistance.

## 📚 Documentation

- **Installation & Usage**: This README
- **Development Guide**: `CLAUDE_CODE_GUIDE.md`
- **Technical Details**: `CLAUDE.md`
- **Change History**: Git commit history

## 🦸 Contributors

- [@vivmagarwal](https://github.com/vivmagarwal) - Original author
- [@cjboco](https://github.com/cjboco) - Contributor
- **Claude Code** - AI-assisted Strapi v5 migration

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Support

Found a bug or need help?

- **Issues**: [GitHub Issues](https://github.com/vivmagarwal/strapi-plugin-custom-api-builder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/vivmagarwal/strapi-plugin-custom-api-builder/discussions)  
- **Documentation**: Check `CLAUDE_CODE_GUIDE.md` for detailed troubleshooting

---

**Made with ❤️ for the Strapi community**
