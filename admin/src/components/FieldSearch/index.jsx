import React, { useState, useCallback } from 'react';
import { TextInput, Box, Typography, Badge, Flex, Button } from '@strapi/design-system';
import { Search, Cross } from '@strapi/icons';

const FieldSearch = ({
  onSearch,
  totalFields = 0,
  selectedFields = 0,
  fieldTypes = [],
  onTypeFilter = null,
  placeholder = "Search fields..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(new Set());

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value, Array.from(selectedTypes));
    }
  }, [onSearch, selectedTypes]);

  const handleTypeToggle = useCallback((type) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);

    if (onTypeFilter) {
      onTypeFilter(Array.from(newTypes));
    }
    if (onSearch) {
      onSearch(searchTerm, Array.from(newTypes));
    }
  }, [selectedTypes, searchTerm, onSearch, onTypeFilter]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedTypes(new Set());
    if (onSearch) {
      onSearch('', []);
    }
  }, [onSearch]);

  const hasActiveFilters = searchTerm || selectedTypes.size > 0;

  return (
    <Box padding={4} background="neutral0" borderColor="neutral200" hasRadius>
      <Flex direction="column" gap={3} alignItems="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Typography variant="sigma" textColor="neutral600">
            Field Selection
          </Typography>
          <Flex gap={2}>
            <Badge>{selectedFields} selected</Badge>
            <Badge>{totalFields} total</Badge>
          </Flex>
        </Flex>

        <TextInput
          placeholder={placeholder}
          label="Search fields"
          name="fieldSearch"
          onChange={handleSearchChange}
          value={searchTerm}
          startAction={<Search />}
        />

        {fieldTypes.length > 0 && (
          <Box>
            <Typography variant="pi" textColor="neutral600">
              Filter by type:
            </Typography>
            <Flex gap={2} wrap="wrap" paddingTop={2}>
              {fieldTypes.map(type => (
                <Box
                  key={type}
                  as="button"
                  background={selectedTypes.has(type) ? 'primary100' : 'neutral100'}
                  borderColor={selectedTypes.has(type) ? 'primary600' : 'neutral200'}
                  padding={1}
                  paddingLeft={3}
                  paddingRight={3}
                  hasRadius
                  onClick={() => handleTypeToggle(type)}
                  style={{ cursor: 'pointer', border: '1px solid' }}
                >
                  <Typography variant="pi" textColor={selectedTypes.has(type) ? 'primary600' : 'neutral700'}>
                    {type}
                  </Typography>
                </Box>
              ))}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="S"
                  startIcon={<Cross />}
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              )}
            </Flex>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default FieldSearch;
