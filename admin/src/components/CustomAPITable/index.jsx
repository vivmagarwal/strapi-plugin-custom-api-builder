import React, { useState } from "react";
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
  Button,
  Typography,
  IconButton,
  VisuallyHidden,
  Checkbox,
  TextInput,
} from "@strapi/design-system";
import { Eye as Show } from '@strapi/icons';
import { Pencil } from "@strapi/icons";
import { Trash } from "@strapi/icons";
import { Plus } from "@strapi/icons";
import openWithNewTab from '../../utils/openWithNewTab';

function CustomAPICheckbox({ value, checkboxID, callback, disabled }) {
  const [isChecked, setIsChecked] = useState(value);

  function handleChange() {
    setIsChecked(!isChecked);
    {
      callback && callback({ id: checkboxID, value: !isChecked });
    }
  }

  return (
    <Checkbox
      checked={isChecked}
      onCheckedChange={handleChange}
      disabled={disabled}
    />
  );
}

function CustomAPIInput({ value, onChange }) {
  return (
    <TextInput
      type="text"
      aria-label="customAPI-input"
      name="customAPI-input"
      onChange={onChange}
      value={value}
    />
  );
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
        colCount={4}
        rowCount={10}
        footer={
          <TFooter
            onClick={() => setShowCustomAPICustomizationPage(true)}
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
              <Typography variant="sigma">Slug</Typography>
            </Th>

            <Th>
              <VisuallyHidden>Actions</VisuallyHidden>
            </Th>
          </Tr>
        </Thead>

        <Tbody>
          {customAPIData.map((customAPI) => {
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
                    {customAPI.slug}
                  </Typography>
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
                      onClick={() => editCustomAPI(customAPI.id)}
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
