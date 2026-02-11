import React from "react";
import {
  Table,
  Thead,
  TFooter,
  Tbody,
  Tr,
  Td,
  Th,
  Box,
  Flex,
  Typography,
  IconButton,
  VisuallyHidden,
  Badge,
} from "@strapi/design-system";
import { Eye as Show } from '@strapi/icons';
import { Pencil } from "@strapi/icons";
import { Trash } from "@strapi/icons";
import { Plus } from "@strapi/icons";
import openWithNewTab from '../../utils/openWithNewTab';

function countSelectedFields(structure) {
  if (!structure || !structure.populate || !Array.isArray(structure.populate)) return 0;
  let count = 0;
  function walk(data) {
    const categories = ['fields', 'media', 'components', 'dynamiczones'];
    categories.forEach((cat) => {
      if (data[cat] && data[cat].length > 0) {
        data[cat].forEach((item) => {
          if (item.selected) count++;
        });
      }
    });
    if (data.populate && Array.isArray(data.populate)) {
      data.populate.forEach(walk);
    }
  }
  structure.populate.forEach(walk);
  return count;
}

export default function CustomAPITable({
  customAPIData,
  deleteCustomAPI,
  editCustomAPI,
  setShowCustomAPICustomizationPage,
}) {
  return (
    <Box
      background="neutral0"
      hasRadius={true}
      shadow="filterShadow"
      padding={8}
      style={{ marginTop: "10px" }}
    >
      <Table
        colCount={6}
        rowCount={customAPIData.length}
        footer={
          <TFooter
            onClick={() => setShowCustomAPICustomizationPage({ id: null })}
            icon={<Plus />}
          >
            Add a CustomAPI
          </TFooter>
        }
      >
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">ID</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">Custom API Name</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">Content Type</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">Endpoint</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">Fields</Typography>
            </Th>

            <Th>
              <VisuallyHidden>Actions</VisuallyHidden>
            </Th>
          </Tr>
        </Thead>

        <Tbody>
          {customAPIData.map((customAPI) => {
            const fieldCount = countSelectedFields(customAPI.structure);
            return (
              <Tr key={customAPI.id}>
                <Td>
                  <Typography textColor="neutral800">{customAPI.id}</Typography>
                </Td>

                <Td>
                  <Typography textColor="neutral800">
                      {customAPI.name}
                  </Typography>
                </Td>

                <Td>
                  <Typography textColor="neutral800">
                    {customAPI.selectedContentType?.displayName || '-'}
                  </Typography>
                </Td>

                <Td>
                  <code style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    padding: '2px 6px',
                    background: '#f0f0ff',
                    borderRadius: '4px',
                  }}>
                    /custom-api/{customAPI.slug}
                  </code>
                </Td>

                <Td>
                  <Badge>{fieldCount}</Badge>
                </Td>

                <Td>
                  <Flex style={{ justifyContent: "end" }}>
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        openWithNewTab(`/custom-api/${customAPI.slug}`);
                      }}
                      variant="ghost"
                      label="Open target"
                    >
                      <Show />
                    </IconButton>

                    <IconButton
                      onClick={() => editCustomAPI(customAPI.documentId)}
                      label="Edit"
                      variant="ghost"
                    >
                      <Pencil />
                    </IconButton>

                    <Box paddingLeft={1}>
                      <IconButton
                        onClick={() => deleteCustomAPI(customAPI)}
                        label="Delete"
                        variant="ghost"
                      >
                        <Trash />
                      </IconButton>
                    </Box>
                  </Flex>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
