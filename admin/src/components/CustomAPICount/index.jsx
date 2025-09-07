import React from "react";
import { Link } from "@strapi/strapi/admin";
import { ArrowLeft } from "@strapi/icons";
import { Check } from "@strapi/icons";
import { Pencil } from "@strapi/icons";
import { Flex, Box } from "@strapi/design-system";
import get from "lodash/get";
import has from "lodash/has";
import isEqual from "lodash/isEqual";
import { useIntl } from "react-intl";
import { useMatch, useLocation } from "react-router-dom";
import { Plus } from "@strapi/icons";
import { Button, Stack, HeaderLayout } from "@strapi/design-system";
import upperFirst from "lodash/upperFirst";

export default function CustomAPICount({
  count,
  setShowCustomAPICustomizationPage,
}) {
  return (
    <>
      <HeaderLayout
        id="title"
        primaryAction={
          <Stack horizontal spacing={2}>
            <Button
              startIcon={<Plus />}
              onClick={() => setShowCustomAPICustomizationPage(true)}
              type="submit"
              disabled={false}
            >
              Create new custom API
            </Button>
          </Stack>
        }
        title={upperFirst(`custom  API${count > 1 ? "s" : ""}`)}
        subtitle={`${count} ${count > 1 ? "entries" : "entry"} found`}
      />
    </>
  );
}
