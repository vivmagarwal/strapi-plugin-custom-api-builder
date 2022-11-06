import React, { useState, useEffect } from "react";
import ArrowLeft from "@strapi/icons/ArrowLeft";
import Check from "@strapi/icons/Check";
import { Button } from "@strapi/design-system/Button";
import { Stack } from "@strapi/design-system/Stack";
import { Box } from "@strapi/design-system/Box";
import { Grid, GridItem } from "@strapi/design-system/Grid";
import { ContentLayout, HeaderLayout } from "@strapi/design-system/Layout";
import upperFirst from "lodash/upperFirst";
import cloneDeepWith from "lodash/cloneDeepWith";
import cloneDeep from "lodash/cloneDeep";
import { TextInput } from "@strapi/design-system/TextInput";
import customApiRequest from "../../api/custom-api";
import { Select, Option } from "@strapi/design-system/Select";
import { Typography } from "@strapi/design-system/Typography";
import {
  fetchContentTypeData,
  getReducedDataObject,
} from "../../utils/customApiBuilderUtils";
import {
  RenderDeeplyNestedObject,
  toggleSelectedOfField,
  toggleSelectedOfMedia,
} from "../../components/RenderDeeplyNestedObject";

const CustomAPICustomizationPage = ({
  showCustomAPICustomizationPage,
  setShowCustomAPICustomizationPage,
  fetchData,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  /**
 [
    { uid: "api::author.author", displayName: "Author" },
    { uid: "api::book.book", displayName: "Book" },
    { uid: "api::publisher.publisher", displayName: "Publisher" },
 ]
 */
  const [contentTypes, setContentTypes] = useState(null);

  useEffect(async () => {
    const contentTypeDataRaw = await customApiRequest.getAllContentTypes();
    const contentTypeMetadata = contentTypeDataRaw.map((item) => {
      return {
        uid: item.uid,
        displayName: item.info.displayName,
      };
    });

    setContentTypes(contentTypeMetadata);
  }, []);

  /**
  {
    uid: "api::author.author",
    displayName: "Author",
  }
   */
  const [selectedContentType, setSelectedContentType] = useState();

  const [selectableData, setSelectableData] = useState({
    populate: [],
  });

  // side effects for the edit mode
  // 1. setting Name
  // 2. setting slug
  // 3. setting selected content type
  // 4. setting the selectable data
  useEffect(async () => {
    if (!showCustomAPICustomizationPage || !showCustomAPICustomizationPage.id)
      return;

    // edit mode
    const editModeData = await customApiRequest.getCustomApiById(
      showCustomAPICustomizationPage.id
    );

    if (editModeData) {
      // edit mode
      setName(editModeData.name);
      setSlug(editModeData.slug);
      setSelectedContentType(editModeData.selectedContentType);
      setSelectableData(editModeData.structure);
    }
  }, []);

  // side effects for the create mode
  // 1. setting selectableData
  // 2. name, slug & selectedContentType empty/default state.
  useEffect(async () => {
    if (showCustomAPICustomizationPage && showCustomAPICustomizationPage.id)
      return;

    if (!selectedContentType) return;

    // create mode
    const selectedContentTypeRaw = await fetchContentTypeData({
      uid: selectedContentType.uid,
    });

    if (!selectedContentTypeRaw) return;

    const iteratedUIDs = [];
    const reducedEntries = {};

    await getReducedDataObject({
      currentContentTypeRaw: cloneDeep(selectedContentTypeRaw),
      iteratedUIDs: iteratedUIDs,
      reducedEntries: reducedEntries,
    });

    if (reducedEntries) {
      setSelectableData(reducedEntries);
    }
  }, [selectedContentType]);

  function getNewFieldDataWithToggledSelected(entries, tableName, fieldName) {
    const result = cloneDeepWith(entries, (value) => {
      if (value && value.table) {
        if (value.table === tableName) {
          const fields = [...value.fields];
          const toggledFields = fields.map((item) => {
            if (item.name === fieldName) {
              return { selected: !item.selected, name: item.name };
            } else {
              return item;
            }
          });
          return { ...value, fields: toggledFields };
        }
      }
    });
    return result;
  }

  function getNewMediaDataWithToggledSelected(entries, tableName, mediaName) {
    const result = cloneDeepWith(entries, (value) => {
      if (value && value.table) {
        if (value.table === tableName) {
          const medias = [...value.media];
          const toggledMedias = medias.map((item) => {
            if (item.name === mediaName) {
              return { selected: !item.selected, name: item.name };
            } else {
              return item;
            }
          });
          return { ...value, media: toggledMedias };
        }
      }
    });
    return result;
  }

  function toggleSelectedOfField(tableName, fieldNameToToggle) {
    const updatedData = getNewFieldDataWithToggledSelected(
      selectableData,
      tableName,
      fieldNameToToggle
    );
    setSelectableData(updatedData);
  }

  function toggleSelectedOfMedia(tableName, fieldNameToToggle) {
    const updatedData = getNewMediaDataWithToggledSelected(
      selectableData,
      tableName,
      fieldNameToToggle
    );
    setSelectableData(updatedData);
  }

  const handleSubmit = async (e) => {
    // Prevent submitting parent form
    e.preventDefault();
    e.stopPropagation();

    try {
      if (showCustomAPICustomizationPage && showCustomAPICustomizationPage.id) {
        //edit mode
        await customApiRequest.updateCustomApi(
          showCustomAPICustomizationPage.id,
          {
            name: name,
            slug: slug,
            selectedContentType: selectedContentType,
            structure: selectableData,
          }
        );
      } else {
        // create mode
        await customApiRequest.addCustomApi({
          name: name,
          slug: slug,
          selectedContentType: selectedContentType,
          structure: selectableData,
        });
      }

      fetchData();

      setShowCustomAPICustomizationPage(false);
    } catch (e) {
      console.log("error", e);
    }
  };

  return (
    <>
      <HeaderLayout
        id="title"
        primaryAction={
          <Stack horizontal spacing={2}>
            <Button
              startIcon={<Check />}
              onClick={handleSubmit}
              type="button"
              disabled={false}
            >
              Save
            </Button>
          </Stack>
        }
        title={upperFirst("Create a custom API")}
        subtitle="creating a new custom API"
        navigationAction={
          <Button
            onClick={() => {
              setShowCustomAPICustomizationPage(false);
            }}
            startIcon={<ArrowLeft />}
            variant="ghost"
            style={{ paddingLeft: 0 }}
          >
            Back to list
          </Button>
        }
      />

      <ContentLayout>
        <Stack spacing={4}>
          <Box
            padding={10}
            background="neutral0"
            shadow="filterShadow"
            hasRadius
          >
            <Grid gap={6}>
              <GridItem col={6} s={12}>
                <TextInput
                  placeholder="A descriptive name"
                  label="Custom API Name"
                  name="name"
                  hint="A descriptive name"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
              </GridItem>

              <GridItem col={6} s={12}>
                <TextInput
                  placeholder="A Slug for constructing URL"
                  label="Slug"
                  name="slug"
                  hint={slug && `Get your data here: /custom-api/${slug}`}
                  onChange={(e) => setSlug(e.target.value)}
                  value={slug}
                />
              </GridItem>
            </Grid>
          </Box>
        </Stack>

        <Box
          padding={10}
          background="neutral0"
          shadow="filterShadow"
          hasRadius
          style={{
            marginTop: 10,
          }}
        >
          <Stack spacing={11}>
            <Typography variant="beta">
              The selected Content Type is:{" "}
              {selectedContentType ? selectedContentType.displayName : ""}
            </Typography>
            <Select
              id="select1"
              label="Choose the content-type"
              required
              placeholder="select a content type"
              hint="Relationships will automatically be mapped below"
              onClear={() => setSelectedContentType(undefined)}
              clearLabel="Clear content types"
              value={selectedContentType ? selectedContentType.uid : null}
              disabled={
                showCustomAPICustomizationPage &&
                showCustomAPICustomizationPage.id
                  ? true
                  : false
              }
              onChange={(val) => {
                setSelectedContentType(
                  contentTypes &&
                    contentTypes.length &&
                    contentTypes.filter((item) => item.uid === val)[0]
                );
              }}
            >
              {contentTypes &&
                contentTypes.length &&
                contentTypes.map((item) => {
                  return (
                    <Option key={item.uid} value={item.uid}>
                      {item.displayName}
                    </Option>
                  );
                })}
            </Select>
          </Stack>
        </Box>

        <Box
          padding={10}
          background="neutral0"
          shadow="filterShadow"
          hasRadius
          style={{
            marginTop: 10,
          }}
        >
          {selectableData &&
            selectableData.populate &&
            Array.isArray(selectableData.populate) &&
            selectableData.populate.length &&
            selectableData.populate.map((item) => {
              return (
                <RenderDeeplyNestedObject
                  data={item}
                  toggleSelectedOfField={toggleSelectedOfField}
                  toggleSelectedOfMedia={toggleSelectedOfMedia}
                />
              );
            })}
        </Box>
      </ContentLayout>
    </>
  );
};

export default CustomAPICustomizationPage;
