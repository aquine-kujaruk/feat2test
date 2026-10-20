# [3.0.0](https://github.com/aquine-kujaruk/feat2test/compare/v2.2.0...v3.0.0) (2026-10-20)


* feat!: reduce Gherkin Craft to the generator's deterministic contract ([3ab6655](https://github.com/aquine-kujaruk/feat2test/commit/3ab6655fbadd034a9e545b13f4888add5fc237ba))


### Features

* support workflow integration ([adbb15b](https://github.com/aquine-kujaruk/feat2test/commit/adbb15becb0fdda8d81a882ea427aba75a7d26d5))


### BREAKING CHANGES

* the published skill bundle drops these resources:
skills/gherkin-craft/references/domain-discovery.md,
skills/gherkin-craft/references/verification-modalities.md,
skills/gherkin-craft/references/evaluation.md,
skills/gherkin-craft/references/creator.md,
skills/gherkin-craft/references/editor.md and the whole skills/gherkin-craft/evals/ corpus.
The skill no longer requires or explains @code and @ai tags. The bundle is now SKILL.md,
references/generator-contract.md, references/gherkin-format.md, references/authoring-guide.md and
agents/openai.yaml. CLI behavior is unchanged.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

# [2.2.0](https://github.com/aquine-kujaruk/feat2test/compare/v2.1.1...v2.2.0) (2026-09-08)


### Features

* **skill:** classify verification modalities ([d5a9e5a](https://github.com/aquine-kujaruk/feat2test/commit/d5a9e5ad5215b894746f52dbd69db7015a8da2b4))

## [2.1.1](https://github.com/aquine-kujaruk/feat2test/compare/v2.1.0...v2.1.1) (2026-09-08)


### Bug Fixes

* handle Gherkin table separators by format ([6b8ebe6](https://github.com/aquine-kujaruk/feat2test/commit/6b8ebe6c70cfc95bb1d089c59f4c92eb04ee6802))

# [2.1.0](https://github.com/aquine-kujaruk/feat2test/compare/v2.0.0...v2.1.0) (2026-09-07)


### Features

* **skill:** model observable system use cases ([b7f9ae4](https://github.com/aquine-kujaruk/feat2test/commit/b7f9ae4e727b37fd937a0634769f674e040a9c4b))

# [2.0.0](https://github.com/aquine-kujaruk/feat2test/compare/v1.2.0...v2.0.0) (2026-09-06)


* feat!: synchronize step adapters with feature signatures ([5df70bb](https://github.com/aquine-kujaruk/feat2test/commit/5df70bb383a7d5a0b6b25c542db6c0c7d2f651f0))


### BREAKING CHANGES

* Generation now removes obsolete step methods and rejects adapters
that cannot be synchronized statically.

# [1.2.0](https://github.com/aquine-kujaruk/feat2test/compare/v1.1.4...v1.2.0) (2026-09-06)


### Features

* **skill:** strengthen business Gherkin authoring ([26a9e69](https://github.com/aquine-kujaruk/feat2test/commit/26a9e698b786f6fcf526403019e23eccfe84d66f))

## [1.1.4](https://github.com/aquine-kujaruk/feat2test/compare/v1.1.3...v1.1.4) (2026-09-06)


### Bug Fixes

* update npm README usage ([f0cd01d](https://github.com/aquine-kujaruk/feat2test/commit/f0cd01d73221f90fdd9a648d2edc308aae86384d))

## [1.1.3](https://github.com/aquine-kujaruk/feat2test/compare/v1.1.2...v1.1.3) (2026-09-06)


### Bug Fixes

* publish English README ([acadd99](https://github.com/aquine-kujaruk/feat2test/commit/acadd9963cfa4ce8f75d77ab22961935a586f52c))

## [1.1.2](https://github.com/aquine-kujaruk/feat2test/compare/v1.1.1...v1.1.2) (2026-09-06)


### Bug Fixes

* expose trusted publishing npm on PATH ([15fa50e](https://github.com/aquine-kujaruk/feat2test/commit/15fa50ed15179366bb57c3db816485f524d4cf9b))

## [1.1.1](https://github.com/aquine-kujaruk/feat2test/compare/v1.1.0...v1.1.1) (2026-09-06)


### Bug Fixes

* use OIDC-compatible npm for releases ([274527a](https://github.com/aquine-kujaruk/feat2test/commit/274527a5c36eeeeb0e72833a1b5096e7fd3224b1))

# [1.1.0](https://github.com/aquine-kujaruk/feat2test/compare/v1.0.0...v1.1.0) (2026-09-06)


### Features

* simplify CLI around explicit runners ([2cec5ca](https://github.com/aquine-kujaruk/feat2test/commit/2cec5ca66f5c6b50711683d43460c8f96313081d))

# 1.0.0 (2026-09-05)


### Features

* add tests for input collection and update vitest configuration ([c16b88d](https://github.com/aquine-kujaruk/feat2test/commit/c16b88d3323fc167938e5ccc23f160b45daf2a39))
* refactor calculator example to remove world fixture and streamline test setup ([224f878](https://github.com/aquine-kujaruk/feat2test/commit/224f878a2183f199d57169eaf9786e0e04fd3333))

# Changelog

All notable changes are generated automatically from Conventional Commits.

See [Conventional Commits](https://www.conventionalcommits.org/) and
[Semantic Versioning](https://semver.org/).
