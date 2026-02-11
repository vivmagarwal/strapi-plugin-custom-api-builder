import React, { useState, useEffect } from "react";
import { ArrowLeft } from "@strapi/icons";
import { Check } from "@strapi/icons";
import { Button, Flex, Box, Grid, TextInput, SingleSelect, SingleSelectOption, Typography } from "@strapi/design-system";
import { upperFirst, cloneDeepWith, cloneDeep } from '../../utils/helpers';
import customApiRequest from "../../api/custom-api";
import {
  fetchContentTypeData,
  getReducedDataObject,
} from "../../utils/customApiBuilderUtils";
import RenderDeeplyNestedObject from "../../components/RenderDeeplyNestedObject/index.jsx";
import SlugInput from "../../components/SlugInput/index.jsx";

const CustomAPICustomizationPage = ({
  showCustomAPICustomizationPage,
  setShowCustomAPICustomizationPage,
  fetchData,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [contentTypes, setContentTypes] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState();
  const [selectableData, setSelectableData] = useState({
    populate: [],
  });

  useEffect(() => {
    (async () => {
      const contentTypeDataRaw = await customApiRequest.getAllContentTypes();
      const contentTypeMetadata = contentTypeDataRaw.map((item) => {
        return {
          uid: item.uid,
          displayName: item.info.displayName,
        };
      });
      setContentTypes(contentTypeMetadata);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!showCustomAPICustomizationPage || !showCustomAPICustomizationPage.id)
        return;

      const editModeData = await customApiRequest.getCustomApiById(
        showCustomAPICustomizationPage.id
      );

      if (editModeData) {
        setName(editModeData.name);
        setSlug(editModeData.slug);
        setSelectedContentType(editModeData.selectedContentType);
        setSelectableData(editModeData.structure);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (showCustomAPICustomizationPage && showCustomAPICustomizationPage.id)
        return;

      if (!selectedContentType) return;

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
    })();
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

  function getNewComponentDataWithToggledSelected(entries, tableName, componentName) {
    const result = cloneDeepWith(entries, (value) => {
      if (value && value.table) {
        if (value.table === tableName) {
          const components = [...value.components];
          const toggledComponents = components.map((item) => {
            if (item.name === componentName) {
              return { selected: !item.selected, name: item.name };
            } else {
              return item;
            }
          });
          return { ...value, components: toggledComponents };
        }
      }
    });
    return result;
  }

  function getNewDynamicZoneDataWithToggledSelected(entries, tableName, dynamicZoneName) {
    const result = cloneDeepWith(entries, (value) => {
      if (value && value.table) {
        if (value.table === tableName) {
          const dynamiczones = [...value.dynamiczones];
          const toggledDynamicZones = dynamiczones.map((item) => {
            if (item.name === dynamicZoneName) {
              return { selected: !item.selected, name: item.name };
            } else {
              return item;
            }
          });
          return { ...value, dynamiczones: toggledDynamicZones };
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

  function toggleSelectedOfComponent(tableName, componentNameToToggle) {
    const updatedData = getNewComponentDataWithToggledSelected(
      selectableData,
      tableName,
      componentNameToToggle
    );
    setSelectableData(updatedData);
  }

  function toggleSelectedOfDynamicZone(tableName, dynamicZoneNameToToggle) {
    const updatedData = getNewDynamicZoneDataWithToggledSelected(
      selectableData,
      tableName,
      dynamicZoneNameToToggle
    );
    setSelectableData(updatedData);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (showCustomAPICustomizationPage && showCustomAPICustomizationPage.id) {
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
      <Box background="neutral0" paddingTop={6} paddingBottom={6} paddingLeft={10} paddingRight={10}>
        <Flex direction="column" gap={2} alignItems="stretch">
          <Button
            onClick={() => {
              setShowCustomAPICustomizationPage(false);
            }}
            startIcon={<ArrowLeft />}
            variant="ghost"
            style={{ paddingLeft: 0, alignSelf: 'flex-start' }}
          >
            Back to list
          </Button>
          <Flex justifyContent="space-between" alignItems="center">
            <Flex direction="column" gap={1} alignItems="flex-start">
              <Typography variant="alpha" as="h1">
                {upperFirst("Create a custom API")}
              </Typography>
              <Typography variant="epsilon" textColor="neutral600">
                creating a new custom API
              </Typography>
            </Flex>
            <Button
              startIcon={<Check />}
              onClick={handleSubmit}
              type="button"
              disabled={false}
            >
              Save
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Box paddingLeft={10} paddingRight={10}>
        <Flex direction="column" gap={4} alignItems="stretch">
          <Box
            padding={10}
            background="neutral0"
            shadow="filterShadow"
            hasRadius
          >
            <Grid.Root gap={6}>
              <Grid.Item col={6} s={12}>
                <TextInput
                  placeholder="A descriptive name"
                  label="Custom API Name"
                  name="name"
                  hint="A descriptive name"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
              </Grid.Item>

              <Grid.Item col={6} s={12}>
                <SlugInput
                  name="slug"
                  value={slug}
                  onChange={setSlug}
                  label="Slug"
                  placeholder="A slug for constructing URL"
                  hint="Used to construct the API endpoint URL"
                  sourceName={name}
                  autoGenerate={true}
                  required={true}
                  excludeId={showCustomAPICustomizationPage?.id}
                />
              </Grid.Item>
            </Grid.Root>
          </Box>
        </Flex>

        <Box
          padding={10}
          background="neutral0"
          shadow="filterShadow"
          hasRadius
          style={{
            marginTop: 10,
          }}
        >
          <Flex direction="column" gap={4} alignItems="stretch">
            <Typography variant="beta">
              The selected Content Type is:{" "}
              {selectedContentType ? selectedContentType.displayName : ""}
            </Typography>
            <SingleSelect
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
                    <SingleSelectOption key={item.uid} value={item.uid}>
                      {item.displayName}
                    </SingleSelectOption>
                  );
                })}
            </SingleSelect>
          </Flex>
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
                  key={item.table}
                  data={item}
                  toggleSelectedOfField={toggleSelectedOfField}
                  toggleSelectedOfMedia={toggleSelectedOfMedia}
                  toggleSelectedOfComponent={toggleSelectedOfComponent}
                  toggleSelectedOfDynamicZone={toggleSelectedOfDynamicZone}
                />
              );
            })}
        </Box>
      </Box>
    </>
  );
};

export default CustomAPICustomizationPage;
