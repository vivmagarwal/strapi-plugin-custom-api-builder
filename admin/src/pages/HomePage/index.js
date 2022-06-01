/*
 *
 * HomePage
 *
 */

import React, { memo, useState } from "react";
import { Layout, ContentLayout } from "@strapi/design-system/Layout";
import { BaseHeaderLayout, HeaderLayout } from "@strapi/design-system/Layout";
import { EmptyStateLayout } from "@strapi/design-system/EmptyStateLayout";
import { Button } from "@strapi/design-system/Button";
import Plus from "@strapi/icons/Plus";
import { Stack } from "@strapi/design-system/Stack";
import upperFirst from "lodash/upperFirst";
import { Illo } from "../../components/Illo";
import CustomAPICount from "../../components/CustomAPICount";
import CustomAPITable from "../../components/CustomAPITable";
import CustomAPICustomizationPage from "../CustomAPICustomizationPage";

const HomePage = () => {
  const [customAPIData, setCustomAPIData] = useState([
    {
      id: Math.random(),
      name: "My Custom Report",
      slug: "my-custom-report",
    },
  ]);
  const [showCustomAPICustomizationPage, setShowCustomAPICustomizationPage] =
    useState(false);

  async function addCustomAPI(data) {
    setCustomAPIData([...customAPIData, { ...data, id: Math.random() }]);
  }

  async function toggleCustomAPI() {
    alert("Add functionality to disable enable the API");
  }

  async function deleteCustomAPI() {
    alert("Add functionality to delete the API");
  }

  async function editCustomAPI() {
    alert("Add functionality to edit the API");
  }

  return (
    <Layout>
      {JSON.stringify(showCustomAPICustomizationPage)}

      <BaseHeaderLayout
        title="Custom API Builder Plugin"
        subtitle="Visually build a custom API endpoint for any content type with fields nested any level deep"
        as="h2"
      />

      <ContentLayout>
        {customAPIData.length === 0 && (
          <EmptyStateLayout
            icon={<Illo />}
            content="You don't have any Custom API yet..."
            action={
              <Button
                onClick={() =>
                  setShowCustomAPICustomizationPage({ createMode: true })
                }
                variant="secondary"
                startIcon={<Plus />}
              >
                Add your first Custom API
              </Button>
            }
          />
        )}

        {customAPIData.length > 0 && !showCustomAPICustomizationPage && (
          <>
            <HeaderLayout
              id="title"
              primaryAction={
                <Stack horizontal spacing={2}>
                  <Button
                    startIcon={<Plus />}
                    onClick={() => {
                      setShowCustomAPICustomizationPage(true);
                    }}
                    type="submit"
                    disabled={false}
                  >
                    Create new custom API
                  </Button>
                </Stack>
              }
              title={upperFirst(
                `custom  API${customAPIData.length > 1 ? "s" : ""}`
              )}
              subtitle={`${customAPIData.length} ${
                customAPIData.length > 1 ? "entries" : "entry"
              } found`}
            />
            <ContentLayout>
              <CustomAPITable
                customAPIData={customAPIData}
                setShowCustomAPICustomizationPage={
                  setShowCustomAPICustomizationPage
                }
                deleteCustomAPI={deleteCustomAPI}
                editCustomAPI={editCustomAPI}
              />
            </ContentLayout>
          </>
        )}

        {showCustomAPICustomizationPage && (
          <CustomAPICustomizationPage
            setShowCustomAPICustomizationPage={
              setShowCustomAPICustomizationPage
            }
          />
        )}
      </ContentLayout>
    </Layout>
  );
};

export default memo(HomePage);
