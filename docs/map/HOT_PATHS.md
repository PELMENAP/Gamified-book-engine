# Hot paths

Code listed here runs per frame. The rules of `docs/OPTIMIZATION.md` section 2 are mandatory for it:
no allocation in our code, no closures, no array or object creation, no `map`, `filter`, `slice` or spread, no layout reads.

A function not listed here and not called from one listed here is not hot. Click handlers, `IntersectionObserver`
callbacks and the 1 Hz telemetry tick are warm: closures and small objects are allowed there.
When a change adds a function to a per-frame path, add it here in the same commit.

| Area | File | Hot functions |
|---|---|---|
| Probe scroll | `apps/probe/src/probes/scroll.ts` | `onFrame` |

