import React from "react";
import { Plus } from "@strapi/icons";
import { Button, Flex, Box, Typography } from "@strapi/design-system";
import { upperFirst } from '../../utils/helpers';

export default function CustomAPICount({
  count,
  setShowCustomAPICustomizationPage,
}) {
  return (
    <Box background="neutral0" paddingTop={6} paddingBottom={6} paddingLeft={10} paddingRight={10}>
      <Flex justifyContent="space-between" alignItems="center">
        <Flex direction="column" gap={1} alignItems="flex-start">
          <Typography variant="alpha" as="h1">
            {upperFirst(`custom  API${count > 1 ? "s" : ""}`)}
          </Typography>
          <Typography variant="epsilon" textColor="neutral600">
            {`${count} ${count > 1 ? "entries" : "entry"} found`}
          </Typography>
        </Flex>
        <Button
          startIcon={<Plus />}
          onClick={() => setShowCustomAPICustomizationPage(true)}
          type="submit"
          disabled={false}
        >
          Create new custom API
        </Button>
      </Flex>
    </Box>
  );
}
