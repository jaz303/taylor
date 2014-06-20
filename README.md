# taylor

Taylor is an __experimental__ package manager and build tool for Apple's Swift programming language, developed to explore the possibilities for growing a module ecosystem around the language.

Taylor rides on top of `make(1)` and the cli; it is not compatible with Xcode.

## Installation

### Prerequisites

  1. Install node.js. Any recent version should do.
  2. `taylor` assumes that Xcode6 Beta is installed in the default location (`/Applications/Xcode6-Beta.app`). If this is not the case, define the environment variable `TAYLOR_SWIFT_TOOLCHAIN` to point to the `Contents/Developer/Toolchains/XcodeDefault.xctoolchain` subdirectory within wherever Xcode is installed.

All set? Let's go:

```
$ npm install -g taylor
```

(depending on your configuration the above command may require `sudo`)

## Tutorial

## Missing features that you'd expect in a real package manager/build tool

  - Automatic dependency resolution/installation!
  - Central package registry
  - Test running
  - Build profiles e.g. "debug", "release"
