import customApiRequest from "../api/custom-api";

// Fetch content type data including handling for dynamic zones and components
async function fetchContentTypeData({ uid }) {
  try {
    const contentTypeDataRaw = await customApiRequest.getAllContentTypes();
    const selectedContentTypeRaw = contentTypeDataRaw.find(item => item.uid === uid);
    return selectedContentTypeRaw;
  } catch (error) {
    console.error(`[fetchContentTypeData] Failed to fetch content type data for ${uid}:`, error);
    throw error;
  }
}

// Recursive function to handle nested content types, relations, media, components, and dynamic zones
async function getReducedDataObject({
  currentContentTypeRaw,
  iteratedUIDs,
  reducedEntries,
  currentRelationalField,
}) {
  let reducedContentData = {
    table: currentRelationalField || currentContentTypeRaw.info.displayName,
    fields: [],
    media: [],
    components: [],
    dynamiczones: [],
  };

  iteratedUIDs.push(currentContentTypeRaw.uid);

  for (const key in currentContentTypeRaw.attributes) {
    const attribute = currentContentTypeRaw.attributes[key];
    const { type } = attribute;

    switch (type) {
      case "relation":
        const relationalUid = attribute.target;
        if (!iteratedUIDs.includes(relationalUid)) {
          const relatedContentTypeRaw = await fetchContentTypeData({ uid: relationalUid });
          if (relatedContentTypeRaw) {
            await getReducedDataObject({
              currentContentTypeRaw: relatedContentTypeRaw,
              iteratedUIDs,
              reducedEntries: reducedContentData,
              currentRelationalField: key,
            });
          }
        }
        break;
      case "media":
        reducedContentData.media.push({ selected: false, name: key });
        break;
      case "component":
        reducedContentData.components.push({ selected: false, name: key });
        break;
      case "dynamiczone":
        reducedContentData.dynamiczones.push({ selected: false, name: key });
        break;
      default:
        reducedContentData.fields.push({ selected: key === "id", name: key });
        break;
    }
  }

  reducedEntries.populate = reducedEntries.populate || [];
  reducedEntries.populate.push(reducedContentData);
}

export { fetchContentTypeData, getReducedDataObject };
