import React, { useState } from 'react';
import { Box, Typography, Badge, Flex, Button } from '@strapi/design-system';
import { Eye, EyeStriked, Duplicate, Check } from '@strapi/icons';

const codeStyle = {
  padding: '4px 8px',
  background: '#f0f0ff',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '13px',
};

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
      <Flex direction="column" gap={4} alignItems="stretch">
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
          <Typography variant="omega" textColor="neutral600" as="p">
            API Endpoint
          </Typography>
          <Flex gap={2} alignItems="center" paddingTop={1}>
            <code style={codeStyle}>
              GET {apiEndpoint || '/custom-api/[slug]'}
            </code>
            <Button
              variant="ghost"
              size="S"
              onClick={() => handleCopy(apiEndpoint, 'endpoint')}
              startIcon={copiedItem === 'endpoint' ? <Check /> : <Duplicate />}
            >
              {copiedItem === 'endpoint' ? 'Copied!' : 'Copy'}
            </Button>
          </Flex>
        </Box>

        {isExpanded && (
          <>
            {showRawQuery && queryConfig && Object.keys(queryConfig).length > 0 && (
              <Box>
                <Typography variant="omega" textColor="neutral600" as="p">
                  Query Configuration
                </Typography>
                <Box background="neutral100" padding={3} hasRadius marginTop={1}>
                  <pre style={{
                    margin: 0,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    overflow: 'auto'
                  }}>
                    {formatQuery(queryConfig)}
                  </pre>
                </Box>
                <Box paddingTop={1}>
                  <Button
                    variant="ghost"
                    size="S"
                    onClick={() => handleCopy(formatQuery(queryConfig), 'query')}
                    startIcon={copiedItem === 'query' ? <Check /> : <Duplicate />}
                  >
                    {copiedItem === 'query' ? 'Copied!' : 'Copy Query'}
                  </Button>
                </Box>
              </Box>
            )}

            <Box>
              <Typography variant="omega" textColor="neutral600" as="p">
                Example cURL Command
              </Typography>
              <Box background="neutral100" padding={3} hasRadius marginTop={1}>
                <pre style={{
                  margin: 0,
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflow: 'auto'
                }}>
                  {generateCurlCommand()}
                </pre>
              </Box>
              <Box paddingTop={1}>
                <Button
                  variant="ghost"
                  size="S"
                  onClick={() => handleCopy(generateCurlCommand(), 'curl')}
                  startIcon={copiedItem === 'curl' ? <Check /> : <Duplicate />}
                >
                  {copiedItem === 'curl' ? 'Copied!' : 'Copy cURL'}
                </Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="omega" textColor="neutral600" as="p">
                JavaScript Example
              </Typography>
              <Box background="neutral100" padding={3} hasRadius marginTop={1}>
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
              <Box paddingTop={1}>
                <Button
                  variant="ghost"
                  size="S"
                  onClick={() => handleCopy(generateJavaScriptExample(), 'js')}
                  startIcon={copiedItem === 'js' ? <Check /> : <Duplicate />}
                >
                  {copiedItem === 'js' ? 'Copied!' : 'Copy JavaScript'}
                </Button>
              </Box>
            </Box>

            {exampleResponse && (
              <Box>
                <Typography variant="omega" textColor="neutral600" as="p">
                  Example Response
                </Typography>
                <Box background="neutral100" padding={3} hasRadius marginTop={1}>
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
          <Typography variant="omega" textColor="neutral600" as="p">
            Available Features
          </Typography>
          <Flex gap={2} wrap="wrap" paddingTop={1}>
            <Badge>Filtering</Badge>
            <Badge>Sorting</Badge>
            <Badge>Pagination</Badge>
            <Badge>Field Selection</Badge>
            <Badge>Relationships</Badge>
            <Badge>Media</Badge>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default QueryVisualization;
