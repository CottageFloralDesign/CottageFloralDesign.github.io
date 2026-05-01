const yaml = require("js-yaml");

module.exports = function(eleventyConfig) {
  // Support YAML data files (_data/*.yml)
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));

  // Bake current year into templates at build time
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  // Convert a date to ISO 8601 string for schema.org
  eleventyConfig.addFilter("toISOString", (date) => {
    if (!date) return "";
    return new Date(date).toISOString();
  });

  // Exclude docs and other non-site directories
  eleventyConfig.ignores.add("docs/**");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("HANDOFF.md");
  eleventyConfig.ignores.add("DEPLOYMENT.md");
  eleventyConfig.ignores.add("portfolio/*.html");
  // mothers-day.html and dance-flowers.html use templateEngineOverride: ""
  // in their frontmatter (Task 9) — they pass through Eleventy verbatim.

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
