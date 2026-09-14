# Prior context

Earlier context: We are building an agent skill that advises a workshop on cord planning using this article. It must answer the described calculations and sufficiency questions. Evaluation will exercise an agent applying that skill; the skill does not yet exist.

# Request

Use gherkin-craft to express the explanatory text as Markdown Gherkin .feature.md specifications in output/. Keep the author’s assumptions visible. Cover the described calculations and decisions; when the text does not define an answer, identify the missing decision. These are specification documents only.

# Source material

Constructed article-style excerpt, not a published article: “A straight line of markers”.

The author considers ideal straight installations with equally spaced markers. A line with n markers has n−1 gaps, for integral n of at least two. Required connecting-cord length is gap length multiplied by the number of gaps. The author’s only worked example places two markers 3 metres apart, requiring 3 metres of cord. The relationship is offered for any integral marker count of at least two; other arrangements are outside the article.

The workshop can separately ask whether a proposed line fits its available cord: it fits when required cord length is less than or equal to available cord length. Asking that question does not consume or reserve cord. For any comparison, required and available lengths must use the same unit. The article does not define conversion between units.

The author also proposes estimating how many equal-length reels to acquire by dividing required length by length per reel. Nine metres required with three metres per reel gives three reels. The article does not say whether partial reels can be acquired, how to round a non-integral quotient, or whether joining lengths is permitted. It is therefore not an established purchasing rule for cases needing fractional reels.

These relationships describe the author’s ideal arrangement, not an empirically verified guarantee for curved installations or knots. The available cord, required cord, length per gap, and length per reel have distinct roles even if two numerical values happen to coincide.
