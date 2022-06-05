# Strapi Custom API Builder plugin

Design your custom API's (or custom reports / or custom views) directly from the [Strapi CMS](https://github.com/strapi/strapi) admin panel. Simply select the fields you need to show, enter a valid slug and let the plugin magically create the routes, controllers & services for you. Very easy to create & even easier to maintain.

&nbsp;
## ⚙️ Versions

**Strapi v4** - (current) - [v1.x](https://github.com/vivmagarwal/strapi-plugin-custom-api-builder)

&nbsp;

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

Add the `strapi-designer` plugin

```bash
yarn add strapi-plugin-custom-api@latest

# or

npm i -S strapi-plugin-custom-api@latest
```

After successful installation you've to build a fresh package that includes plugin UI. To archive that simply use:

```bash
yarn build && yarn develop

# or

npm run build && npm run develop
```

or just run Strapi in the development mode with `--watch-admin` option:

```bash
yarn develop --watch-admin

#or

npm run develop --watch-admin
```

The **Custom API Builder** plugin should appear in the **Plugins** section of Strapi sidebar after you run app again.

## 🚀 Usage

https://user-images.githubusercontent.com/34507994/172044022-7dce9138-d716-4806-a765-b446f24a94dd.mp4

