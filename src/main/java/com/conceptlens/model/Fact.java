package com.conceptlens.model;

/**
 * One statement that forms part of a concept's meaning, in its source system's words.
 *
 * <p>Facts are the level at which Concept Lens relates systems: mappings join facts, never whole
 * concepts, so two concepts can share some meaning without being declared equivalent.
 *
 * @param id fully qualified, globally unique and stable identifier, conventionally
 *     {@code <sourceSystem>.<concept>.<fact>} — for example
 *     {@code returns.returnable.valid_return_path}. Because it is globally unique, a mapping can
 *     name a fact by id alone, and because it is stable, mappings survive republication of the
 *     concept that owns it.
 * @param label short name for the fact in its source system's vocabulary
 * @param description prose explanation of what the fact asserts
 */
public record Fact(String id, String label, String description) {}
