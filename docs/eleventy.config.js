import path from "node:path";
import * as sass from "sass";
import metagen from "eleventy-plugin-metagen";
import hamlPlugin from "@11ty/eleventy-plugin-haml";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("images");

  eleventyConfig.addPlugin(metagen);
  eleventyConfig.addPlugin(hamlPlugin);

  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",

    useLayouts: true,

    compile: async function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      // Don’t compile file names that start with an underscore
      if (parsed.name.startsWith("_")) {
        return;
      }

      let result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || ".", this.config.dir.includes],
      });

      // Map dependencies for incremental builds
      this.addDependencies(inputPath, result.loadedUrls);

      return async (data) => {
        return result.css;
      };
    },
  });
  eleventyConfig.addTemplateFormats("scss");
}
