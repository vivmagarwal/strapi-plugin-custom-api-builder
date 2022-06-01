import React from "react";
import { useTracking, Link } from "@strapi/helper-plugin";
import ArrowLeft from "@strapi/icons/ArrowLeft";
import Check from "@strapi/icons/Check";
import Pencil from "@strapi/icons/Pencil";
import { Flex } from "@strapi/design-system/Flex";
import { Box } from "@strapi/design-system/Box";
import get from "lodash/get";
import has from "lodash/has";
import isEqual from "lodash/isEqual";
import { useIntl } from "react-intl";
import { Prompt, useRouteMatch } from "react-router-dom";
import Plus from "@strapi/icons/Plus";
import { Button } from "@strapi/design-system/Button";
import { Stack } from "@strapi/design-system/Stack";
import { HeaderLayout } from "@strapi/design-system/Layout";
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
