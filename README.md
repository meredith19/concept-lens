# Concept Lens

**Understand how concepts across independently owned systems relate.**

Concept Lens lets teams keep their own domain models and vocabulary
while making relationships between their concepts explicit and
inspectable.

> **Live demo:** <https://concept-lens-production.up.railway.app>

## The problem

Large systems rarely have one shared vocabulary.

A Returns system might define an order as **Returnable**, while Payments
defines a payment as **Refundable**. Orders may have a **Buyer
Country**, while Payments has a **Billing Country**.

Each concept makes sense within the system that owns it. The difficulty
appears when someone needs to reason **across** those systems:

> Is this the same concept under a different name?\
> Does one concept include the meaning of another?\
> Do they share only part of their meaning?\
> Or do we simply not know?

Names alone cannot answer those questions reliably, and forcing every
system into a canonical vocabulary sacrifices independent domain
ownership.

Concept Lens takes a different approach: **keep the concepts
independently owned, and model the relationships between their meanings
separately.**

## How Concept Lens models meaning

A **Concept** belongs to a source system and is described by a set of
**Facts**.

For example:

``` text
Returns.Returnable

  valid_return_path
  within_return_window
  not_final_sale
  item_delivered
```

and:

``` text
Payments.Refundable

  refund_path_available
  return_approved
  payment_captured
```

Concept Lens can then record a reviewed semantic mapping:

``` text
Returns.valid_return_path
        SAME_MEANING
Payments.refund_path_available
```

The source systems do not need to rename anything or depend on Concept
Lens. Mappings are independent assertions about how their facts relate.

### Authored facts, derived relationships

Humans establish only simple, fact-level `SAME_MEANING` mappings.

Concept Lens derives relationships between whole concepts from those
mappings.

For example:

``` text
Shipped
└── left_fulfillment_center

Delivered
├── left_fulfillment_center
└── reached_destination
```

If the two `left_fulfillment_center` facts are confirmed to mean the
same thing, every fact in `Shipped` is represented in `Delivered`, while
`Delivered` contains additional meaning.

Concept Lens therefore derives:

``` text
Delivered includes Shipped
```

Nobody authored that relationship directly.

This distinction is central to the model:

| | Authored | Derived |
| --- | --- | --- |
| Level | Fact | Concept |
| Relationship | `SAME_MEANING` | Equivalence, containment, or not established |
| Stored | Yes | No |
| Changes when evidence changes | — | Immediately |

Most importantly:

> **Unmapped means unknown, not different.**

The absence of a semantic mapping is not evidence that two facts have
different meanings.

## Try the demo

The demo contains six concepts across five independently modeled
systems.

Three comparisons illustrate the main relationship states:

| Comparison | What it demonstrates |
| --- | --- |
| **Returnable ↔ Refundable** | Some meaning is confirmed as shared, but there is not enough evidence to establish a relationship between the complete concepts. |
| **Shipped ↔ Delivered** | Every modeled meaning of Shipped is represented in Delivered, so Concept Lens derives that Delivered includes Shipped. |
| **BuyerCountry ↔ BillingCountry** | Different vocabulary, but all modeled facts correspond, so Concept Lens derives the same meaning. |

The comparison view shows both the derived relationship and the evidence
behind it.

Mappings are mutable in the demo. Removing a mapping immediately changes
the corresponding concept relationship; **Reset demo data** restores the
seeded graph.

**Related concepts** uses the same semantic graph to surface other
comparisons connected by confirmed mappings.

## Architecture

Concept Lens is a Spring Boot application with a React/TypeScript
frontend.

``` text
┌──────────────────────────┐
│      React frontend      │
│ Compare · Mappings · UI  │
└────────────┬─────────────┘
             │ /api/*
             ▼
┌──────────────────────────┐
│      REST controllers    │
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│         Services         │
│ Concept · Mapping        │
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│       Repositories       │
│ Concepts    Mappings     │
│ read-only   mutable      │
└──────────────────────────┘
```

Semantic derivation is a separate path:

``` text
Concepts + Facts ──────┐
                       │
                       ▼
                 SemanticGraph
                       │
SemanticMappings ──────┘
                       │
                       ▼
                ComparisonEngine
                       │
                       ▼
                ComparisonResult
                 ├─ relationship
                 ├─ matched facts
                 └─ unmatched facts
```

The frontend and backend ship as a single Spring Boot JAR; the compiled
React application is served by Spring Boot alongside the API.

## Backend model

### `Concept`

A domain concept owned by a source system.

It contains its identity, source system, definition, version and the
facts that describe its meaning.

Concepts are read-only in this prototype because Concept Lens does not
own the underlying domain models.

### `Fact`

One proposition contributing to the meaning of a concept.

A fact has a globally unique ID plus a human-readable label and
description. Semantic mappings reference these IDs rather than copying
source concepts into Concept Lens.

### `SemanticMapping`

An explicit, reviewed relationship between two facts.

A mapping records:

-   the two fact IDs
-   `MappingType`
-   `MappingStatus`
-   rationale
-   reviewer

The prototype intentionally supports only confirmed `SAME_MEANING`
mappings.

Before a mapping is accepted, Concept Lens checks that both fact IDs
resolve to published facts, that those facts belong to two *different*
concepts, and that no equivalent mapping already exists in either
direction; the mapping ID is then assigned by the server rather than
supplied by the caller.

Concept Lens does not store concept-level `IMPLIES` or containment
relationships.

### `SemanticGraph`

Provides the semantic connectivity used during comparison.

For the prototype it considers **direct, confirmed `SAME_MEANING`
mappings only**. Same-meaning edges are symmetric.

There is deliberately no transitive inference: if `A ≡ B` and `B ≡ C`,
Concept Lens does not automatically assert `A ≡ C`.

