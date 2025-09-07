import { getFetchClient } from "@strapi/strapi/admin";

const { get, post, put } = getFetchClient();

const customApiRequest = {
  getAllCustomApis: () => get("/custom-api/find"),

  getCustomApiById: (id) => get(`/custom-api/find/${id}`),

  addCustomApi: (data) => post("/custom-api/create", { data }),

  updateCustomApi: (id, data) => put(`/custom-api/update/${id}`, { data }),

  getAllContentTypes: () => get("/custom-api/content-types"),
};

export default customApiRequest;
