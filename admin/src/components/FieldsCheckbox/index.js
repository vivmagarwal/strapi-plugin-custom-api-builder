import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";
import React, { useState, useEffect } from "react";
import { Box } from "@strapi/design-system/Box";

export function FieldsCheckbox({ table, field, toggleSelectedOfField }) {
  const [val, setValue] = useState(field.selected);

  return (
    <Box>
      <BaseCheckbox
        aria-label="fields checkbox"
        name={`base-checkbox-${table}-${field.name}`}
        id={`base-checkbox-${table}-${field.name}`}
        onValueChange={(value) => {
          setValue(value);
          toggleSelectedOfField(table, field.name);
        }}
        value={val}
        disabled={field.name === "id"}
      />
      <label
        style={{ marginLeft: 5 }}
        htmlFor={`base-checkbox-${table}-${field.name}`}
      >
        {field.name}
      </label>
    </Box>
  );
}
