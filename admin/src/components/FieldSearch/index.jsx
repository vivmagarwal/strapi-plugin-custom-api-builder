import React, { useState, useCallback } from 'react';
import { TextInput, Box, Typography, Stack, Badge, Flex } from '@strapi/design-system';
import { Search } from '@strapi/icons';

/**
 * Field search component for filtering large field lists
 * Provides search, type filtering, and field count display
 */
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

  return (
    <Box padding={4} background="neutral0" borderColor="neutral200" hasRadius>
      <Stack spacing={3}>
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
          clearLabel="Clear search"
          onClear={() => {
            setSearchTerm('');
            if (onSearch) onSearch('', Array.from(selectedTypes));
          }}
        />

        {fieldTypes.length > 0 && (
          <Box>
            <Typography variant="pi" textColor="neutral600" as="p" marginBottom={2}>
              Filter by type:
            </Typography>
            <Flex gap={2} wrap="wrap">
              {fieldTypes.map(type => (
                <Badge
                  key={type}
                  active={selectedTypes.has(type)}
                  onClick={() => handleTypeToggle(type)}
                  style={{ cursor: 'pointer' }}
                >
                  {type}
                </Badge>
              ))}
              {(searchTerm || selectedTypes.size > 0) && (
                <Badge
                  onClick={clearFilters}
                  style={{ cursor: 'pointer' }}
                  textColor="danger600"
                >
                  Clear all
                </Badge>
              )}
            </Flex>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default FieldSearch;