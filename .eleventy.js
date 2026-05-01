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
  eleventyConfig.ignores.add("portfolio/*.html");
  // TODO Task 9: remove the next two ignores; instead set
  // templateEngineOverride: "" in seasonal page frontmatter so Eleventy
  // copies them verbatim without Nunjucks processing.
  eleventyConfig.ignores.add("mothers-day.html");
  eleventyConfig.ignores.add("dance-flowers.html");

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
