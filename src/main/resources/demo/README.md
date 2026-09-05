# Demo seed data

The two JSON files in this folder are the data Concept Lens starts with. They are read once at
startup into in-memory repositories, and they exist so the application has something real to show
before any source system is actually integrated.

## `concepts.json`

Simulates concept definitions **published by independently owned source systems**. Each entry
stands in for something a different team owns: Returns publishes `Returnable`, Payments publishes
`Refundable` and `BillingCountry`, and so on. The systems share no vocabulary and are unaware of
each other, which is the point — Returns and Payments both describe reversing a purchase, and
Orders and Payments both describe a country, but each does so in its own words.

Concept Lens stores concepts exactly as published and never rewrites them into a canonical form.
A concept carries its `sourceSystem`, a `version`, the `publishedAt` instant of that version, and
the `facts` it is composed of. Fact ids are fully qualified as
`<sourceSystem>.<concept>.<fact>` — for example `returns.returnable.valid_return_path` — so that
a mapping can name a fact by id alone.

## `mappings.json`

**Concept Lens-owned semantic knowledge.** Unlike concepts, nobody publishes these: they are
Concept Lens' own record of where two independently owned facts state the same thing, each
carrying a `rationale` and a `reviewedBy` so a reader can see why the claim is believed.

Mappings reference facts by id and never embed a source concept, so source systems remain the
sole owners of their definitions. Every mapping is fact-level and of type `SAME_MEANING`. How two
whole *concepts* relate is derived from these mappings and is never authored here.

## Lifecycle

Both files are **startup seed data only**.

- **Concepts are read-only in this prototype.** They are owned and published by their source
  systems, so the application offers no way to create or modify one.
- **Mappings are mutable in memory at runtime**, with add and remove operations. Concept Lens
  owns mappings, so this is the one thing it can change.
- **Runtime mapping changes are not written back to JSON.** Adding or removing a mapping modifies
  the in-memory repository alone; these files are never rewritten.
- **Restarting the application resets mappings to the seed state.** That is the accepted
  behaviour until real persistence is added, not a bug.

## The three bundled scenarios

The seed data is chosen so that each scenario intentionally exercises a different derived
concept-level outcome.

| Scenario | Shape | Fact mappings | Derived result |
| --- | --- | --- | --- |
| `Returnable` ↔ `Refundable` | partial overlap — 3 facts each, 1 matched | `rel_018` | `NOT_ESTABLISHED` |
| `Shipped` → `Delivered` | containment — all of Shipped's 1 fact matched, Delivered has 1 more | `rel_024` | `RIGHT_INCLUDES_LEFT` |
| `BuyerCountry` ↔ `BillingCountry` | complete equivalence — 3 facts each, all matched | `rel_031`, `rel_032`, `rel_033` | `SAME_MEANING` |

`NOT_ESTABLISHED` is deliberate rather than a weaker label such as "partial overlap". Where facts
are left unmatched, Concept Lens declines to characterise the relationship at all: unmatched facts
are an absence of evidence, never evidence that the concepts differ.

`DemoSeedDataTest` guards these files, checking that both deserialize into the Java model, that
fact ids are unique and qualified by their concept, and that every mapping resolves to known facts
in two different concepts.
