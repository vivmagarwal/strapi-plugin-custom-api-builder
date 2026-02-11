import React from 'react';
import { Box, Typography, Flex, Checkbox, Accordion, Badge } from '@strapi/design-system';

const DEPTH_COLORS = [
  'primary200',
  'secondary200',
  'warning200',
  'success200',
  'danger200',
];

function getDepthColor(depth) {
  return DEPTH_COLORS[depth % DEPTH_COLORS.length];
}

function getCategoryLabel(key) {
  const labels = {
    fields: 'Fields',
    media: 'Media',
    components: 'Components',
    dynamiczones: 'Dynamic Zones',
  };
  return labels[key] || key;
}

function countSelected(items) {
  if (!items || !items.length) return { selected: 0, total: 0 };
  const selected = items.filter((item) => item.selected).length;
  return { selected, total: items.length };
}

function getCheckboxState(items) {
  const { selected, total } = countSelected(items);
  if (selected === 0) return false;
  if (selected === total) return true;
  return 'indeterminate';
}

function CategorySection({ categoryKey, items, tableName, toggleCallback, selectAllInCategory }) {
  if (!items || items.length === 0) return null;

  const { selected, total } = countSelected(items);
  const checkboxState = getCheckboxState(items);

  return (
    <Box paddingTop={2} paddingBottom={2}>
      <Flex gap={3} alignItems="center" paddingBottom={2}>
        <Checkbox
          checked={checkboxState}
          onCheckedChange={(checked) => {
            if (selectAllInCategory) {
              selectAllInCategory(tableName, categoryKey, checked === true || checked === 'indeterminate');
            }
          }}
        >
          <Typography variant="sigma" textColor="neutral700">
            {getCategoryLabel(categoryKey)}
          </Typography>
        </Checkbox>
        <Badge>{selected}/{total}</Badge>
      </Flex>
      <Box paddingLeft={6}>
        <Flex direction="column" gap={1} alignItems="stretch">
          {items.map((item) => (
            <Checkbox
              key={item.name}
              name={item.name}
              onCheckedChange={() => toggleCallback(tableName, item.name)}
              checked={item.selected}
            >
              {item.name}
            </Checkbox>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

const RenderDeeplyNestedObject = ({
  data,
  depth = 0,
  searchTerm = '',
  typeFilters = [],
  toggleSelectedOfField,
  toggleSelectedOfMedia,
  toggleSelectedOfComponent,
  toggleSelectedOfDynamicZone,
  selectAllInCategory,
}) => {
  const depthColor = getDepthColor(depth);

  // Count all selected items across all categories
  const categories = ['fields', 'media', 'components', 'dynamiczones'];
  let totalSelected = 0;
  let totalItems = 0;
  categories.forEach((cat) => {
    if (data[cat] && data[cat].length > 0) {
      const counts = countSelected(data[cat]);
      totalSelected += counts.selected;
      totalItems += counts.total;
    }
  });

  const toggleCallbacks = {
    fields: toggleSelectedOfField,
    media: toggleSelectedOfMedia,
    components: toggleSelectedOfComponent,
    dynamiczones: toggleSelectedOfDynamicZone,
  };

  const accordionValue = `depth-${depth}-${data.table}`;

  // Filter categories based on type filters
  const visibleCategories = typeFilters.length > 0
    ? categories.filter((cat) => typeFilters.includes(cat))
    : categories;

  const content = (
    <Box
      style={{ borderLeft: `3px solid var(--strapi-clr-${depthColor})` }}
      paddingLeft={4}
    >
      <Flex direction="column" gap={1} alignItems="stretch">
        {visibleCategories.map((catKey) => {
          // Filter items by search term
          let items = data[catKey];
          if (searchTerm && items && items.length > 0) {
            items = items.filter((item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          if (!items || items.length === 0) return null;
          return (
            <CategorySection
              key={catKey}
              categoryKey={catKey}
              items={items}
              tableName={data.table}
              toggleCallback={toggleCallbacks[catKey]}
              selectAllInCategory={selectAllInCategory}
            />
          );
        })}

        {/* Recursive Rendering for Populated Data */}
        {data.populate && data.populate.length > 0 && (
          <Box paddingTop={2}>
            {data.populate.map((nestedData) => (
              <RenderDeeplyNestedObject
                key={nestedData.table}
                data={nestedData}
                depth={depth + 1}
                searchTerm={searchTerm}
                typeFilters={typeFilters}
                toggleSelectedOfField={toggleSelectedOfField}
                toggleSelectedOfMedia={toggleSelectedOfMedia}
                toggleSelectedOfComponent={toggleSelectedOfComponent}
                toggleSelectedOfDynamicZone={toggleSelectedOfDynamicZone}
                selectAllInCategory={selectAllInCategory}
              />
            ))}
          </Box>
        )}
      </Flex>
    </Box>
  );

  // Root level (depth 0): expanded by default, show as accordion
  // Nested levels: collapsed by default
  return (
    <Box paddingBottom={2}>
      <Accordion.Root
        type="multiple"
        defaultValue={depth === 0 ? [accordionValue] : []}
      >
        <Accordion.Item value={accordionValue}>
          <Accordion.Header>
            <Accordion.Trigger>
              <Flex gap={2} alignItems="center">
                {data.table}
                {totalItems > 0 && (
                  <Badge>{totalSelected}/{totalItems} selected</Badge>
                )}
                {depth > 0 && (
                  <Badge>Level {depth}</Badge>
                )}
              </Flex>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <Box padding={4}>
              {content}
            </Box>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Box>
  );
};

export default RenderDeeplyNestedObject;
