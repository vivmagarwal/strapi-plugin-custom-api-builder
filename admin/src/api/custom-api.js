import { request } from "@strapi/helper-plugin";

const customApiRequest = {
  getAllCustomApis: () => request("/custom-api/find", { method: "GET" }),

  getCustomApiById: (id) => request(`/custom-api/find/${id}`, { method: "GET" }),

  addCustomApi: (data) => request("/custom-api/create", {
    method: "POST",
    body: { data },
  }),

  updateCustomApi: (id, data) => request(`/custom-api/update/${id}`, {
    method: "PUT",
    body: { data },
  }),

  getAllContentTypes: () => request("/custom-api/content-types", { method: "GET" }),
};

export default customApiRequest;
