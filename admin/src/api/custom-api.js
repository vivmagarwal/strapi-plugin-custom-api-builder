import { getFetchClient } from "@strapi/strapi/admin";

const { get, post, put } = getFetchClient();

// In Strapi v5, getFetchClient returns axios-style responses: { data, status, headers }.
// We extract .data so callers get the response body directly.
const customApiRequest = {
  getAllCustomApis: async () => {
    const { data } = await get("/custom-api/find");
    return data;
  },

  getCustomApiById: async (id) => {
    const { data } = await get(`/custom-api/find/${id}`);
    return data;
  },

  addCustomApi: async (body) => {
    const { data } = await post("/custom-api/create", { data: body });
    return data;
  },

  updateCustomApi: async (id, body) => {
    const { data } = await put(`/custom-api/update/${id}`, { data: body });
    return data;
  },

  getAllContentTypes: async () => {
    const { data } = await get("/custom-api/content-types");
    return data;
  },

  validateSlug: async (slug, excludeId = null) => {
    let url = `/custom-api/validate-slug/${encodeURIComponent(slug)}`;
    if (excludeId) {
      url += `?excludeId=${encodeURIComponent(excludeId)}`;
    }
    const { data } = await get(url);
    return data;
  },
};

export default customApiRequest;
