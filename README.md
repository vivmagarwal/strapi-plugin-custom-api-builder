# Strapi Custom API Builder plugin

<p align="left">
  <a href="https://www.npmjs.com/package/strapi-plugin-custom-api">
    <img src="https://img.shields.io/npm/v/strapi-plugin-email-designer.svg?style=plastic" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/strapi-plugin-custom-api">
    <img src="https://img.shields.io/npm/dt/strapi-plugin-email-designer.svg?style=plastic" alt="Monthly download on NPM" /></a>
  <a href="https://github.com/prettier/prettier" target="_blank" rel="noopener noreferrer">
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=plastic"></a>
  <a href="#-contributing">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=plastic" alt="PRs welcome!" /></a>
  <a href="#-license">
    <img src="https://img.shields.io/github/license/alexzaganelli/strapi-plugin-email-designer?style=plastic" alt="License" /></a>
  <a href="https://twitter.com/intent/follow?screen_name=vivmagarwal" target="_blank" rel="noopener noreferrer">
    <img alt="Follow Vivek M Agarwal" src="https://img.shields.io/twitter/follow/alexzaganelli?color=%231DA1F2&label=follow%20me&style=plastic"></a>
  <a href="#">
    <img alt="Repo stars" src="https://img.shields.io/github/stars/alexzaganelli/strapi-plugin-email-designer?color=white&label=Github&style=plastic"></a>
  <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors-"><img alt="Contributors" src="https://img.shields.io/badge/all_contributors-13-orange.svg?style=plastic"></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

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

