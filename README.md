# 🚀 Strapi Custom API Builder Plugin

> **Bringing the power of Drupal Views to Strapi** - Build custom APIs visually, without writing a single line of code!

[![NPM Version](https://img.shields.io/npm/v/strapi-plugin-custom-api)](https://www.npmjs.com/package/strapi-plugin-custom-api)
[![License](https://img.shields.io/npm/l/strapi-plugin-custom-api)](https://github.com/vivmagarwal/strapi-plugin-custom-api-builder/blob/main/LICENSE)

## 🌟 Vision

Remember the power and flexibility of Drupal Views? The ability to create complex, filtered, and sorted data presentations through a visual interface? **This plugin brings that same revolutionary approach to Strapi.**

Just as Drupal Views transformed how developers and content managers create data displays in Drupal, the **Strapi Custom API Builder** empowers you to:

- 🎨 **Visually design APIs** through an intuitive interface
- 🔍 **Apply complex filters** without writing query logic
- 📊 **Sort and paginate** data with simple selections
- 🔗 **Handle relationships** elegantly and automatically
- ⚡ **Generate production-ready endpoints** instantly
- 🛡️ **Maintain security** with built-in validation and sanitization

No more manually writing controllers, routes, or query builders. Focus on what data you want to expose, and let the plugin handle the rest.
## 📖 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start Guide](#-quick-start-guide)
- [Step-by-Step Tutorial](#-step-by-step-tutorial)
- [API Features](#-api-features)
- [Advanced Usage](#-advanced-usage)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Capabilities
- ✅ **Visual API Builder** - Point-and-click interface for creating custom endpoints
- ✅ **Smart Field Selection** - Choose exactly which fields to expose
- ✅ **Relationship Management** - Automatically handle complex data relationships
- ✅ **Advanced Filtering** - 16+ filter operators ($eq, $contains, $gte, etc.)
- ✅ **Multi-field Sorting** - Sort by multiple fields with various formats
- ✅ **Flexible Pagination** - Page-based and offset-based pagination support
- ✅ **Query Visualization** - See your API structure before deployment
- ✅ **Auto-generated Documentation** - Each API comes with filter documentation
- ✅ **Schema Validation** - Gracefully handles content type changes
- ✅ **Production Ready** - Optimized queries with proper sanitization

### What Makes It Special?
- 🎯 **No Code Required** - Build complex APIs without writing controllers
- 🔄 **Live Preview** - See example queries and responses in real-time
- 🛡️ **Security First** - Built-in validation and sanitization
- 📈 **Scalable** - Handles large datasets with intelligent pagination
- 🔧 **Maintainable** - Changes to content types are handled gracefully

## ⚙️ Versions

- **Strapi v5** - (current) - v2.x
- **Strapi v4** - (legacy) - v1.x


## 📦 Installation

### Prerequisites

- Strapi v5.0.0 or higher
- Node.js 18.x or 20.x
- npm or yarn package manager

### Step 1: Install Strapi (if you haven't already)

```bash
# Create a new Strapi project using npx (recommended)
npx create-strapi@latest my-project --quickstart --skip-cloud

# The command will prompt you - answer 'N' to skip anonymous telemetry
# Then it will install dependencies and set up your project

# Navigate to your project once installation is complete
cd my-project
```

**Note**: The `--quickstart` flag creates a project with SQLite database for quick setup. The `--skip-cloud` flag skips the Strapi Cloud setup prompts.

### Step 2: Install the Custom API Builder Plugin

```bash
# Using npm
npm install strapi-plugin-custom-api

# Or using yarn
yarn add strapi-plugin-custom-api
```

### Step 3: Install Required Dependencies

**IMPORTANT**: You must also install these UI dependencies for Strapi v5:

```bash
npm install @strapi/design-system @strapi/icons

# Or using yarn
yarn add @strapi/design-system @strapi/icons
```

### Step 4: Configure the Plugin

Create or update `config/plugins.js`:

```javascript
module.exports = {
  'custom-api': {
    enabled: true,
    config: {
      // Add any custom configuration here
    }
  }
};
```

### Step 5: Rebuild and Start Strapi

```bash
# Rebuild the admin panel
npm run build

# Start Strapi in development mode  
npm run develop

# Or with npx (if strapi command is not available)
npx strapi develop
```

The server will start and open your browser to `http://localhost:1337/admin` where you'll need to create your first admin user.

## 🚀 Quick Start Guide

### 1. Access the Plugin

After starting Strapi, navigate to your admin panel (typically `http://localhost:1337/admin`). You'll find **"Custom Api Builder"** in the left sidebar menu.

### 2. Create Your First Custom API

1. Click on **"Custom Api Builder"** in the sidebar
2. Click the **"Create new API"** button
3. Fill in the basic information:
   - **Name**: Give your API a descriptive name (e.g., "Product Catalog")
   - **Slug**: This will be auto-generated (e.g., "product-catalog")
   - **Content Type**: Select the content type to query

### 3. Select Fields

Choose which fields to include in your API response:
- ✅ Check the fields you want to expose
- 🔍 Use the search bar to find specific fields quickly
- 🏷️ Filter by field type using the type badges

### 4. Configure Features

Enable the features you need:
- **Filtering**: Allow clients to filter results
- **Sorting**: Enable result ordering
- **Pagination**: Add pagination support

### 5. Save and Test

1. Click **"Save"** to create your API
2. Your endpoint is immediately available at:
   ```
   GET /api/custom-api/your-slug
   ```

## 📚 Step-by-Step Tutorial

### Creating a Product Catalog API

Let's build a real-world example: a product catalog API with filtering, sorting, and pagination.

#### Step 1: Set Up Your Content Type

First, ensure you have a Product content type with these fields:
- name (Text)
- description (Rich Text)
- price (Number)
- category (Relation to Category)
- inStock (Boolean)
- featured (Boolean)

#### Step 2: Create the Custom API

1. Navigate to **Custom Api Builder**
2. Click **"Create new API"**
3. Enter:
   - **Name**: "Product Catalog API"
   - **Slug**: Will auto-generate as "product-catalog-api"
   - **Content Type**: Select "Product"

#### Step 3: Select Fields

Check the following fields:
- ✅ name
- ✅ description
- ✅ price
- ✅ category
- ✅ inStock
- ✅ featured

#### Step 4: Configure Relationships

For the category relationship:
- Select which category fields to include (e.g., name, slug)
- The plugin automatically handles the join queries

#### Step 5: Enable Features

- ✅ Enable Filtering
- ✅ Enable Sorting
- ✅ Enable Pagination

#### Step 6: Save and Use Your API

Your API is now available! Here are example queries:

```bash
# Get all products
GET /api/custom-api/product-catalog-api

# Filter by price range
GET /api/custom-api/product-catalog-api?price[$gte]=10&price[$lte]=100

# Filter by category and stock
GET /api/custom-api/product-catalog-api?category.name=Electronics&inStock=true

# Sort by price (ascending) and name (descending)
GET /api/custom-api/product-catalog-api?sort=price,-name

# Paginate results
GET /api/custom-api/product-catalog-api?page=2&pageSize=20

# Combine everything
GET /api/custom-api/product-catalog-api?featured=true&price[$lte]=50&sort=-createdAt&page=1&pageSize=10
```

## 🔧 API Features

### Filtering

The plugin supports 16 filter operators:

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equals | `?name[$eq]=iPhone` |
| `$ne` | Not equals | `?status[$ne]=draft` |
| `$contains` | Contains substring | `?title[$contains]=guide` |
| `$notContains` | Doesn't contain | `?title[$notContains]=draft` |
| `$in` | In array | `?category[$in]=tech,mobile` |
| `$notIn` | Not in array | `?status[$notIn]=draft,archived` |
| `$lt` | Less than | `?price[$lt]=100` |
| `$lte` | Less than or equal | `?price[$lte]=100` |
| `$gt` | Greater than | `?views[$gt]=1000` |
| `$gte` | Greater than or equal | `?rating[$gte]=4` |
| `$between` | Between two values | `?price[$between]=10,100` |
| `$startsWith` | Starts with | `?title[$startsWith]=How` |
| `$endsWith` | Ends with | `?email[$endsWith]=@gmail.com` |
| `$null` | Is null | `?deletedAt[$null]=true` |
| `$notNull` | Is not null | `?publishedAt[$notNull]=true` |
| `$or` | OR condition | `?$or[0][name]=iPhone&$or[1][name]=Samsung` |

### Sorting

Multiple sorting formats are supported:

```bash
# Comma-separated
?sort=price,-createdAt

# Array format
?sort[]=price&sort[]=-createdAt

# Object format
?sort[price]=asc&sort[createdAt]=desc

# With symbols
?sort=+price,-createdAt
```

### Pagination

Two pagination styles:

```bash
# Page-based (recommended)
?page=2&pageSize=20

# Offset-based
?offset=20&limit=20
```

Response includes metadata:
```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "pageSize": 20,
      "total": 150,
      "pageCount": 8
    }
  }
}
```

### Filter Documentation Endpoint

Each API automatically gets a documentation endpoint:

```bash
GET /api/custom-api/your-slug/filters
```

Returns available filters, operators, and examples specific to your API.

## 🎯 Advanced Usage

### Working with Relationships

The plugin intelligently handles relationships:

```javascript
// One-to-Many: Returns array
{
  "product": {
    "name": "iPhone",
    "categories": [
      { "id": 1, "name": "Electronics" },
      { "id": 2, "name": "Mobile" }
    ]
  }
}

// Many-to-One: Returns single object
{
  "product": {
    "name": "iPhone",
    "manufacturer": { "id": 1, "name": "Apple" }
  }
}
```

### Complex Filtering Examples

```bash
# Products in multiple categories with price range
?category.slug[$in]=electronics,computers&price[$between]=100,500

# Featured products or products with high ratings
?$or[0][featured]=true&$or[1][rating][$gte]=4.5

# Products without images
?images[$null]=true

# Recent products in stock
?inStock=true&createdAt[$gte]=2024-01-01
```

### JavaScript/TypeScript Integration

```javascript
// Using fetch
const response = await fetch('/api/custom-api/product-catalog-api?' + new URLSearchParams({
  'category.slug': 'electronics',
  'price[$lte]': '500',
  'sort': '-rating',
  'page': '1',
  'pageSize': '20'
}));

const { data, meta } = await response.json();

// Using axios
const { data } = await axios.get('/api/custom-api/product-catalog-api', {
  params: {
    'featured': true,
    'price[$between]': '10,100',
    'sort': ['price', '-createdAt'],
    'page': 1,
    'pageSize': 20
  }
});
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Plugin Not Appearing in Admin Panel

**Solution**: Rebuild the admin panel
```bash
npm run build
npm run develop

# Or if the strapi command is not found:
npx strapi build
npx strapi develop
```

#### 2. "No content types available" Message

**Solution**: Create at least one content type in your Strapi project first.

#### 3. API Returns 404

**Possible causes**:
- The slug might be incorrect
- The API might not be published
- Check the exact endpoint: `/api/custom-api/your-slug`

#### 4. Filters Not Working

**Check**:
- Field names are correct (case-sensitive)
- Operators are properly formatted (e.g., `[$contains]`)
- Fields are included in the API configuration

#### 5. Performance Issues with Large Datasets

**Optimize by**:
- Using pagination (`pageSize` parameter)
- Adding database indexes on filtered fields
- Limiting the number of fields returned
- Using specific filters to reduce dataset size

### Debug Mode

Enable debug logging in your Strapi configuration:

```javascript
// config/server.js
module.exports = {
  // ... other config
  logger: {
    level: 'debug',
  }
};
```

### Common Strapi v5 Installation Issues

#### "strapi: command not found"

**Solution**: Use npx to run Strapi commands
```bash
# Instead of: strapi develop
npx strapi develop

# Instead of: strapi build  
npx strapi build
```

#### Missing Dependencies Error

**Solution**: Ensure all required dependencies are installed
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Install missing UI dependencies
npm install @strapi/design-system @strapi/icons
```

#### Port Already in Use

**Solution**: Strapi runs on port 1337 by default
```bash
# Kill process on port 1337
lsof -ti:1337 | xargs kill -9

# Or run on different port
PORT=8080 npm run develop
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Setup

```bash
# Clone the repository
git clone https://github.com/vivmagarwal/strapi-plugin-custom-api-builder.git

# Install dependencies
npm install

# Run tests
npm test

# Link for local development
npm link

# In your Strapi project
npm link strapi-plugin-custom-api
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the legendary Drupal Views module
- Built for the amazing Strapi community
- Special thanks to all contributors
- [@vivmagarwal](https://github.com/vivmagarwal) - Original author
- [@cjboco](https://github.com/cjboco) - Contributor

## 📮 Support

- 📧 Email: vivmagarwal@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/vivmagarwal/strapi-plugin-custom-api-builder/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/vivmagarwal/strapi-plugin-custom-api-builder/discussions)

---

**Made with ❤️ by [Vivek M. Agarwal](https://github.com/vivmagarwal)**

*Bringing the power of visual API building to Strapi, one endpoint at a time.*