### `ComparisonEngine`

Derives the relationship between two concepts from the graph.

For every fact on each side, it determines whether a confirmed matching
fact exists on the other side.

The result contains:

-   the derived `ConceptRelationship`
-   confirmed `FactMatch` evidence
-   unmatched facts from each concept

### `ConceptRelationship`

A concept comparison has one of four derived results:

``` text
SAME_MEANING
LEFT_INCLUDES_RIGHT
RIGHT_INCLUDES_LEFT
NOT_ESTABLISHED
```

These values are computed for each comparison rather than persisted.

## Derivation

The relationship algorithm is intentionally small and deterministic:

``` java
if (allLeftMatched && allRightMatched)
    return SAME_MEANING;

if (allLeftMatched)
    return RIGHT_INCLUDES_LEFT;

if (allRightMatched)
    return LEFT_INCLUDES_RIGHT;

return NOT_ESTABLISHED;
```

This produces three important behaviors.

**Equivalence**

``` text
A: ● ● ●
B: ● ● ●

Every fact is accounted for in both directions
→ SAME_MEANING
```

**Containment**

``` text
A: ● ●
B: ● ● ●

Everything in A is represented in B
→ B INCLUDES A
```

**Partial evidence**

``` text
A: ● ● ●
B: ● ● ●
   ↕
one confirmed match

Both sides still contain unmatched facts
→ NOT_ESTABLISHED
```

The last case is important. Concept Lens knows that some meaning is
shared, but it does not know what relationship exists between the
remaining facts.

It therefore distinguishes **confirmed partial evidence** from a
**derived whole-concept relationship**.

The algorithm never examines concept names, fact labels or descriptions
when deriving a result.

## Why keep mappings separate?

Semantic relationships do not belong exclusively to either source
system.

If Returns had to encode its relationship to Payments inside the Returns
model, independently owned systems would gradually accumulate knowledge
about one another and become coupled.

Instead:

``` text
Returns model ─────┐
                   │
                   ▼
             Concept Lens
             semantic graph
                   ▲
                   │
Payments model ────┘
```

Each system remains authoritative for its own concepts.

Concept Lens owns the cross-system knowledge.

This also keeps the human decision small: reviewers answer whether **two
specific facts mean the same thing**. Broader relationships such as
containment are consequences of those decisions rather than additional
assertions that must be maintained.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/concepts` | List concepts and their facts |
| `GET` | `/api/concepts/{id}` | Get a concept |
| `GET` | `/api/mappings` | List semantic mappings |
| `GET` | `/api/mappings/{id}` | Get a mapping |
| `POST` | `/api/mappings` | Create a confirmed mapping |
| `DELETE` | `/api/mappings/{id}` | Remove a mapping |
| `GET` | `/api/compare?left={id}&right={id}` | Derive a comparison |
| `POST` | `/api/demo/reset` | Restore seeded mappings |

API errors use a consistent `{code, message}` response.

## Demo data

Concepts are loaded from bundled seed data at startup.

Concepts remain read-only, while mappings can be added and removed at
runtime. Resetting the demo restores the original mapping set without
modifying the source JSON.

This keeps the hosted demo safe to explore while preserving a
predictable starting state.

## Running locally

Requires JDK 21.

``` bash
./mvnw clean package
java -jar target/concept-lens-0.0.1-SNAPSHOT.jar
```

Then open `http://localhost:8080`.

For frontend development:

``` bash
./mvnw spring-boot:run
```

and:

``` bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` to the Spring Boot application.

## Tests

The build runs both backend JUnit tests and frontend Vitest tests:

``` bash
./mvnw clean package
```

The backend tests cover the four derivation states, non-transitive
behavior, mapping validation, seed integrity, API behavior and demo
reset.

Frontend tests cover the comparison experience, mapping inspection and
mutation, related concepts, reset behavior and supporting UI states.

## Current limitations

The prototype is deliberately small, and these are the boundaries of
what it does today:

-   **In-memory mappings.** Mappings added or removed at runtime live
    only for the life of the process, and a restart returns to the
    seeded set.
-   **Single-user prototype.** Mapping writes are serialized in-process,
    but that path is not concurrency-tested. The demo is meant for one
    person exploring at a time.
-   **Direct mappings only.** There is no transitive inference: if
    `A ≡ B` and `B ≡ C`, Concept Lens does not conclude `A ≡ C`.
-   **No authentication or governance.** Anyone can author or remove a
    mapping, and `reviewedBy` defaults to `Domain reviewer` rather than
    a verified identity. There is no approval workflow or audit history.
-   **Mapping staleness as concepts evolve.** Mappings reference facts
    by stable ID, so renames are survivable, but nothing yet checks that
    a republished concept still contains the facts its mappings point
    at.

## Future directions

-   **Persistence** — replace the in-memory mapping repository with
    durable storage.
-   **Concept discovery and search** — find concepts across a much
    larger catalog.
-   **Same name, different meaning** — surface cases where vocabulary
    appears identical but semantics differ.
-   **Graph exploration** — navigate beyond immediate related
    concepts.
-   **Impact analysis** — identify relationships that may be affected
    when a source concept changes.
-   **Mapping health** — detect mappings that need review as concepts
    and facts evolve.
-   **AI-assisted mapping** — suggest potential semantic relationships
    while keeping human-reviewed mappings as the source of truth.
-   **Governance** — authenticated reviewer identity, RBAC, approval
    workflows and audit history.
-   **Production operations** — persistent storage, observability and
    usage analytics.

The graph can also provide useful signals about where semantic knowledge
is missing: frequently compared concepts that repeatedly return
`NOT_ESTABLISHED` are candidates for further domain review.
