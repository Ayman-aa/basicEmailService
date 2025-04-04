const fs = require('fs').promises;
const path = require('path');
const ejs = require('ejs');

/**
 * Get template content by ID
 * @param {String} templateId - The template identifier
 * @returns {Promise<String>} - A promise that resolves with the template content
 */
async function getTemplate(templateId) {
  try {
    const templatePath = path.join(__dirname, '../views/email-templates', `${templateId}.ejs`);
    return await fs.readFile(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error loading template '${templateId}':`, error);
    throw new Error(`Template '${templateId}' not found`);
  }
}

/**
 * Render a template with data
 * @param {String} templateId - The template identifier
 * @param {Object} data - Data to be used in the template
 * @returns {Promise<String>} - A promise that resolves with the rendered HTML
 */
async function renderTemplate(templateId, data = {}) {
  try {
    console.log(`Attempting to render template '${templateId}'`);
    const template = await getTemplate(templateId);
    console.log(`Template '${templateId}' found, rendering with data:`, JSON.stringify(data));
    
    // Add default data to avoid undefined errors
    const combinedData = {
      name: 'User',
      docsUrl: '#',
      featuresUrl: '#',
      supportUrl: '#',
      dashboardUrl: '#',
      unsubscribeUrl: '#',
      preferencesUrl: '#',
      ...data
    };
    
    return ejs.render(template, combinedData);
  } catch (error) {
    console.error(`Error rendering template '${templateId}':`, error);
    throw error;
  }
}

/**
 * List all available templates
 * @returns {Promise<Array>} - A promise that resolves with an array of template IDs
 */
async function listTemplates() {
  try {
    const templatesDir = path.join(__dirname, '../views/email-templates');
    const files = await fs.readdir(templatesDir);
    return files
      .filter(file => file.endsWith('.ejs'))
      .map(file => file.replace('.ejs', ''));
  } catch (error) {
    console.error('Error listing templates:', error);
    throw error;
  }
}

module.exports = {
  getTemplate,
  renderTemplate,
  listTemplates
};