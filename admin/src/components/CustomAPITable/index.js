import React, { useState } from "react";
import {
  Table,
  Thead,
  TFooter,
  Tbody,
  Tr,
  Td,
  Th,
} from "@strapi/design-system/Table";
import { Box } from "@strapi/design-system/Box";
import { Flex } from "@strapi/design-system/Flex";
import { Button } from "@strapi/design-system/Button";
import { Typography } from "@strapi/design-system/Typography";
import { IconButton } from "@strapi/design-system/IconButton";
import { VisuallyHidden } from "@strapi/design-system/VisuallyHidden";
import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";
import { TextInput } from "@strapi/design-system/TextInput";
import Show from '@strapi/icons/Eye';
import Pencil from "@strapi/icons/Pencil";
import Trash from "@strapi/icons/Trash";
import Plus from "@strapi/icons/Plus";
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
    <BaseCheckbox
      checked={isChecked}
      onChange={handleChange}
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
                    <IconButton onClick={(e) => {
                        e.preventDefault();
                        openWithNewTab(`/custom-api/${customAPI.slug}`);
                      }}
                      noBorder
                      icon={<Show />}
                      label={'Open target'}
                    />

                    <IconButton
                      onClick={() => editCustomAPI(customAPI.id)}
                      label="Edit"
                      noBorder
                      icon={<Pencil />}
                    />

                    <Box paddingLeft={1}>
                      <IconButton
                        onClick={() => deleteCustomAPI(customAPI)}
                        label="Delete"
                        noBorder
                        icon={<Trash />}
                      />
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
