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

    $ taylor --version
    0.3.0

## <a name='terminology'></a>Terminology

`taylor`'s installable units are called _packages_. A package defines one or more _targets_, each of a given _target type_. Two target types are currently defined: _module target_, which builds a Swift module that can be imported by other packages, and _app target_, which builds an executable binary, possibly importing other packages.

For brevity's sake, the terms _app_ and _module_ may be used to refer to packages with targets of type app and module, respectively.

## <a name='tutorial'></a>Tutorial

In this short tutorial I'll walk through the process of creating a package, pulling in code from external modules, and finally extracting reusable code to its own module.

Let's start by creating a new project:

    $ taylor create-app TaylorTest

We've just asked `taylor` to create a new app, or more concisely, a package with a single `app` target. Let's see what it's made for us:

    $ cd TaylorTest
    $ find . -type f
    ./.gitignore
    ./src/main.swift
    ./swiftpkg.json

Not a whole lot! `taylor` tries to keep things simple. `.gitignore` is self-explanatory so let's check out the other two.

    $ cat swiftpkg.json

`taylor` stores per-package metadata in `swiftpkg.json`. Right now it's somewhat spartan but this will soon be augmented with other details such as package author, version, description etc. We can see from the contents that the package has the same name as we passed to our `taylor create-app` command, and that it defines a single target, `app`, of type `app`.

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

Not much computer science going on in here, but that's okay - I'll leave that to you. One thing to note is that (unlike Xcode Playgrounds) `taylor` does not permit any top-level statements; all code must be contained within functions and classes, with `Main()` as the entry point.

OK, so we've seen what `taylor` generates for us. Let's compile some code!

    $ taylor build

If all is well this command should complete without incident. Let's take a look at what's happened.

```shell
$ ls -l
total 16
-rw-r--r--+ 1 jason  staff  3830 22 Jun 11:35 Makefile.taylor
drwxr-xr-x+ 3 jason  staff   102 22 Jun 11:30 build
drwxr-xr-x+ 4 jason  staff   136 22 Jun 11:36 src
-rw-r--r--+ 1 jason  staff   105 22 Jun 11:26 swiftpkg.json
```

Two new entries: `Makefile.taylor`, an auto-generated file that describes how to build our project (`taylor` is essentially an opinionated wrapper around `make`), and `build`, a directory containing all of the project build artifacts. We'll ignore the makefile for now (but feel free to poke about, I've tried my best to keep it human-readable) so let's take a closer look inside the `build` directory.

```shell
$ ls -l build
total 0
drwxr-xr-x+  3 jason  staff  102 24 Jun 16:04 app
drwxr-xr-x+ 14 jason  staff  476 24 Jun 16:04 modules

$ ls -l build/app
total 88
-rwxr-xr-x+ 1 jason  staff  44208 24 Jun 16:04 app

$ ls -l build/modules
total 112
-rw-r--r--+ 1 jason  staff    504 24 Jun 18:34 app_main.swiftdoc
-rw-r--r--+ 1 jason  staff   7408 24 Jun 18:34 app_main.swiftmodule
-rwxr-xr-x+ 1 jason  staff  44020 24 Jun 18:34 libapp_main.dylib
```

Here we've got an executable (`build/app/app`) and a `modules` directory containing the Swift modules used by our project (compiled Swift modules are comprised of two files: a `.swiftmodule`, essentially a compiled header + AST, and a `.dylib`, which contains the actual executable module code).

To run our app, we _could_ type `./build/app/app`, but as a shortcut `taylor` has a `run` command. Let's use it:
    
    $ taylor run
    Hello world!

Whoohoo, it works.

So far we've demonstrated `taylor`'s role as a build tool by creating a new project, writing some code, and (hopefully) having it build successfully and run. But being a build tool is only half of `taylor`'s remit - it's a package manager, too - so the next we're going to do is pull in some code from other packages.

Imagine the spec for our simple app has changed and that "hello world" is no longer acceptable. Instead we've been asked to double a number then add five to it. Now, in normal circumstances we could use basic operators like `+` and `-`, but in this contrived instance let's assume we're paranoid that the definitions of primitive mathematical operations might change in the future. To defend against this we'll import the operations from a couple of modules.

