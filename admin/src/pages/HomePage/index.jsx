/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect } from "react";
import { Main, EmptyStateLayout, Button, Flex, Box, Typography, Dialog, Alert } from "@strapi/design-system";
import { Page } from "@strapi/strapi/admin";
import { Plus, WarningCircle } from "@strapi/icons";
import { upperFirst } from '../../utils/helpers';
import { Illo } from "../../components/Illo/index.jsx";
import CustomAPITable from "../../components/CustomAPITable/index.jsx";
import CustomAPICustomizationPage from "../CustomAPICustomizationPage";
import customApiRequest from "../../api/custom-api";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [customAPIData, setCustomAPIData] = useState([]);
  const [contentTypeCount, setContentTypeCount] = useState(0);
  const [showCustomAPICustomizationPage, setShowCustomAPICustomizationPage] = useState(false);

  // Delete dialog state
  const [apiToDelete, setApiToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback alert state
  const [feedback, setFeedback] = useState(null);

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

  function showDeleteDialog(api) {
    setApiToDelete(api);
  }

  async function confirmDelete() {
    if (!apiToDelete) return;

    setIsDeleting(true);
    try {
      await customApiRequest.deleteCustomApi(apiToDelete.documentId);
      setFeedback({ type: 'success', message: `"${apiToDelete.name}" has been deleted successfully.` });
      setApiToDelete(null);
      await fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      setFeedback({ type: 'danger', message: `Failed to delete "${apiToDelete.name}". ${error.message || 'Please try again.'}` });
      setApiToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  async function editCustomAPI(id) {
    setShowCustomAPICustomizationPage({ id: id });
  }

  function handleFeedback(type, message) {
    setFeedback({ type, message });
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
        {/* Feedback Alert */}
        {feedback && (
          <Box paddingBottom={4}>
            <Alert
              title={feedback.type === 'success' ? 'Success' : 'Error'}
              variant={feedback.type}
              closeLabel="Dismiss"
              onClose={() => setFeedback(null)}
            >
              {feedback.message}
            </Alert>
          </Box>
        )}

        {customAPIData.length === 0 && !showCustomAPICustomizationPage && (
          <div>
            <EmptyStateLayout
              icon={<Illo />}
              content={
                !!!contentTypeCount
                  ? "You require at least 1 collection type to proceed. Go to Content-Type Builder and create a new collection type."
                  : "No custom APIs have been created yet. Create your first custom API to get started."
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
                deleteCustomAPI={showDeleteDialog}
                editCustomAPI={editCustomAPI}
              />
            </Box>
          </>
        )}

        {showCustomAPICustomizationPage && (
          <CustomAPICustomizationPage
            key={showCustomAPICustomizationPage?.id || 'new'}
            showCustomAPICustomizationPage={showCustomAPICustomizationPage}
            setShowCustomAPICustomizationPage={
              setShowCustomAPICustomizationPage
            }
            isLoading={isLoading}
            fetchData={fetchData}
            onFeedback={handleFeedback}
          />
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!apiToDelete} onOpenChange={(open) => { if (!open) setApiToDelete(null); }}>
        <Dialog.Content>
          <Dialog.Header>Delete Custom API</Dialog.Header>
          <Dialog.Body icon={<WarningCircle fill="danger600" />}>
            Are you sure you want to delete "{apiToDelete?.name}"? This action cannot be undone.
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Cancel>
              <Button variant="tertiary" disabled={isDeleting}>Cancel</Button>
            </Dialog.Cancel>
            <Dialog.Action>
              <Button variant="danger" onClick={confirmDelete} loading={isDeleting}>
                Delete
              </Button>
            </Dialog.Action>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Main>
  );
};

export default memo(HomePage);
