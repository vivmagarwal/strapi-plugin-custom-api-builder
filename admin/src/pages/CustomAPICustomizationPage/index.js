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

const CustomAPICustomizationPage = ({ setShowCustomAPICustomizationPage }) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  return (
    <>
      <HeaderLayout
        id="title"
        primaryAction={
          <Stack horizontal spacing={2}>
            <Button
              startIcon={<Check />}
              onClick={() => ({})}
              type="submit"
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
                  error={name.length > 5 ? "Content is too long" : undefined}
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
                  error={slug.length > 5 ? "Content is too long" : undefined}
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
