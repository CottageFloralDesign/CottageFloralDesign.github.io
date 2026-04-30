module.exports = {
  eleventyComputed: {
    seo: (data) => ({
      title: (data.seo && data.seo.title) || `${data.title} Wedding | ${data.site.business_name}`,
      description: (data.seo && data.seo.description) || "",
      og_image: (data.seo && data.seo.og_image) || data.hero_image
    })
  }
};
