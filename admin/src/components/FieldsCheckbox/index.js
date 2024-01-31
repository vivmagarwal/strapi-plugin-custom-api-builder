import React, { useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";
import { Checkbox } from "@strapi/design-system/Checkbox";

export function FieldsCheckbox({ table, field, toggleSelectedOfField }) {
  const [val, setValue] = useState(field.selected);

  return (
    <Box>
      <Checkbox
        aria-label="fields checkbox"
        name={`base-checkbox-${table}-${field.name}`}
        id={`base-checkbox-${table}-${field.name}`}
        onValueChange={(value) => {
          setValue(value);
          toggleSelectedOfField(table, field.name);
        }}
        value={val}
        disabled={field.name === "id"}
      >
        {field.name}
      </Checkbox>
    </Box>
  );
}
