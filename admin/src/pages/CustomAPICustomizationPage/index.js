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
  Accordion,
  AccordionToggle,
  AccordionContent,
} from "@strapi/design-system/Accordion";
import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";

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
    populate: {
      table: "",
      fields: [],
    },
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

  function toggleSelectedOfField(tableName, fieldNameToToggle) {
    const updatedData = getNewDataWithToggledSelected(
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
          <RenderDeeplyNestedObject
            data={selectableData["populate"]}
            toggleSelectedOfField={toggleSelectedOfField}
          />
        </Box>
      </ContentLayout>
    </>
  );
};

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

  iteratedUIDs.push(currentContentTypeRaw.uid);

  reducedContentData["table"] =
    currentRelationalField || currentContentTypeRaw.info.displayName;

  if (!reducedContentData["fields"]) reducedContentData["fields"] = [];

  for (const key of Object.keys(currentContentTypeRaw.attributes)) {
    if (currentContentTypeRaw.attributes[key].type !== "relation") {
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
  }

  reducedEntries["populate"] = reducedContentData;
}

function TablesAccordion({ children, table, ...rest }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Accordion
      expanded={expanded}
      onToggle={() => setExpanded((s) => !s)}
      id="acc-1"
      size="S"
      {...rest}
    >
      <AccordionToggle title={table} />
      <AccordionContent>
        <Box padding={3}>{children}</Box>
      </AccordionContent>
    </Accordion>
  );
}

function FieldsCheckbox({ table, field, toggleSelectedOfField }) {
  const [val, setValue] = useState(field.selected);

  return (
    <Box>
      <BaseCheckbox
        aria-label="fields checkbox"
        name={`base-checkbox-${table}-${field.name}`}
        id={`base-checkbox-${table}-${field.name}`}
        onValueChange={(value) => {
          setValue(value);
          toggleSelectedOfField(table, field.name);
        }}
        value={val}
        disabled={field.name === "id"}
      />
      <label
        style={{ marginLeft: 5 }}
        htmlFor={`base-checkbox-${table}-${field.name}`}
      >
        {field.name}
      </label>
    </Box>
  );
}

// todo: add table check to make it more robust.
function getNewDataWithToggledSelected(entries, tableName, fieldName) {
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

    // return value && value.name == fieldName
    //   ? { ...value, selected: !value.selected }
    //   : _.noop();
  });
  return result;
}

function RenderDeeplyNestedObject({ data, toggleSelectedOfField }) {
  let { table, fields, populate } = data;
  return (
    <>
      <Box padding={8} background="neutral100">
        <TablesAccordion table={table}>
          <ul>
            {fields.map((field) => {
              return (
                <FieldsCheckbox
                  key={field.name}
                  table={table}
                  field={field}
                  toggleSelectedOfField={toggleSelectedOfField}
                />
              );
            })}

            {populate && populate.table && (
              <RenderDeeplyNestedObject
                data={populate}
                toggleSelectedOfField={toggleSelectedOfField}
              />
            )}
          </ul>
        </TablesAccordion>
      </Box>
    </>
  );
}

export default CustomAPICustomizationPage;
