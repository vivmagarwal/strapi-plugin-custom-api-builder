/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect } from "react";
import { Main, EmptyStateLayout, Button, Flex, Box, Typography } from "@strapi/design-system";
import { Page } from "@strapi/strapi/admin";
import { Plus } from "@strapi/icons";
import { upperFirst } from '../../utils/helpers';
import { Illo } from "../../components/Illo/index.jsx";
import CustomAPITable from "../../components/CustomAPITable/index.jsx";
import CustomAPICustomizationPage from "../CustomAPICustomizationPage";
import customApiRequest from "../../api/custom-api";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [customAPIData, setCustomAPIData] = useState([]);
  const [contentTypeCount, setContentTypeCount] = useState(0);

  const [showCustomAPICustomizationPage, setShowCustomAPICustomizationPage] =
    useState(false);

  const fetchData = async () => {
    if (isLoading === false) setIsLoading(true);
    const customApiData = await customApiRequest.getAllCustomApis();
    setCustomAPIData(customApiData);

    const contentTypeData = await customApiRequest.getAllContentTypes();
    setContentTypeCount(contentTypeData.length);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function deleteCustomAPI() {
    alert("Add functionality to delete the API");
  }

  async function editCustomAPI(id) {
    setShowCustomAPICustomizationPage({ id: id });
  }

  if (isLoading) {
    return <Page.Loading />;
  }

  return (
    <Main>
      <Box background="neutral0" paddingTop={6} paddingBottom={6} paddingLeft={10} paddingRight={10}>
        <Flex direction="column" gap={1} alignItems="flex-start">
          <Typography variant="alpha" as="h2">
            Custom API Builder Plugin
          </Typography>
          <Typography variant="epsilon" textColor="neutral600">
            Visually build a custom API endpoint for any content type with fields nested any level deep
          </Typography>
        </Flex>
      </Box>

      <Box paddingLeft={10} paddingRight={10}>
        {customAPIData.length === 0 && !showCustomAPICustomizationPage && (
          <div>
            <EmptyStateLayout
              icon={<Illo />}
              content={
                !!!contentTypeCount
                  ? "You require at least 1 collection type to proceed, Content-Type builder -> Create new collection type"
                  : "You don't have any custom API yet"
              }
              action={
                <Button
                  onClick={() =>
                    setShowCustomAPICustomizationPage({ id: null })
                  }
                  variant="secondary"
                  startIcon={<Plus />}
                  disabled={!!!contentTypeCount}
                >
                  Add your first Custom API
                </Button>
              }
            />
          </div>
        )}

        {customAPIData.length > 0 && !showCustomAPICustomizationPage && (
          <>
            <Box background="neutral0" paddingTop={6} paddingBottom={6} paddingLeft={10} paddingRight={10}>
              <Flex justifyContent="space-between" alignItems="center">
                <Flex direction="column" gap={1} alignItems="flex-start">
                  <Typography variant="alpha" as="h1">
                    {upperFirst(
                      `custom  API${customAPIData.length > 1 ? "s" : ""}`
                    )}
                  </Typography>
                  <Typography variant="epsilon" textColor="neutral600">
                    {`${customAPIData.length} ${customAPIData.length > 1 ? "entries" : "entry"
                      } found`}
                  </Typography>
                </Flex>
                <Button
                  startIcon={<Plus />}
                  onClick={() => {
                    setShowCustomAPICustomizationPage({ id: null });
                  }}
                  type="submit"
                  disabled={false}
                >
                  Create new custom API
                </Button>
              </Flex>
            </Box>
            <Box paddingLeft={10} paddingRight={10}>
              <CustomAPITable
                customAPIData={customAPIData}
                setShowCustomAPICustomizationPage={
                  setShowCustomAPICustomizationPage
                }
                deleteCustomAPI={deleteCustomAPI}
                editCustomAPI={editCustomAPI}
              />
            </Box>
          </>
        )}

        {showCustomAPICustomizationPage && (
          <CustomAPICustomizationPage
            showCustomAPICustomizationPage={showCustomAPICustomizationPage}
            setShowCustomAPICustomizationPage={
              setShowCustomAPICustomizationPage
            }
            isLoading={isLoading}
            fetchData={fetchData}
          />
        )}
      </Box>
    </Main>
  );
};

export default memo(HomePage);
