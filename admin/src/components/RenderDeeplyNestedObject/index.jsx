import React from 'react';
import { Box, Typography, Flex, Checkbox } from '@strapi/design-system';

const RenderDeeplyNestedObject = ({ data, toggleSelectedOfField, toggleSelectedOfMedia, toggleSelectedOfComponent, toggleSelectedOfDynamicZone }) => {
  return (
    <Box padding={4} background="neutral100" shadow="filterShadow" hasRadius>
      <Flex direction="column" gap={2} alignItems="stretch">
        <Typography variant="delta">{data.table}</Typography>

        {/* Render Fields */}
        {data.fields && data.fields.length > 0 && (
          <Box>
            <Typography variant="epsilon">Fields</Typography>
            {data.fields.map((field) => (
              <Checkbox
                key={field.name}
                name={field.name}
                onCheckedChange={() => toggleSelectedOfField(data.table, field.name)}
                checked={field.selected}
              >
                {field.name}
              </Checkbox>
            ))}
          </Box>
        )}

        {/* Render Media */}
        {data.media && data.media.length > 0 && (
          <Box>
            <Typography variant="epsilon">Media</Typography>
            {data.media.map((media) => (
              <Checkbox
                key={media.name}
                name={media.name}
                onCheckedChange={() => toggleSelectedOfMedia(data.table, media.name)}
                checked={media.selected}
              >
                {media.name}
              </Checkbox>
            ))}
          </Box>
        )}

        {/* Render Components */}
        {data.components && data.components.length > 0 && (
          <Box>
            <Typography variant="epsilon">Components</Typography>
            {data.components.map((component) => (
              <Checkbox
                key={component.name}
                name={component.name}
                onCheckedChange={() => toggleSelectedOfComponent(data.table, component.name)}
                checked={component.selected}
              >
                {component.name}
              </Checkbox>
            ))}
          </Box>
        )}

        {/* Render Dynamic Zones */}
        {data.dynamiczones && data.dynamiczones.length > 0 && (
          <Box>
            <Typography variant="epsilon">Dynamic Zones</Typography>
            {data.dynamiczones.map((dynamiczone) => (
              <Checkbox
                key={dynamiczone.name}
                name={dynamiczone.name}
                onCheckedChange={() => toggleSelectedOfDynamicZone(data.table, dynamiczone.name)}
                checked={dynamiczone.selected}
              >
                {dynamiczone.name}
              </Checkbox>
            ))}
          </Box>
        )}

        {/* Recursive Rendering for Populated Data */}
        {data.populate && data.populate.length > 0 && (
          <Box>
            {data.populate.map((nestedData) => (
              <RenderDeeplyNestedObject
                key={nestedData.table}
                data={nestedData}
                toggleSelectedOfField={toggleSelectedOfField}
                toggleSelectedOfMedia={toggleSelectedOfMedia}
                toggleSelectedOfComponent={toggleSelectedOfComponent}
                toggleSelectedOfDynamicZone={toggleSelectedOfDynamicZone}
              />
            ))}
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default RenderDeeplyNestedObject;