Modules are installed via the `taylor install` subcommand. Let's go:

    $ taylor install gh:jaz303/JFTestAdditive
    $ taylor install gh:jaz303/JFTestMultiplicative

The `gh:user/repo` format above is a simple shorthand notation that instructs `taylor` to install the requested module directly from Github (alternatively any valid Git URL may be used). Assuming these commands go without a hitch, let's observe the effects:
    
    $ ls -l modules
    total 0
    drwxr-xr-x  7 jason  staff  238 22 Jun 11:35 JFTestAdditive
    drwxr-xr-x  7 jason  staff  238 22 Jun 11:35 JFTestMultiplicative

Cool, so it's added a top-level `modules` directory and put the module code in there. If you take a peek in the current directory you'll also notice that `Makefile.taylor` has vanished - this is because a fresh build rules are required now that new modules have been installed; `taylor` will automatically regenerate this the next time `taylor build` is invoked.

Let's modify our app code to make use of the modules we've just installed. We'll place this code in a new file to demonstrate `taylor`'s ability to deal with multiple source files so open `src/math.swift` in your favourite editor:

    $ vim src/math.swift

And make it look like this:

```swift
import JFTestAdditive
import JFTestMultiplicative

func DoubleAndAddFive(x : Int) -> Int {
    return add(multiply(x, 2), 5);
}
```

Next, edit `src/main.swift`:

    $ vim src/main.swift

And replace the greeting with a call to our new `DoubleAndAddFive()` function:

```swift
func Main() -> Int {
    println(DoubleAndAddFive(30));
    return 0;
}
```

All done, let's build the project:

    $ taylor build

Again, this should complete without incident. Note that we didn't need to tell `taylor` where to find our modules, nor did we have to instruct it about the new source file - the entire build process was configured for us automatically (a quick check of `Makefile.taylor` will verify this).

Let's run some code!

    $ taylor run
    65

Sweet, that looks right. We're not quite done yet though - the ability to double an integer and add five might be useful to others in the future so the final task we're going to work through in this tutorial is to extract said heavy-duty mathematics into its own module.

We'll begin by creating an empty module:

    $ taylor create-module TestModule

Notice that `taylor` detected that we ran this command from inside another package and (correctly) decided to place our new module inside the parent module's `modules` directory.

Next we must move our existing definition of `DoubleAndAddFive()` into the new module. Edit:

    $ vim modules/TestModule/src/main.swift

And add in this code:

```swift
import JFTestAdditive
import JFTestMultiplicative

func DoubleAndAddFive(x : Int) -> Int {
    return add(multiply(x, 2), 5);
}
```

We can see that `TestModule` calls functions that are defined in the `JFTestAdditive` and `JFTestMultiplicative` modules. In order that `taylor` can link against these modules and build the project successfully they must therefore be listed as dependencies of our new module. To do this, edit `TestModule`'s `swiftpkg.json`:

    vim modules/TestModule/swiftpkg.json

And add the names of the dependencies to the module target's `requires` key:

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

Next, we no longer need the original definition of `DoubleAndAddFive()` so let's just delete it:

    $ rm src/math.swift

Finally we'll import `TestModule` so its functions are visible from our app's entry point. Edit:

    $ vim src/main.swift

And add the import at the top of the file:

```swift
import TestModule

func Main() -> Int {
    println(DoubleAndAddFive(30));
    return 0;
}
```

Phew! Let's build and run!

    $ taylor build
    $ taylor run
    65

Success! That brings us to the end of the tutorial. Let's quickly recap on what we've learned:

  * how to create a new `taylor` app project
  * how to build and run code
  * how to install modules from Git(hub)
  * how to create a submodule
  * how to configure a submodule to depend on other modules

You should now know enough to go forth and experiment by writing your own packages. I expect there to be many bugs and edge cases in `taylor`'s current (preview) implementation - please report any you find on the Github issue tracker.

For a full command reference, read on...

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