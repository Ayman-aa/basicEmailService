const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

module.exports = {
  renderTemplate: async (templateName, context) => {
    const templatePath = path.join(__dirname, '../views/email-templates', `${templateName}.ejs`);
    
    return new Promise((resolve, reject) => {
      ejs.renderFile(templatePath, context, (err, html) => {
        if (err) {
          return reject(err);
        }
        resolve(html);
      });
    });
  }
};