require 'fileutils'

ROOT = File.expand_path(File.dirname(__FILE__))
ARCH = "x86_64"

def build_dir
  File.join(ROOT, '.build')
end

def compiled_modules_dir
  File.join(build_dir, 'compiled_modules')
end

def lib_dir
  File.join(build_dir, 'lib')
end

def generated_headers_dir
  File.join(build_dir, 'headers')
end

def module_cache_dir
  File.join(build_dir, 'module_cache')
end

FileUtils.mkdir_p(build_dir)
FileUtils.mkdir_p(compiled_modules_dir)
FileUtils.mkdir_p(generated_headers_dir)
FileUtils.mkdir_p(lib_dir)

class SwiftModule
  def initialize(name, path = nil)
    @name = name
    @path = path || File.join(ROOT, 'modules', @name)
  end

  def name
    @name
  end

  def path
    @path
  end

  def source_dir
    File.join(path, 'src')
  end

  def source_files
    Dir["#{source_dir}/**/*.swift"]
  end

  def object_files
    source_files.map { |s| object_file_for(s) }
  end

  def object_file_for(source_file)
    source_file.gsub('.swift', '.o')
  end

  def target_file
    File.join(compiled_modules_dir, "#{@name}.swiftmodule")
  end

  def header_file
    File.join(generated_headers_dir, "#{@name}-Swift.h")
  end

  def linker_flag
    "-Xlinker -sectalign -Xlinker __SWIFT -Xlinker __ast -Xlinker 4 -Xlinker -sectcreate -Xlinker __SWIFT -Xlinker __ast -Xlinker #{target_file}"
  end

  def library_path
    File.join(path, "#{@name}.dylib")
  end

  def linkable
    File.join(lib_dir, "#{@name}.swiftmodule")
  end

  def libify!
    dir = linkable
    FileUtils.mkdir_p(dir)
    FileUtils.cp(target_file, File.join(dir, "#{ARCH}.swiftmodule"))
  end
end

def ordered_modules
  # TODO: sort this list by dependencies
  #return []
  Dir["#{ROOT}/modules/*"].map { |m| SwiftModule.new(File.basename(m)) }
end

def main_module
  SwiftModule.new('Entry', ROOT)
end

def swift_compile_flags
  flags  = ""
  flags += " -target #{ARCH}-apple-macosx10.9"
  flags += " -sdk /Applications/Xcode6-Beta.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.10.sdk"
  flags += " -O0"
  flags += " -g"
  #flags += " -module-cache-path #{module_cache_dir}"
  flags += " -I #{compiled_modules_dir}"
  flags += " -j4"
  flags
end

def build_module(mod)

  cmd = <<-CMD
    swift \\
      -emit-library \\
      #{swift_compile_flags} \\
      -o #{mod.library_path} \\
      #{mod.source_files.join(' ')}
  CMD
  `#{cmd}`
  
  cmd = <<-CMD
    swift \\
      #{swift_compile_flags} -c \\
      -module-name #{mod.name} \\
      #{mod.source_files.join(' ')} \\
      -serialize-diagnostics \\
      -save-temps \\
      -emit-dependencies \\
      -emit-module \\
      -emit-module-path #{mod.target_file} \\
      -emit-objc-header \\
      -emit-objc-header-path #{mod.header_file}
  CMD
  puts cmd
  `#{cmd}`

  mod.libify!
end

def link_project
  cmd = <<-CMD
    swift \\
      #{swift_compile_flags} -c \\
      #{main_module.source_files.join(' ')}
  CMD
  puts cmd
  `#{cmd}`

  cmd = <<-CMD
    swift \\
      #{swift_compile_flags} -c \\
      -o src/main.o \\
      src/main.swift
  CMD
  `#{cmd}`

  cmd = <<-CMD
    clang \\
      -v \\
      -arch #{ARCH} \\
      -isysroot /Applications/Xcode6-Beta.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.10.sdk \\
      -mmacosx-version-min=10.9 \\
      -lswift_stdlib_core \\
      -L/Applications/Xcode6-Beta.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/macosx \\
      -Xlinker -force_load \\
      -Xlinker /Applications/Xcode6-Beta.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/arc/libarclite_macosx.a \\
      -Xlinker -rpath -Xlinker @executable_path/../Frameworks \\
      #{(ordered_modules).map(&:linker_flag).join(' ')} \\
      #{(ordered_modules).map(&:library_path).join(' ')} \\
      src/main.o \\
      -o my-app
  CMD

  # cmd = <<-CMD
  #   swift \\
  #     -v \\
  #     -arch #{ARCH} \\
  #     -target #{ARCH}-apple-macosx10.9 \\
  #     -sdk /Applications/Xcode6-Beta.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.10.sdk \\
  #     -L #{lib_dir} \\
  #     -I #{compiled_modules_dir} \\
  #     -o quux \\
  #     -Xlinker -force_load \\
  #     -Xlinker /Applications/Xcode6-Beta.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/arc/libarclite_macosx.a \\
  #     -Xlinker -sectalign \\
  #     -Xlinker __SWIFT \\
  #     -Xlinker __ast \\
  #     -Xlinker 4 \\
  #     #{ordered_modules.map(&:linker_flag).join(' ')} \\
  #     #{main_module.source_files.join(' ')} \\
  # CMD



  puts cmd
  `#{cmd}`
end

def make_modules_linkable

end

ordered_modules.each { |m| build_module(m) }
#build_module(main_module)
link_project