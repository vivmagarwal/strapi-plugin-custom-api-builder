import React, { useState, useEffect } from "react";
import { Link } from "@strapi/helper-plugin";
import Plus from "@strapi/icons/Plus";
import ArrowLeft from "@strapi/icons/ArrowLeft";
import Check from "@strapi/icons/Check";
import Pencil from "@strapi/icons/Pencil";
import { Button } from "@strapi/design-system/Button";
import { Flex } from "@strapi/design-system/Flex";
import { Stack } from "@strapi/design-system/Stack";
import { Box } from "@strapi/design-system/Box";
import { Grid, GridItem } from "@strapi/design-system/Grid";
import { ContentLayout, HeaderLayout } from "@strapi/design-system/Layout";
import upperFirst from "lodash/upperFirst";
import cloneDeepWith from "lodash/cloneDeepWith";
import cloneDeep from "lodash/cloneDeep";
import { TextInput } from "@strapi/design-system/TextInput";
import customApiRequest from "../../api/custom-api";
import {
  Accordion,
  AccordionToggle,
  AccordionContent,
  AccordionGroup,
} from "@strapi/design-system/Accordion";
import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";

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

function FieldsCheckbox({ field, toggleSelectedOfField }) {
  const [val, setValue] = useState(field.selected);
  return (
    <Box>
      <BaseCheckbox
        aria-label="fields checkbox"
        name={`base-checkbox-${field.name}`}
        id={`base-checkbox-${field.name}`}
        onValueChange={(value) => {
          setValue(value);
          toggleSelectedOfField(field.name);
        }}
        value={val}
      />
      <label style={{ marginLeft: 5 }} htmlFor={`base-checkbox-${field.name}`}>
        {field.name}
      </label>
    </Box>
  );
}

// todo: add table check to make it more robust.
function getNewDataWithToggledSelected(entries, fieldName) {
  const result = cloneDeepWith(entries, (value) => {
    return value && value.name == fieldName
      ? { ...value, selected: !value.selected }
      : _.noop();
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

const CustomAPICustomizationPage = ({
  setShowCustomAPICustomizationPage,
  fetchData,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [structure, setStructure] = useState(
    JSON.stringify({
      populate: {
        table: "",
        fields: [],
      },
    })
  );

  const [contentTypes, setContentTypes] = useState([
    { uid: "api::author.author", displayName: "Author" },
    { uid: "api::book.book", displayName: "Book" },
  ]);

  const [selectedContentType, setSelectedContentType] = useState({
    uid: "api::author.author",
    displayName: "Author",
  });

  const [selectableData, setSelectableData] = useState({
    populate: {
      table: "",
      fields: [],
    },
  });

  function toggleSelectedOfField(fieldNameToToggle) {
    const updatedData = getNewDataWithToggledSelected(
      selectableData,
      fieldNameToToggle
    );
    setSelectableData(updatedData);
  }

  async function getReducedDataObject({
    currentContentTypeRaw,
    iteratedUIDs,
    reducedEntries,
  }) {
    console.log("currentContentTypeRaw => ", currentContentTypeRaw);
    let reducedContentData = {};

    iteratedUIDs.push(currentContentTypeRaw.uid);

    reducedContentData["table"] = currentContentTypeRaw.info.displayName;

    if (!reducedContentData["fields"]) reducedContentData["fields"] = [];

    for (const key of Object.keys(currentContentTypeRaw.attributes)) {
      if (currentContentTypeRaw.attributes[key].type !== "relation") {
        reducedContentData["fields"].push({
          selected: false,
          name: key,
        });
      }

      if (currentContentTypeRaw.attributes[key].type === "relation") {
        const relationalUid = currentContentTypeRaw.attributes[key].target;
        console.log("iteratedUIDs => ", iteratedUIDs);
        if (!iteratedUIDs.includes(relationalUid)) {
          const selectedContentTypeRaw = await fetchContentTypeData({
            uid: relationalUid,
          });
          console.log(
            "selectedContentTypeRaw recursive => ",
            selectedContentTypeRaw
          );

          await getReducedDataObject({
            currentContentTypeRaw: selectedContentTypeRaw,
            iteratedUIDs: iteratedUIDs,
            reducedEntries: reducedContentData,
          });
        }
      }
    }

    reducedEntries["populate"] = reducedContentData;
  }

  // todo: save the raw data and reuse it
  const fetchContentTypeData = async ({ uid }) => {
    const contentTypeDataRaw = await customApiRequest.getAllContentTypes();
    const selectedContentTypeRaw = contentTypeDataRaw.filter(
      (item) => item.uid === uid
    )[0];
    return selectedContentTypeRaw;
  };

  useEffect(async () => {
    const selectedContentTypeRaw = await fetchContentTypeData({
      uid: selectedContentType.uid,
    });

    if (!selectedContentTypeRaw) return;

    const iteratedUIDs = ["test"];
    const reducedEntries = {};
    await getReducedDataObject({
      currentContentTypeRaw: cloneDeep(selectedContentTypeRaw),
      iteratedUIDs: iteratedUIDs,
      reducedEntries: reducedEntries,
    });

    setSelectableData(reducedEntries);

    if (reducedEntries) {
      setStructure(JSON.stringify(reducedEntries));
    }

    console.log("reducedEntries => ", reducedEntries);
  }, []);

  const handleSubmit = async (e) => {
    // Prevent submitting parent form
    e.preventDefault();
    e.stopPropagation();

    try {
      await customApiRequest.addCustomApi({
        name: name,
        slug: slug,
        structure: structure,
      });

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
                  placeholder="A Slug for urls"
                  label="Slug"
                  name="slug"
                  hint="A valid string that can be appended to URLs"
                  onChange={(e) => setSlug(e.target.value)}
                  value={slug}
                />
              </GridItem>
            </Grid>
          </Box>
        </Stack>

        <Box>
          <div> Rendering the deeply nested data...</div>
          <RenderDeeplyNestedObject
            data={selectableData["populate"]}
            toggleSelectedOfField={toggleSelectedOfField}
          />
          <div>
            <hr />
            <code>
              <pre>{JSON.stringify(selectableData, null, 2)}</pre>
            </code>
          </div>
        </Box>
      </ContentLayout>
    </>
  );
};

export default CustomAPICustomizationPage;
