# BlackTent

## v1 definition

BlackTent is a local-first safety environment for diagnosing development problems without exposing secrets or destabilizing working systems. It helps developers understand what is actually running, what is misconfigured, and where assumptions no longer match reality. BlackTent focuses on structure, state, and coherence rather than code rewriting or automated fixes. It does not scan entire repositories, read secret values, or push changes. Its job is to reduce panic, prevent damage, and restore clarity so developers can make informed, confident decisions.

## When NOT to Use BlackTent

BlackTent is not the right tool when you are looking for automatic fixes, refactors, or code generation. It will not repair broken logic, optimize performance, rewrite configuration files, install dependencies, or replace debugging skill. BlackTent is also not designed for production monitoring, cloud security scanning, or continuous background analysis. If your goal is speed through automation rather than safety through understanding, BlackTent will feel intentionally restrained. Its value is in preventing irreversible mistakes, not in acting on your behalf.

## BlackTent Guarantees

BlackTent operates under strict, explicit guarantees designed to protect developers and their systems.

### No secret exposure

BlackTent never reads, logs, or transmits secret values. Environment variables are treated as opaque: only presence, naming, and structure are evaluated.

### No repository scanning

BlackTent does not crawl, index, or analyze entire codebases. It works only with explicitly provided context and runtime signals.

### No automatic changes

BlackTent will not modify files, rewrite configuration, install dependencies, or apply fixes. All decisions remain human-controlled.

### No background behavior

BlackTent runs only when invoked. It performs no continuous monitoring, telemetry, or hidden analysis.

### Local-first by design

All diagnostics occur locally unless the developer explicitly chooses otherwise.

These guarantees are not optional features. They are architectural constraints.

