import React, { useState } from "react";
import { Box, Checkbox } from "@strapi/design-system";

export function FieldsCheckbox({ table, field, toggleSelectedOfField }) {
  const [val, setValue] = useState(field.selected);

  return (
    <Box paddingTop={1} paddingBottom={1}>
      <Checkbox
        aria-label="fields checkbox"
        name={`base-checkbox-${table}-${field.name}`}
        id={`base-checkbox-${table}-${field.name}`}
        onCheckedChange={(checked) => {
          setValue(checked);
          toggleSelectedOfField(table, field.name);
        }}
        checked={val}
        disabled={field.name === "id"}
      >
        {field.name}
      </Checkbox>
    </Box>
  );
}
