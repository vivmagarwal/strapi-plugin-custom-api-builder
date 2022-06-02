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

const CustomAPICustomizationPage = ({
  setShowCustomAPICustomizationPage,
  fetchData,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

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
      </ContentLayout>
    </>
  );
};

export default CustomAPICustomizationPage;
