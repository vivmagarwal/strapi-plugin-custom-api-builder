import React, { useState } from 'react';
import { Box, Typography, Stack, Badge, Flex, Button, Code } from '@strapi/design-system';
import { Eye, EyeStriked, Copy, Check } from '@strapi/icons';

/**
 * Query Visualization Component
 * Shows the constructed query, API endpoint, and example responses
 */
const QueryVisualization = ({ 
  apiEndpoint = '',
  queryConfig = {},
  exampleResponse = null,
  showRawQuery = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);

  const handleCopy = (text, item) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const formatQuery = (config) => {
    return JSON.stringify(config, null, 2);
  };

  const generateCurlCommand = () => {
    const baseUrl = window.location.origin;
    let url = `${baseUrl}${apiEndpoint}`;
    
    // Add example query parameters
    const params = [];
    if (queryConfig.filters) {
      params.push('name[$contains]=example');
    }
    if (queryConfig.sort) {
      params.push('sort=-createdAt');
    }
    if (queryConfig.pagination) {
      params.push('page=1&pageSize=25');
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return `curl -X GET "${url}" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json"`;
  };

  const generateJavaScriptExample = () => {
    const baseUrl = window.location.origin;
    return `// Using fetch API
const response = await fetch('${baseUrl}${apiEndpoint}?page=1&pageSize=25', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);

// With filters and sorting
const url = new URL('${baseUrl}${apiEndpoint}');
url.searchParams.append('sort', '-createdAt');
url.searchParams.append('filters[name][$contains]', 'search');
url.searchParams.append('page', '1');
url.searchParams.append('pageSize', '25');

const filteredResponse = await fetch(url, {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
});`;
  };

  return (
    <Box padding={4} background="neutral0" borderColor="neutral200" hasRadius>
      <Stack spacing={4}>
        <Flex justifyContent="space-between" alignItems="center">
          <Typography variant="sigma" textColor="neutral600">
            Query Visualization
          </Typography>
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            startIcon={isExpanded ? <EyeStriked /> : <Eye />}
          >
            {isExpanded ? 'Hide' : 'Show'} Details
          </Button>
        </Flex>

        <Box>
          <Typography variant="omega" textColor="neutral600" as="p" marginBottom={2}>
            API Endpoint
          </Typography>
          <Flex gap={2} alignItems="center">
            <Code>
              GET {apiEndpoint || '/api/custom-api/[slug]'}
            </Code>
            <Button
              variant="ghost"
              size="S"
              onClick={() => handleCopy(apiEndpoint, 'endpoint')}
              startIcon={copiedItem === 'endpoint' ? <Check /> : <Copy />}
            >
              {copiedItem === 'endpoint' ? 'Copied!' : 'Copy'}
            </Button>
          </Flex>
        </Box>

        {isExpanded && (
          <>
            {showRawQuery && queryConfig && Object.keys(queryConfig).length > 0 && (
              <Box>
                <Typography variant="omega" textColor="neutral600" as="p" marginBottom={2}>
                  Query Configuration
                </Typography>
                <Box background="neutral100" padding={3} hasRadius>
                  <pre style={{ 
                    margin: 0, 
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    overflow: 'auto'
                  }}>
                    {formatQuery(queryConfig)}
                  </pre>
                </Box>
                <Button
                  variant="ghost"
                  size="S"
                  marginTop={2}
                  onClick={() => handleCopy(formatQuery(queryConfig), 'query')}
                  startIcon={copiedItem === 'query' ? <Check /> : <Copy />}
                >
                  {copiedItem === 'query' ? 'Copied!' : 'Copy Query'}
                </Button>
              </Box>
            )}

            <Box>
              <Typography variant="omega" textColor="neutral600" as="p" marginBottom={2}>
                Example cURL Command
              </Typography>
              <Box background="neutral100" padding={3} hasRadius>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflow: 'auto'
                }}>
                  {generateCurlCommand()}
                </pre>
              </Box>
              <Button
                variant="ghost"
                size="S"
                marginTop={2}
                onClick={() => handleCopy(generateCurlCommand(), 'curl')}
                startIcon={copiedItem === 'curl' ? <Check /> : <Copy />}
              >
                {copiedItem === 'curl' ? 'Copied!' : 'Copy cURL'}
              </Button>
            </Box>

            <Box>
              <Typography variant="omega" textColor="neutral600" as="p" marginBottom={2}>
                JavaScript Example
              </Typography>
              <Box background="neutral100" padding={3} hasRadius>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {generateJavaScriptExample()}
                </pre>
              </Box>
              <Button
                variant="ghost"
                size="S"
                marginTop={2}
                onClick={() => handleCopy(generateJavaScriptExample(), 'js')}
                startIcon={copiedItem === 'js' ? <Check /> : <Copy />}
              >
                {copiedItem === 'js' ? 'Copied!' : 'Copy JavaScript'}
              </Button>
            </Box>

            {exampleResponse && (
              <Box>
                <Typography variant="omega" textColor="neutral600" as="p" marginBottom={2}>
                  Example Response
                </Typography>
                <Box background="neutral100" padding={3} hasRadius>
                  <pre style={{ 
                    margin: 0, 
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {JSON.stringify(exampleResponse, null, 2)}
                  </pre>
                </Box>
              </Box>
            )}
          </>
        )}

        <Box>
          <Typography variant="omega" textColor="neutral600" as="p" marginBottom={2}>
            Available Features
          </Typography>
          <Flex gap={2} wrap="wrap">
            <Badge active>Filtering</Badge>
            <Badge active>Sorting</Badge>
            <Badge active>Pagination</Badge>
            <Badge active>Field Selection</Badge>
            <Badge active>Relationship Population</Badge>
            <Badge active>Media Support</Badge>
          </Flex>
        </Box>
      </Stack>
    </Box>
  );
};

export default QueryVisualization;