# Strapi Custom API Builder plugin

Design your custom API's (or custom reports / or custom views) directly from the [Strapi CMS](https://github.com/strapi/strapi) admin panel. Simply select the fields you need to show, enter a valid slug and let the plugin magically create the routes, controllers & services for you. Very easy to create & even easier to maintain.
&nbsp;

![custom-api-builder-ss-3](https://user-images.githubusercontent.com/34507994/172046114-2cc9bf30-b2f1-4bec-9a60-b6a3117c61bc.png)

&nbsp;
## ⚙️ Versions

**Strapi v4** - (current) - [v1.x](https://github.com/vivmagarwal/strapi-plugin-custom-api-builder)

&nbsp;

## Breaking changes in v1
- Support for media & multiple media added
- Support for multiple relationships at the same level added
- The above features makes it incompatible with v0.x. The current version wont work with the custom API's created with v0.x.

## 🖐 Beta Release

We are still performing tests to make sure that the plugin is bug free. We will be adding several more features to the plugin in the recent future. 

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

Add the `strapi-designer` plugin

```bash
yarn add strapi-plugin-custom-api@latest

# or

npm i -S strapi-plugin-custom-api@latest
```

Add the following config to `/config/plugins.js` file
```
module.exports = {
  "custom-api": {
    enabled: true,
  },
};

```
In case you don't have a plugins.js file, please create one.


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

## Step by step installation of the plugin from scratch
https://www.loom.com/share/6ed4576bf2d645f5b7f45b7928c74def


The **Custom API Builder** plugin should appear in the **Plugins** section of Strapi sidebar after you run app again.

## 🚀 Usage

https://user-images.githubusercontent.com/34507994/172044022-7dce9138-d716-4806-a765-b446f24a94dd.mp4

As simple as that

## 🦸 Contributors
- https://github.com/cjboco
