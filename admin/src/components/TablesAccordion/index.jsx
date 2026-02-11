import React, { useState } from "react";
import { Accordion, Box } from "@strapi/design-system";

export function TablesAccordion({ children, table, ...rest }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Accordion.Root
      value={expanded ? "acc-1" : ""}
      onValueChange={(val) => setExpanded(val === "acc-1")}
      size="S"
      {...rest}
    >
      <Accordion.Item value="acc-1">
        <Accordion.Header>
          <Accordion.Trigger>{table}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <Box padding={3}>{children}</Box>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
