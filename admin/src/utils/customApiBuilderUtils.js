import customApiRequest from "../api/custom-api";

// todo: save the raw data and reuse it
async function fetchContentTypeData({ uid }) {
  const contentTypeDataRaw = await customApiRequest.getAllContentTypes();
  const selectedContentTypeRaw = contentTypeDataRaw.filter(
    (item) => item.uid === uid
  )[0];
  return selectedContentTypeRaw;
}

async function getReducedDataObject({
  currentContentTypeRaw,
  iteratedUIDs,
  reducedEntries,
  currentRelationalField,
}) {
  let reducedContentData = {};

  // console.log("reducedEntries **=> ", reducedEntries);

  iteratedUIDs.push(currentContentTypeRaw.uid);

  reducedContentData["table"] =
    currentRelationalField || currentContentTypeRaw.info.displayName;

  if (!reducedContentData["fields"]) reducedContentData["fields"] = [];
  if (!reducedContentData["media"]) reducedContentData["media"] = [];

  for (const key of Object.keys(currentContentTypeRaw.attributes)) {
    if (
      !["relation", "media"].includes(
        currentContentTypeRaw.attributes[key].type
      )
    ) {
      reducedContentData["fields"].push({
        selected: key === "id" ? true : false,
        name: key,
      });
    }

    if (currentContentTypeRaw.attributes[key].type === "relation") {
      const relationalUid = currentContentTypeRaw.attributes[key].target;

      if (!iteratedUIDs.includes(relationalUid)) {
        const selectedContentTypeRaw = await fetchContentTypeData({
          uid: relationalUid,
        });

        await getReducedDataObject({
          currentContentTypeRaw: selectedContentTypeRaw,
          iteratedUIDs: iteratedUIDs,
          reducedEntries: reducedContentData,
          currentRelationalField: key,
        });
      }
    }

    if (currentContentTypeRaw.attributes[key].type === "media") {
      reducedContentData["media"].push({
        selected: false,
        name: key,
      });
    }
  }

  reducedEntries["populate"] = reducedEntries["populate"] || [];
  reducedEntries["populate"].push(reducedContentData);
}

export { fetchContentTypeData, getReducedDataObject };
