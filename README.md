# taylor

`taylor` is an __experimental__ package manager and build tool for Apple's Swift programming language, developed to explore the possibilities for growing a module ecosystem around the language. It borrows elements from similar tools such as `npm`, `lein` and `bundler`.

With `taylor`'s command line interface you can currently:

  * Create projects
  * Install 3rd party module packages directly from Git repositories
  * Build applications and their dependencies with a single command

(this is just the start, check out the [Current Limitations](#limitations) to see plans for future directions)

Read on for installation instructions and a tutorial project. Please [follow me on Twitter](http://twitter.com/jaz303) to keep up with development progress.

## Contents

  - [Overview](#overview)
  - [Installation](#installation)
  - [Terminology](#terminology)
  - [Tutorial](#tutorial)
  - [Technical Details](#technical)
  - [Command Reference](#reference)
  - [Current Limitations](#limitations)

## <a name='overview'></a>Overview

`taylor` rides on top of `make(1)` and other CLI tools; it is not an Xcode project generator.

This preview version of `taylor` is written in Javascript; a native Swift implementation is a worthwhile long-term goal but no work in this direction will begin until the final versions of the Swift compiler and language specification have been released. In light of this, Javascript should be considered a mere implementation detail, not a core part of `taylor`'s specification.

## <a name='installation'></a>Installation

### Prerequisites

  1. Install node.js. Any recent version should do.
  2. `taylor` assumes that Xcode6 Beta is installed in the default location (`/Applications/Xcode6-Beta.app`). If this is not the case, define the environment variable `TAYLOR_SWIFT_TOOLCHAIN` to point to the `Contents/Developer/Toolchains/XcodeDefault.xctoolchain` subdirectory within wherever Xcode is installed.

All set? Let's go (depending on your configuration the following command may require `sudo`):

    $ npm install -g taylor

Now check that `taylor` was installed successfully:

    $ taylor -v
    0.3.0

## <a name='terminology'></a>Terminology

`taylor`'s installable units are called _packages_. A package defines one or more _targets_, each of a given _target type_. Two target types are currently defined: _module target_, which builds a Swift module that can be imported by other packages, and _app target_, which builds an executable binary, possibly importing other packages.

For brevity's sake, the terms _app_ and _module_ may be used to refer to packages with targets of type app and module, respectively.

## <a name='tutorial'></a>Tutorial

In this short tutorial I'll run you through the process of creating a package, pulling in code from external modules, and finally moving code to your own module.

Let's start by creating a new project:

    $ taylor create-app TaylorTest

We've just asked `taylor` to create a new app, or more concisely, a package with a single `app` target. Let's see what it's made for us:

    $ cd TaylorTest
    $ find . -type f
    ./.gitignore
    ./src/main.swift
    ./swiftpkg.json

Not a whole lot! `taylor` tries to keep things simple. `.gitignore` is self-explanatory, let's check out the other two.

    $ cat swiftpkg.json

`taylor` stores per-package metadata in `swiftpkg.json`. It's somewhat spartan but this will soon be augmented with other details such as package author, version, description etc. From this we see that the package has the same name as we passed to our `taylor create-app` command, and that it defines a single target, `app`, of type `app`.

```json
{
    "name": "TaylorTest",
    "targets": {
        "app": {
            "type": "app"
        }
    }
}
```

Next we'll check out the generated souce code for our test project:

    $ cat src/main.swift

Let's see...

```swift
func Main() -> Int {
    println("Hello world!");
    return 0;
}
```

Not much computer science going on in here, but that's okay, I'll leave that to you. One thing to note is that (unlike Xcode Playgrounds) `taylor` does not permit any top-level statements; all code must be contained within functions and classes, with `Main()` as the entry point.

OK, so we've seen what `taylor` generates for us. Let's compile some code!

    $ taylor build

If all is well this command should complete without incident. Let's take a look at what's happened.

    $ ls -l
    total 16
    -rw-r--r--+ 1 jason  staff  3830 22 Jun 11:35 Makefile.taylor
    drwxr-xr-x+ 3 jason  staff   102 22 Jun 11:30 build
    drwxr-xr-x+ 4 jason  staff   136 22 Jun 11:36 src
    -rw-r--r--+ 1 jason  staff   105 22 Jun 11:26 swiftpkg.json

Two new entries: `Makefile.taylor`, an auto-generated file that describes how to build our project (`taylor` is essentially an opinionated wrapper around `make`), and `build`, a directory containing all of the project build artifacts. We'll ignore the makefile for now (but feel free to poke about, I've tried my best to keep it human-readable) so let's take a closer look inside the `build` directory.

    $ ls -l build/app
    total 88
    -rwxr-xr-x+ 1 jason  staff  44200 22 Jun 11:36 app
    drwxr-xr-x+ 5 jason  staff    170 22 Jun 11:36 lib
    drwxr-xr-x+ 6 jason  staff    204 22 Jun 11:35 module

Here we've got an executable (`app`) and a couple of directories, `lib` and `module`, for compiled Swift modules (compiled Swift modules are comprised of two files, a `.swiftmodule` which is essentially a compiled header + AST, and a `.dylib`, which contains the actual executable module code).

To run our app, we _could_ type `./build/app/app`, but `taylor` offers a `build` command as a shorcut:
    
    $ taylor run
    Hello world!

Whoohoo!

OK, so the spec for our app has been changed; hello-world is no longer acceptable and instead we've been asked to perform some basic maths. In some circumstances using basic operators like `+` and `-` might be acceptable but in this contrived instance we'll play the role of paranoid programmers who are worried the definitions of primitive mathematical operations might change and as such extract the operations to a couple of modules.

So let's install a couple of modules to do the maths mojo for us:

    $ taylor install gh:jaz303/JFTestAdditive
    $ taylor install gh:jaz303/JFTestMultiplicative

The `gh:user/repo` format above is a shorthand notation that instructs `taylor` to install the requested module directly from Github. Assuming these commands go without a hitch, let's see what they did:
    
    $ ls -l modules
    total 0
    drwxr-xr-x  7 jason  staff  238 22 Jun 11:35 JFTestAdditive
    drwxr-xr-x  7 jason  staff  238 22 Jun 11:35 JFTestMultiplicative

Cool, so it's added a top-level `modules` directory and put the module code in there. If you take a peek in the current directory you'll also notice that `Makefile.taylor` has vanished - this is because a fresh build rules are required now that new modules have been installed; `taylor` will automatically regenerate these the next time `taylor build` is invoked. But first let's modify our app code to make use of the modules we've just installed.

We're going to put this in a new file to show `taylor` deals with multiple source files. Open `src/math.swift` in your favourite editor:

    $ vim src/math.swift

And make it look like this:

```swift
import JFTestAdditive
import JFTestMultiplicative

func DoMath() -> Int {
    return add(15, multiply(30, 2));
}
```

Next, edit `src/main.swift`:

    $ vim src/main.swift

And replace the greeting with a call to our new `DoMath()` function:

```swift
func Main() -> Int {
    println(DoMath());
    return 0;
}
```

All done, let's build the project:

    $ taylor build

Again, this should complete without incident. Note that we didn't need to tell `taylor` where to find our modules, nor did we have to instruct it about the new source file - the entire build process was configured for us automatically (a quick check of `Makefile.taylor` will verify this).

Let's run some code!

    $ taylor run

```
75
```

    $ taylor create-module TestModule
    vim modules/TestModule/src/main.swift

```swift
import JFTestAdditive
import JFTestMultiplicative

func DoMath() -> Int {
    return add(multiply(10,30),20);
}
```

    vim modules/TestModule/swiftpkg.json

```json
{
    "name": "TestModule",
    "targets": {
        "module": {
            "type": "module",
            "requires": [
                "JFTestAdditive",
                "JFTestMultiplicative"
            ]
        }
    }
}
```

  $ rm src/math.swift
  $ vim src/main.swift

```swift
import TestModule

func Main() -> Int {
    println(DoMath());
    return 0;
}
```

    $ taylor build
    $ taylor run





## <a name='technical'></a>Technical Details

## <a name='reference'></a>Command Reference

#### `taylor create-app <package>`

Create a new skeleton package named `package` with an initial build target of type `app` in the current directory.

#### `taylor create-module <package>`

Create a new skeleton module named `package` with an initial build target of type `module`.

If this command is run in the context of an existing package the new module is created inside the package's `modules` directory. Otherwise, the new module is created in the current directory.

#### `taylor install <module>`

Installs `module` in the `modules` directory of the current package.

For now, `module` must be the URL of a `git` repository although shortcuts exist for installation from Github. The following are all equivalent:

    $ taylor install git@github.com:jaz303/JFTestAdditive.git
    $ taylor install github:jaz303/JFTestAdditive
    $ taylor install gh:jaz303/JFTestAdditive

#### `taylor build [<target>]`

Builds the given target. If `target` is unspecified, all targets will be built.

#### `taylor run [<target>]`

Run the executable generated by `target`; this must be an `app` target.

If unspecified, `target` will default to the package's first available `app` target.

#### `taylor clean`

Delete all build products for the current package. Does not remove supporting Makefiles or any other files created by `taylor regen`.

#### `taylor zap`

Recursively delete all build products, Makefiles and any other generated files, including those contained within installed modules. Use this command to force a fresh build of your entire project tree.

Be warned, this command is somewhat indiscriminate and will delete any `build` directory it encounters, regardless of whether or not it was created by Taylor.

#### `taylor make <target>`

Low level command; run an explicit `make` rule inside Taylor's environment.

#### `taylor regen`

Force regeneration of the current package's Makefile and any other supporting files required by the build process.

#### `taylor invalidate`

Delete the current package's Makefile and any other supporting files required by the build process.

#### `taylor config`

Dump all of Taylor's effective configuration variables to the console.

#### `taylor env`

Dump Taylor's entire environment to the console.

## <a name='limitations'></a>Current Limitations

`taylor` is an experimental tool and currently offers only the minimum functionality to enable module sharing between authors. It currently lacks:

  1. Automatic dependency resolution/installation!
  2. Central package registry
  3. Build profiles e.g. "debug", "release"
  4. Allow targets to explicitly state their required source files
  5. Invoke REPL
  6. Test running
  7. Linking against external (C) libraries
  
Of these, 1 &amp; 2 are non-trivial, although tools like `bundler` and `npm` have already contributed a lot of work in this space which `taylor` should be able to draw upon. It is expected that tackling the other shortcomings on the list will be straightforward.

## Copyright &amp; License

&copy; 2014 Jason Frame [ [@jaz303](http://twitter.com/jaz303) / [jason@onehackoranother.com](mailto:jason@onehackoranother.com) ]

Released under the ISC license.