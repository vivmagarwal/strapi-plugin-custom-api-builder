'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('custom-api-builder')
      .service('myService')
      .getWelcomeMessage();
  },
};
