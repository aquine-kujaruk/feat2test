# Validate Gherkin by content

Input filenames and extensions do not select or restrict the accepted Gherkin presentation. The generator internally tries the supported Cucumber parsing forms and proceeds whenever the content yields a valid Feature, scenarios, and Pickles; otherwise it reports one domain-level `INVALID_GHERKIN` diagnostic without exposing parser-selection mechanics. English is the default dialect, every other dialect requires the standard `# language:` header, and tags are preserved as generated metadata without receiving Vitest behavior.
