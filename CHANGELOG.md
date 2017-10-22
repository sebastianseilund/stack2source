# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added `opts.maxStackLength` (defaults to `10000`) to help guard against malicious input stacks.

### Changed

### Removed

- `sourcemap` property on `StackFrame` instances have been removed to save memory usage.

[Unreleased]: https://github.com/sebastianseilund/stack2source/compare/v0.5.1...HEAD
