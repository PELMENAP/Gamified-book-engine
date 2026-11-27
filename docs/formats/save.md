# Save file

Constants and types: `packages/format/src/save.ts`. JSON, exported by the reader as a file.

- `schemaVersion` = `SAVE_SCHEMA_VERSION`. A loader migrates older versions step by step and rejects newer ones.
- Log arrays are stored per chapter as base64 of the typed array bytes, with the block id list of that content version,
  so a text update can remap blocks by id and drop tombstoned ones.
- `position` is a block id plus offset; a missing block falls back to the nearest following visible block.
- `locks` hold lock CEKs wrapped under the edition key, never answers.
- No field holds book text.
