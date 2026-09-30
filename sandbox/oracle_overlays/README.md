# Oracle overlays

Files here are copied into a sandbox's `oracle/` after the project test
closure is installed. Use them only when the project's tests assume a
module boundary that corpus bundling has already collapsed.

Layout: `oracle_overlays/<sandbox-dirname>/<oracle-relative-path>`

Current overlays:

- `seppevs__migrate-mongo_lib_env_config.js` — `read()` tests spied on
  `lib/utils/module-loader.js`. That helper is inlined into the subject
  bundle, so the spy never fires. The overlay drives `read()` through
  real config files instead.
