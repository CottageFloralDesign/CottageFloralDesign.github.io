const yaml = require("js-yaml");

module.exports = function(eleventyConfig) {
  // Support YAML data files (_data/*.yml)
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));

  // Bake current year into templates at build time
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  // Pass-through static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
