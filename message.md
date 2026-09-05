I discovered OpenSpec recently, and one of my first thoughts was: why is it using an almost-Gherkin syntax when Cucumber already solved how to put actual Gherkin inside Markdown?

Then I found this thread, read the whole thing, and—unless I missed it—nobody mentioned [Markdown with Gherkin (MDG)](https://github.com/cucumber/gherkin/blob/main/MARKDOWN_WITH_GHERKIN.md).

MDG is ordinary, renderable Markdown. The parser only gives special meaning to `Feature`, `Background`, `Rule`, `Scenario`, `Scenario Outline`, and `Examples` headings; steps using `Given`, `When`, `Then`, `And`, or `But`; and tags written in backticks. Everything else remains Markdown.

An OpenSpec file could look like this:

```md
# Feature: Authentication

## ADDED Requirements

### Requirement: Dashboard access

Add any explanation, links, or diagrams here.

`@added` `@authentication`
#### Scenario: Unauthenticated user

* Given the user is not authenticated
* When they request the dashboard
* Then access is denied
```

That’s it. OpenSpec gets Markdown, while the existing Gherkin parser gets deterministic scenarios and tags. The [repository](https://github.com/cucumber/gherkin) already includes MDG matchers in JavaScript, Python, and Perl.

It even uses `.feature.md`, which feels almost suspiciously perfect here. `.feature` breaks OpenSpec, while maintaining a separate file creates the mapping and synchronization problems discussed in this thread. MDG keeps everything in one source file.

In other words, the objections raised here—verbosity, readability, parsing, mapping, synchronization—are basically the problems MDG already solves.

Maybe OpenSpec has some internal constraint I haven’t seen yet. If not, I’d really appreciate seeing it support MDG. It seems like a direct improvement without introducing another format to maintain.

Was MDG considered?