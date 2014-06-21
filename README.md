# taylor

Taylor is an __experimental__ package manager and build tool for Apple's Swift programming language, developed to explore the possibilities for growing a module ecosystem around the language. It's similar to tools like `npm` and `lein`.

So far, `taylor` supports:

  * Creation of packages
  * Installation of modules directly from Git repositories
  * Building projects

Taylor rides on top of `make(1)` and other CLI tools; it is not an Xcode project generator.

Read on for installation instructions and a tutorial project. [Follow me on Twitter](http://twitter.com/jaz303) to keep up with development progress.

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

## Technical Details

## Current Limitations

(aka missing features that you'd expect in a real package manager/build tool)

  - Automatic dependency resolution/installation!
  - Central package registry
  - Test running
  - Build profiles e.g. "debug", "release"
  - Linking against external libraries

## Copyright &amp; License

&copy; 2014 Jason Frame [ [@jaz303](http://twitter.com/jaz303) / [jason@onehackoranother.com](mailto:jason@onehackoranother.com) ]

Released under the ISC license.