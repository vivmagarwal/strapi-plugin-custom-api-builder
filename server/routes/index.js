module.exports = [
  {
    method: "GET",
    path: "/find",
    handler: "customApiControllers.find",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "POST",
    path: "/create",
    handler: "customApiControllers.create",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/content-types",
    handler: "customApiControllers.findContentTypes",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/content-types-settings",
    handler: "customApiControllers.findContentTypesSettings",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/content-types/:uid/configuration",
    handler: "customApiControllers.findContentTypeConfiguration",
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/:slug",
    handler: "customApiControllers.findBySlug",
    config: {
      policies: [],
      auth: false,
    },
  },
];
