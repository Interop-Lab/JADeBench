# Third-party notices

The root MIT license applies only to material authored for AgentDeobfBench. It
does not relicense benchmark subjects, transformed programs, package
dependencies, external tools, model services, or generated model output.

No external research implementation is vendored in this source release:

- JsDeObsBench implementation code is not redistributed because its reviewed
  snapshot did not contain a root license. The separately licensed Project
  CodeNet program text and tests used by that comparison are released under
  `benchmark/codenet100`, together with our generated protected inputs, outputs,
  selection record, and attribution notice.
- JSIMPLIFIER is not redistributed because the reviewed snapshot contained
  conflicting GPL-3.0 and MIT metadata. Users must obtain and review it
  separately, then set `ADB_JSIMPLIFIER`.

The `benchmark/realworld104` programs are derived from 34 permissively licensed
upstream projects (MIT, ISC, Apache-2.0, or BSD-3-Clause). Subject-level pinned
revisions and copied license texts are recorded in
`benchmark/realworld104/THIRD_PARTY_NOTICES.md`. The JS-OB programs, VM programs,
and released deobfuscation outputs remain derivatives of those subjects.

The `benchmark/codenet100` program text and test cases originate from IBM
Project CodeNet under CDLA-Permissive-2.0. Attribution and source links are in
`benchmark/codenet100/NOTICE`. Generated protected programs and deobfuscation
outputs retain the applicable data terms.

The `samples/diverse6` programs are derived from six MIT-licensed upstream
projects. Their pinned revisions and copied license texts are recorded in the
sample-specific notices. The root MIT license does not replace those notices.

Node and Python dependencies are installed from package manifests and retain
their own licenses. Commercial integrations are scaffolding only; this
repository distributes no commercial binary, license key, entitlement, or
vendor output.
