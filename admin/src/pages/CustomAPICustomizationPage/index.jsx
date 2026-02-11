import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft } from "@strapi/icons";
import { Check } from "@strapi/icons";
import { Button, Flex, Box, Grid, TextInput, SingleSelect, SingleSelectOption, Typography, Field } from "@strapi/design-system";
import { upperFirst, cloneDeepWith, cloneDeep } from '../../utils/helpers';
import customApiRequest from "../../api/custom-api";
import {
  fetchContentTypeData,
  getReducedDataObject,
} from "../../utils/customApiBuilderUtils";
import RenderDeeplyNestedObject from "../../components/RenderDeeplyNestedObject/index.jsx";
import SlugInput from "../../components/SlugInput/index.jsx";
import FieldSearch from "../../components/FieldSearch/index.jsx";
import QueryVisualization from "../../components/QueryVisualization/index.jsx";

function countFieldsRecursive(data) {
  let total = 0;
  let selected = 0;
  const types = new Set();

  const categories = ['fields', 'media', 'components', 'dynamiczones'];
  categories.forEach((cat) => {
    if (data[cat] && data[cat].length > 0) {
      types.add(cat);
      data[cat].forEach((item) => {
        total++;
        if (item.selected) selected++;
      });
    }
  });

  if (data.populate && Array.isArray(data.populate)) {
    data.populate.forEach((nested) => {
      const nestedCounts = countFieldsRecursive(nested);
      total += nestedCounts.total;
      selected += nestedCounts.selected;
      nestedCounts.types.forEach((t) => types.add(t));
    });
  }

  return { total, selected, types };
}

const CustomAPICustomizationPage = ({
  showCustomAPICustomizationPage,
  setShowCustomAPICustomizationPage,
  fetchData,
  isLoading,
  onFeedback,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [contentTypes, setContentTypes] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState();
  const [selectableData, setSelectableData] = useState({
    populate: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  // Form validation
  const [nameError, setNameError] = useState(null);
  const [nameTouched, setNameTouched] = useState(false);

  // Field search/filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilters, setTypeFilters] = useState([]);

  const isEditing = Boolean(showCustomAPICustomizationPage?.id);

  // Compute field stats from selectable data
  const fieldStats = useMemo(() => {
    if (!selectableData || !selectableData.populate || !Array.isArray(selectableData.populate)) {
      return { total: 0, selected: 0, types: [] };
    }
    let total = 0;
    let selected = 0;
    const types = new Set();
    selectableData.populate.forEach((item) => {
      const counts = countFieldsRecursive(item);
      total += counts.total;
      selected += counts.selected;
      counts.types.forEach((t) => types.add(t));
    });
    return { total, selected, types: Array.from(types) };
  }, [selectableData]);

  const handleFieldSearch = useCallback((term, filters) => {
    setSearchTerm(term);
    setTypeFilters(filters || []);
  }, []);

  function validateName(value) {
    if (!value || !value.trim()) {
      return "Name is required";
    }
    if (value.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return null;
  }

  function handleNameChange(e) {
    const value = e.target.value;
    setName(value);
    if (nameTouched) {
      setNameError(validateName(value));
    }
  }

  function handleNameBlur() {
    setNameTouched(true);
    setNameError(validateName(name));
  }

  const isFormValid = !validateName(name) && slug.trim().length > 0;

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

  function selectAllInCategory(tableName, categoryKey, selectAll) {
    const result = cloneDeepWith(selectableData, (value) => {
      if (value && value.table === tableName && value[categoryKey]) {
        const updated = value[categoryKey].map((item) => ({
          ...item,
          selected: selectAll,
        }));
        return { ...value, [categoryKey]: updated };
      }
    });
    setSelectableData(result);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate before submit
    const nameValidationError = validateName(name);
    if (nameValidationError) {
      setNameTouched(true);
      setNameError(nameValidationError);
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        await customApiRequest.updateCustomApi(
          showCustomAPICustomizationPage.id,
          {
            name: name,
            slug: slug,
            selectedContentType: selectedContentType,
            structure: selectableData,
          }
        );
        if (onFeedback) onFeedback('success', `"${name}" has been updated successfully.`);
      } else {
        await customApiRequest.addCustomApi({
          name: name,
          slug: slug,
          selectedContentType: selectedContentType,
          structure: selectableData,
        });
        if (onFeedback) onFeedback('success', `"${name}" has been created successfully.`);
      }

      fetchData();
      setShowCustomAPICustomizationPage(false);
    } catch (e) {
      console.log("error", e);
      if (onFeedback) onFeedback('danger', `Failed to ${isEditing ? 'update' : 'create'} "${name}". ${e.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
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
                {isEditing ? `Edit: ${name}` : "Create a custom API"}
              </Typography>
              <Typography variant="epsilon" textColor="neutral600">
                {isEditing ? "Modify your custom API configuration" : "Configure a new custom API endpoint"}
              </Typography>
            </Flex>
            <Button
              startIcon={<Check />}
              onClick={handleSubmit}
              type="button"
              disabled={!isFormValid}
              loading={isSaving}
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
                <Field.Root name="name" error={nameTouched && nameError ? nameError : undefined}>
                  <Field.Label required>Custom API Name</Field.Label>
                  <TextInput
                    placeholder="A descriptive name"
                    name="name"
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    value={name}
                    aria-invalid={!!(nameTouched && nameError)}
                  />
                  <Field.Hint>A descriptive name for your custom API</Field.Hint>
                  {nameTouched && nameError && <Field.Error>{nameError}</Field.Error>}
                </Field.Root>
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
              disabled={isEditing}
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

        {/* Field Search */}
        {selectableData && selectableData.populate && Array.isArray(selectableData.populate) && selectableData.populate.length > 0 && (
          <Box style={{ marginTop: 10 }}>
            <FieldSearch
              onSearch={handleFieldSearch}
              totalFields={fieldStats.total}
              selectedFields={fieldStats.selected}
              fieldTypes={fieldStats.types}
            />
          </Box>
        )}

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
                  depth={0}
                  searchTerm={searchTerm}
                  typeFilters={typeFilters}
                  toggleSelectedOfField={toggleSelectedOfField}
                  toggleSelectedOfMedia={toggleSelectedOfMedia}
                  toggleSelectedOfComponent={toggleSelectedOfComponent}
                  toggleSelectedOfDynamicZone={toggleSelectedOfDynamicZone}
                  selectAllInCategory={selectAllInCategory}
                />
              );
            })}
        </Box>

        {/* Query Visualization */}
        {slug && selectedContentType && (
          <Box style={{ marginTop: 10 }}>
            <QueryVisualization
              apiEndpoint={`/custom-api/${slug}`}
              queryConfig={{
                filters: true,
                sort: true,
                pagination: true,
              }}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default CustomAPICustomizationPage;
