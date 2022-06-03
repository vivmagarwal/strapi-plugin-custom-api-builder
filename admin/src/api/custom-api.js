import { request } from "@strapi/helper-plugin";

const customApiRequest = {
  getAllCustomApis: async () => {
    return await request("/custom-api/find", {
      method: "GET",
    });
  },

  addCustomApi: async (data) => {
    return await request("/custom-api/create", {
      method: "POST",
      body: { data: data },
    });
  },

  getAllContentTypes: async () => {
    return await request("/custom-api/content-types", {
      method: "GET",
    });
  },
};

export default customApiRequest;
