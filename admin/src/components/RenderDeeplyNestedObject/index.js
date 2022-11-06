import { FieldsCheckbox } from "../FieldsCheckbox";
import React, { useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import cloneDeepWith from "lodash/cloneDeepWith";
import { TablesAccordion } from "../TablesAccordion";

function RenderDeeplyNestedObject({
  data,
  toggleSelectedOfField,
  toggleSelectedOfMedia,
}) {
  let { table, fields, populate, media } = data;

  return (
    <>
      <Box padding={8} background="neutral100">
        <TablesAccordion table={table}>
          <ul>
            {fields.map((field) => {
              return (
                <FieldsCheckbox
                  key={field.name}
                  table={table}
                  field={field}
                  toggleSelectedOfField={toggleSelectedOfField}
                />
              );
            })}

            {media.map((item) => {
              return (
                <FieldsCheckbox
                  key={item.name}
                  table={table}
                  field={item}
                  toggleSelectedOfField={toggleSelectedOfMedia}
                />
              );
            })}

            {populate &&
              Array.isArray(populate) &&
              populate.length &&
              populate.map((item) => (
                <RenderDeeplyNestedObject
                  data={item}
                  toggleSelectedOfField={toggleSelectedOfField}
                />
              ))}
          </ul>
        </TablesAccordion>
      </Box>
    </>
  );
}

export { RenderDeeplyNestedObject };
