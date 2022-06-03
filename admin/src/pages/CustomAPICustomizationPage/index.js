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
import { TextInput } from "@strapi/design-system/TextInput";
import customApiRequest from "../../api/custom-api";

function RenderDeeplyNestedObject({ data }) {
  let { table, fields, populate } = data;

  return (
    <>
      <div>{table}</div>
      <ul>
        {fields.map((field) => {
          return <li key={field}>{field}</li>;
        })}

        {populate && populate.table && (
          <RenderDeeplyNestedObject data={populate} />
        )}
      </ul>
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
      table: "Authors",
      fields: ["AuthorName", "AuthorAge"],
      populate: {
        table: "Books",
        fields: ["BookTitle"],
        populate: {
          table: "Publishers",
          fields: ["PublisherName"],
          populate: null,
        },
      },
    },
  });

  const fetchContentTypeData = async () => {
    const contentTypeDataRaw = await customApiRequest.getAllContentTypes();
  };

  useEffect(async () => {
    fetchContentTypeData();
  }, []);

  const handleSubmit = async (e) => {
    // Prevent submitting parent form
    e.preventDefault();
    e.stopPropagation();

    try {
      await customApiRequest.addCustomApi({
        name: name,
        slug: slug,
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
          <RenderDeeplyNestedObject data={selectableData["populate"]} />
        </Box>
      </ContentLayout>
    </>
  );
};

export default CustomAPICustomizationPage;
