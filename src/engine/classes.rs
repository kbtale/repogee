use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum FuturisticClass {
    SystemsEngineer,
    ComputeArchitect,
    BackendDeveloper,
    DeclarativeMathematician,
    LogicInquisitor,
    FrontendArtisan,
    StyleSculptor,
    DataAlchemist,
    Bioinformatician,
    DatabaseAdministrator,
    NoSqlSpecialist,
    ProtocolArbiter,
    CodecKeeper,
    DevOpsEngineer,
    IaCArchitect,
    MobileDeveloper,
    VirtualArchitect,
    Assets3DDesigner,
    AcousticDesigner,
    FpgaEngineer,
    PcbLayoutEngineer,
    RedTeamOperator,
    BlueTeamOperator,
    QaEngineer,
    CodeSanitarian,
    Chronicler,
    DesktopConfigurator,
}

impl FuturisticClass {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::SystemsEngineer => "Systems Engineer",
            Self::ComputeArchitect => "Compute Architect",
            Self::BackendDeveloper => "Backend Developer",
            Self::DeclarativeMathematician => "Declarative Mathematician",
            Self::LogicInquisitor => "Logic Inquisitor",
            Self::FrontendArtisan => "Frontend Artisan",
            Self::StyleSculptor => "Style Sculptor",
            Self::DataAlchemist => "Data Alchemist",
            Self::Bioinformatician => "Bioinformatician",
            Self::DatabaseAdministrator => "Database Administrator",
            Self::NoSqlSpecialist => "NoSQL Specialist",
            Self::ProtocolArbiter => "Protocol Arbiter",
            Self::CodecKeeper => "Codec Keeper",
            Self::DevOpsEngineer => "DevOps Engineer",
            Self::IaCArchitect => "IaC Architect",
            Self::MobileDeveloper => "Mobile Developer",
            Self::VirtualArchitect => "Virtual Architect",
            Self::Assets3DDesigner => "3D Designer",
            Self::AcousticDesigner => "Acoustic Designer",
            Self::FpgaEngineer => "FPGA Engineer",
            Self::PcbLayoutEngineer => "PCB Layout Engineer",
            Self::RedTeamOperator => "Red Team Operator",
            Self::BlueTeamOperator => "Blue Team Operator",
            Self::QaEngineer => "QA Engineer",
            Self::CodeSanitarian => "Code Sanitarian",
            Self::Chronicler => "Chronicler",
            Self::DesktopConfigurator => "Desktop Configurator",
        }
    }

    pub fn role_suffix(&self) -> &'static str {
        match self {
            Self::SystemsEngineer => "Vanguard",
            Self::ComputeArchitect => "Accelerator",
            Self::BackendDeveloper => "Architect",
            Self::DeclarativeMathematician => "Purist",
            Self::LogicInquisitor => "Inquisitor",
            Self::FrontendArtisan => "Sculptor",
            Self::StyleSculptor => "Weaver",
            Self::DataAlchemist => "Sorcerer",
            Self::Bioinformatician => "Sequencer",
            Self::DatabaseAdministrator => "Archivist",
            Self::NoSqlSpecialist => "Indexer",
            Self::ProtocolArbiter => "Sentinel",
            Self::CodecKeeper => "Keeper",
            Self::DevOpsEngineer => "Commander",
            Self::IaCArchitect => "Terraformer",
            Self::MobileDeveloper => "Operator",
            Self::VirtualArchitect => "Weaver",
            Self::Assets3DDesigner => "Sculptor",
            Self::AcousticDesigner => "Composer",
            Self::FpgaEngineer => "Alchemist",
            Self::PcbLayoutEngineer => "Circuit Weaver",
            Self::RedTeamOperator => "Infiltrator",
            Self::BlueTeamOperator => "Specter",
            Self::QaEngineer => "Tester",
            Self::CodeSanitarian => "Purifier",
            Self::Chronicler => "Scribe",
            Self::DesktopConfigurator => "Integrator",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.trim() {
            "Systems Engineer" => Some(Self::SystemsEngineer),
            "Compute Architect" => Some(Self::ComputeArchitect),
            "Backend Developer" => Some(Self::BackendDeveloper),
            "Declarative Mathematician" => Some(Self::DeclarativeMathematician),
            "Logic Inquisitor" => Some(Self::LogicInquisitor),
            "Frontend Artisan" => Some(Self::FrontendArtisan),
            "Style Sculptor" => Some(Self::StyleSculptor),
            "Data Alchemist" => Some(Self::DataAlchemist),
            "Bioinformatician" => Some(Self::Bioinformatician),
            "Database Administrator" => Some(Self::DatabaseAdministrator),
            "NoSQL Specialist" => Some(Self::NoSqlSpecialist),
            "Protocol Arbiter" => Some(Self::ProtocolArbiter),
            "Codec Keeper" => Some(Self::CodecKeeper),
            "DevOps Engineer" => Some(Self::DevOpsEngineer),
            "IaC Architect" => Some(Self::IaCArchitect),
            "Mobile Developer" => Some(Self::MobileDeveloper),
            "Virtual Architect" => Some(Self::VirtualArchitect),
            "3D Designer" => Some(Self::Assets3DDesigner),
            "Acoustic Designer" => Some(Self::AcousticDesigner),
            "FPGA Engineer" => Some(Self::FpgaEngineer),
            "PCB Layout Engineer" => Some(Self::PcbLayoutEngineer),
            "Red Team Operator" => Some(Self::RedTeamOperator),
            "Blue Team Operator" => Some(Self::BlueTeamOperator),
            "QA Engineer" => Some(Self::QaEngineer),
            "Code Sanitarian" => Some(Self::CodeSanitarian),
            "Chronicler" => Some(Self::Chronicler),
            "Desktop Configurator" => Some(Self::DesktopConfigurator),
            _ => None,
        }
    }
}

impl std::fmt::Display for FuturisticClass {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

pub fn classify_file(path: &str) -> Option<(FuturisticClass, &'static str)> {
    let lower_path = path.to_lowercase();
    
    let path_buf = std::path::Path::new(&lower_path);
    let filename = path_buf.file_name()
        .and_then(|f| f.to_str())
        .unwrap_or(&lower_path);

    if filename == ".gitignore"
        || filename == ".gitattributes"
        || filename == ".gitmodules"
        || filename == ".gitkeep"
        || filename == ".gitconfig"
        || filename == ".mailmap"
        || filename == ".git-blame-ignore-revs"
        || filename == ".editorconfig"
        || filename == ".project"
        || filename == ".classpath"
        || filename == ".factorypath"
        || filename == "eslint.config.js"
        || filename == "eslint.config.mjs"
        || filename == "eslint.config.cjs"
        || filename == "prettier.config.js"
        || filename == "prettier.config.cjs"
        || filename == "stylelint.config.js"
        || filename == "tslint.json"
        || filename == "biome.json"
        || filename == "oxlint.json"
        || filename == "ruff.toml"
        || filename == ".ruff.toml"
        || filename == ".pylintrc"
        || filename == "pylintrc"
        || filename == ".flake8"
        || filename == "mypy.ini"
        || filename == ".mypy.ini"
        || filename == ".isort.cfg"
        || filename == "isort.cfg"
        || filename == "detekt.yml"
        || filename == "detekt-config.yml"
        || filename == ".scalafmt.conf"
        || filename == ".hlint.yaml"
        || filename == ".credo.exs"
        || filename == "revive.toml"
        || filename == ".shellcheckrc"
        || filename == "hadolint.yaml"
        || filename == ".hadolint.yaml"
        || filename == "checkstyle.xml"
        || filename == "findbugs-exclude.xml"
        || filename == "spotbugs-exclude.xml"
        || filename == "sonar-project.properties"
        || filename == ".coafile"
        || filename == "tsconfig.json"
        || filename == "jsconfig.json"
        || filename == "tsconfig.eslint.json"
        || filename == "tsconfig.build.json"
        || filename == ".swcrc"
        || filename == "esbuild.config.js"
        || filename == "esbuild.config.ts"
        || filename == "vite.config.js"
        || filename == "vite.config.ts"
        || filename == "vite.config.mjs"
        || filename == "vite.config.cjs"
        || filename == "webpack.config.js"
        || filename == "webpack.config.ts"
        || filename == "webpack.config.coffee"
        || filename == "webpack.config.babel.js"
        || filename == "rollup.config.js"
        || filename == "rollup.config.ts"
        || filename == "rollup.config.mjs"
        || filename == ".parcelrc"
        || filename == "commitlint.config.js"
        || filename == "bunfig.toml"
        || filename == ".secrets.baseline"
        || filename == ".gitleaks.toml"
        || filename == "gitleaks.toml"
        || filename == ".talismanrc"
        || filename == ".snyk"
        || filename == "osv-scanner.toml"
        || filename == ".dockerignore"
        || filename == ".containerignore"
        || filename == "package-lock.json"
        || filename == "yarn.lock"
        || filename == "pnpm-lock.yaml"
        || filename == "bun.lockb"
        || filename == "deno.lock"
        || filename == "cargo.lock"
        || filename == "poetry.lock"
        || filename == "pipfile.lock"
        || filename == "requirements.txt.lock"
        || filename == "uv.lock"
        || filename == "pydist.json"
        || filename == "gemfile.lock"
        || filename == "composer.lock"
        || filename == "mix.lock"
        || filename == "go.sum"
        || filename == "go.work.sum"
        || filename == "package.resolved"
        || filename == "podfile.lock"
        || filename == "cartfile.resolved"
        || filename == "pubspec.lock"
        || filename == "packages.lock.json"
        || filename == ".terraform.lock.hcl"
        || filename.starts_with(".eslintrc")
        || filename.starts_with(".prettierrc")
        || filename.starts_with(".stylelintrc")
        || filename.starts_with(".markdownlint")
        || filename.starts_with(".swiftlint")
        || filename.starts_with(".golangci")
        || filename.starts_with(".remarkrc")
        || filename.starts_with(".textlintrc")
        || filename.starts_with(".babelrc")
        || filename.starts_with(".postcssrc")
        || filename.starts_with("babel.config.")
        || filename.starts_with("postcss.config.")
        || filename.starts_with(".commitlintrc")
        || filename.starts_with(".releaserc")
        || filename.starts_with(".solidarity")
        || filename.starts_with(".nvmrc")
        || filename.starts_with(".node-version")
        || filename.starts_with(".ruby-version")
        || filename.starts_with(".python-version")
        || filename.starts_with(".go-version")
        || filename.starts_with(".java-version")
        || filename.starts_with(".sdkmanrc")
        || filename.starts_with(".tool-versions")
        || filename.starts_with(".terraform-version")
        || filename.starts_with(".settings/")
    {
        return Some((FuturisticClass::CodeSanitarian, "Git/Linter"));
    }

    let is_workflow = lower_path.contains(".github/workflows") || lower_path.contains(".github\\workflows");
    if is_workflow
        || filename == "dockerfile"
        || filename == "containerfile"
        || filename == "makefile"
        || filename == "gnumakefile"
        || filename == "makefile.in"
        || filename == "makefile.am"
        || filename == "jenkinsfile"
        || filename == "vagrantfile"
        || filename == "cmakelists.txt"
        || filename == "meson.build"
        || filename == "meson_options.txt"
        || filename == "build.ninja"
        || filename == "sconstruct"
        || filename == "sconscript"
        || filename == "wscript"
        || filename == "pom.xml"
        || filename == "build.gradle"
        || filename == "build.gradle.kts"
        || filename == "settings.gradle"
        || filename == "settings.gradle.kts"
        || filename == "build.xml"
        || filename == "ivy.xml"
        || filename == "rakefile"
        || filename == "build.cake"
        || filename == "build.fsx"
        || filename == "project.clj"
        || filename.starts_with("dockerfile.")
        || filename.ends_with(".dockerfile")
        || filename.starts_with("docker-compose.")
    {
        return Some((FuturisticClass::DevOpsEngineer, "DevOps"));
    }

    if filename == "pulumi.yaml"
        || filename == "ansible.cfg"
        || filename == "kustomization.yaml"
        || filename == "kustomization.yml"
        || filename == "default.nix"
        || filename == "flake.nix"
        || filename == "flake.lock"
        || filename.starts_with("pulumi.")
    {
        return Some((FuturisticClass::IaCArchitect, "IaC"));
    }

    if filename == ".env"
        || filename == ".envrc"
        || filename.starts_with(".env.")
    {
        return Some((FuturisticClass::DesktopConfigurator, "Config"));
    }

    if filename == "license"
        || filename == "license.txt"
        || filename == "license.md"
        || filename == "copying"
        || filename.starts_with("readme")
    {
        return Some((FuturisticClass::Chronicler, "Readme/License"));
    }

    if let Some(ext) = filename.split('.').next_back() {
        match ext {
            "asm" | "s" | "nasm" | "masm" | "a51" | "a66" | "asmx" | "src" | "lst" | "err" | "asp" | "cod" | "gasm" | "riscv" | "rv" | "rvs" | "rvasm" | "sparc" | "spa" | "z80" | "z80s" | "i80" | "6502" | "s65" | "65c02" | "68k" | "m68k" | "m68000" | "ppc" | "ppcasm" | "pdp" | "vax" | "mar" | "mips" | "mips32" | "mips64" | "avr" | "avrasm" => {
                Some((FuturisticClass::SystemsEngineer, "Assembly"))
            }
            "c" | "h" | "i" | "pch" | "gch" | "def" | "rc" | "res" | "aps" | "cur" | "dlg" | "x" | "y" => {
                Some((FuturisticClass::SystemsEngineer, "C"))
            }
            "cpp" | "cxx" | "cc" | "c++" | "hpp" | "hxx" | "hh" | "h++" | "inl" | "tcc" | "impl" | "ixx" | "cppm" | "cxxm" | "mpp" => {
                Some((FuturisticClass::SystemsEngineer, "C++"))
            }
            "rs" | "rlib" | "rmeta" | "crate" | "rustc" => {
                Some((FuturisticClass::SystemsEngineer, "Rust"))
            }
            "zig" | "zon" => Some((FuturisticClass::SystemsEngineer, "Zig")),
            "nim" | "nims" | "nimble" => Some((FuturisticClass::SystemsEngineer, "Nim")),
            "d" | "di" | "ddoc" => Some((FuturisticClass::SystemsEngineer, "D")),
            "go" => Some((FuturisticClass::SystemsEngineer, "Go")),
            "odin" => Some((FuturisticClass::SystemsEngineer, "Odin")),
            "hc" => Some((FuturisticClass::SystemsEngineer, "HolyC")),
            "dts" | "dtsi" | "dtb" | "dtbo" | "svd" | "ioc" | "ld" | "lds" | "map" | "sym" | "exp" | "o" | "a" | "so" | "ko" | "elf" | "axf" | "out" | "bin" | "hex" | "srec" | "s19" | "mif" | "coe" | "dylib" | "framework" | "obj" | "lib" | "dll" | "sys" | "drv" | "ocx" | "vxd" | "386" | "exe" | "com" | "scr" | "cpl" | "msi" | "rom" | "dump" | "raw" | "efi" | "fd" | "fv" | "cap" | "il" => {
                Some((FuturisticClass::SystemsEngineer, "Systems Binary"))
            }
            "prg" | "crt" | "tap" | "d64" => Some((FuturisticClass::SystemsEngineer, "Retro")),

            "cu" | "cuh" | "ptx" => Some((FuturisticClass::ComputeArchitect, "CUDA")),
            "cl" => Some((FuturisticClass::ComputeArchitect, "OpenCL")),
            "metal" => Some((FuturisticClass::ComputeArchitect, "Metal")),
            "spv" | "spvasm" | "rgen" | "rint" | "rahit" | "rchit" | "rmiss" | "rcall" => {
                Some((FuturisticClass::ComputeArchitect, "Vulkan SPIR-V"))
            }
            "wgsl" => Some((FuturisticClass::ComputeArchitect, "WebGPU")),
            "glsl" | "vert" | "frag" | "geom" | "tesc" | "tese" | "comp" | "vs" | "gs" => {
                Some((FuturisticClass::ComputeArchitect, "GLSL Shader"))
            }
            "hlsl" | "hlsli" | "fx" | "fxh" => Some((FuturisticClass::ComputeArchitect, "HLSL DirectX")),

            "java" | "class" | "jar" | "war" | "ear" | "jmod" | "jsp" | "jspf" | "jspx" | "tag" | "tagx" | "tld" => {
                Some((FuturisticClass::BackendDeveloper, "Java"))
            }
            "cs" | "csx" | "csproj" | "sln" | "resx" | "edmx" | "cshtml" | "aspx" | "ascx" | "asax" | "ashx" | "svc" | "xaml" | "xoml" | "baml" | "vb" | "vbproj" | "frm" | "bas" | "cls" | "vbp" | "ctl" | "dob" | "dsr" | "dsx" => {
                Some((FuturisticClass::BackendDeveloper, "C#/VB"))
            }
            "kt" | "kts" | "ktm" => Some((FuturisticClass::BackendDeveloper, "Kotlin")),
            "swift" => Some((FuturisticClass::BackendDeveloper, "Swift")),
            "m" | "mm" => Some((FuturisticClass::BackendDeveloper, "Objective-C")),
            "php" | "php3" | "php4" | "php5" | "phps" | "phar" | "ctp" => {
                Some((FuturisticClass::BackendDeveloper, "PHP"))
            }
            "pas" | "dpr" | "dfm" | "xfm" | "dpk" | "dcu" | "ppu" | "or" | "bpl" | "dcp" | "lfm" | "lrs" | "lpi" | "lps" | "lpk" => {
                Some((FuturisticClass::BackendDeveloper, "Pascal"))
            }
            "cbl" | "cob" | "cpy" | "cobol" | "pco" | "cobc" | "cblc" | "cobol85" => {
                Some((FuturisticClass::BackendDeveloper, "COBOL"))
            }
            "f" | "for" | "f77" | "f90" | "f95" | "f03" | "f08" | "f15" | "f18" | "f23" | "fpp" | "ftn" | "fi" => {
                Some((FuturisticClass::BackendDeveloper, "Fortran"))
            }
            "adb" | "ads" | "ada" | "gpr" => Some((FuturisticClass::BackendDeveloper, "Ada")),
            "groovy" | "gvy" => Some((FuturisticClass::BackendDeveloper, "Groovy")),
            "scala" | "sc" | "sbt" => Some((FuturisticClass::BackendDeveloper, "Scala")),
            "cfm" | "cfc" | "cfml" => Some((FuturisticClass::BackendDeveloper, "ColdFusion")),

            "hs" | "lhs" | "cabal" => Some((FuturisticClass::DeclarativeMathematician, "Haskell")),
            "lisp" | "lsp" | "scm" | "ss" | "sps" | "rkt" | "rktd" | "rktl" | "r6rs" => {
                Some((FuturisticClass::DeclarativeMathematician, "Lisp/Scheme"))
            }
            "clj" | "cljs" | "cljc" | "cljx" => Some((FuturisticClass::DeclarativeMathematician, "Clojure")),
            "erl" | "hrl" | "beam" => Some((FuturisticClass::DeclarativeMathematician, "Erlang")),
            "ex" | "exs" | "eex" | "heex" | "leex" => Some((FuturisticClass::DeclarativeMathematician, "Elixir")),
            "ml" | "mli" | "mll" | "mly" | "cmo" | "cmi" | "cmx" | "cma" | "cmxa" | "cmxs" | "re" | "rei" => {
                Some((FuturisticClass::DeclarativeMathematician, "OCaml/Reason"))
            }
            "fs" | "fsi" | "fsx" | "fsproj" => Some((FuturisticClass::DeclarativeMathematician, "F#")),
            "gleam" => Some((FuturisticClass::DeclarativeMathematician, "Gleam")),
            "roc" => Some((FuturisticClass::DeclarativeMathematician, "Roc")),
            "elm" => Some((FuturisticClass::DeclarativeMathematician, "Elm")),

            "pl" | "pro" | "prolog" | "P" => Some((FuturisticClass::LogicInquisitor, "Prolog")),
            "agda" => Some((FuturisticClass::LogicInquisitor, "Agda")),
            "idr" => Some((FuturisticClass::LogicInquisitor, "Idris")),

            "html" | "htm" | "shtml" | "xhtml" | "phtml" | "dhtml" | "html5" => {
                Some((FuturisticClass::FrontendArtisan, "HTML"))
            }
            "js" | "mjs" | "cjs" => Some((FuturisticClass::FrontendArtisan, "JavaScript")),
            "ts" | "d.ts" | "cts" | "flow" => Some((FuturisticClass::FrontendArtisan, "TypeScript")),
            "jsx" | "tsx" => Some((FuturisticClass::FrontendArtisan, "React/TSX")),
            "vue" => Some((FuturisticClass::FrontendArtisan, "Vue")),
            "svelte" => Some((FuturisticClass::FrontendArtisan, "Svelte")),
            "astro" => Some((FuturisticClass::FrontendArtisan, "Astro")),
            "wasm" | "wat" => Some((FuturisticClass::FrontendArtisan, "WebAssembly")),
            "njk" | "liquid" | "hbs" | "mustache" | "ejs" | "pug" | "jade" | "haml" | "slim" | "twig" | "blade.php" | "volt" | "solid" | "mst" | "tmpl" => {
                Some((FuturisticClass::FrontendArtisan, "Template"))
            }

            "css" => Some((FuturisticClass::StyleSculptor, "CSS")),
            "scss" | "sass" => Some((FuturisticClass::StyleSculptor, "Sass")),
            "less" => Some((FuturisticClass::StyleSculptor, "Less")),
            "styl" => Some((FuturisticClass::StyleSculptor, "Stylus")),
            "postcss" | "pcss" => Some((FuturisticClass::StyleSculptor, "PostCSS")),

            "py" | "pyw" | "pyc" | "pyo" | "pyd" | "pyi" => Some((FuturisticClass::DataAlchemist, "Python")),
            "ipynb" => Some((FuturisticClass::DataAlchemist, "Jupyter")),
            "r" | "R" | "RData" | "rda" | "rds" | "Rmd" | "Rnw" => Some((FuturisticClass::DataAlchemist, "R")),
            "jl" => Some((FuturisticClass::DataAlchemist, "Julia")),
            "mat" | "fig" | "mlx" => Some((FuturisticClass::DataAlchemist, "MATLAB")),
            "parquet" | "feather" | "arrow" | "ipc" | "h5" | "hdf5" | "nc" | "cdf" => {
                Some((FuturisticClass::DataAlchemist, "Data Storage"))
            }
            "csv" | "tsv" | "dat" | "xlsx" | "xls" => Some((FuturisticClass::DataAlchemist, "Spreadsheet")),

            "fasta" | "fa" | "fastq" | "fq" | "bam" | "sam" => Some((FuturisticClass::Bioinformatician, "FASTA/BAM")),
            "vcf" => Some((FuturisticClass::Bioinformatician, "VCF")),
            "pdb" | "cif" | "mmcif" => Some((FuturisticClass::Bioinformatician, "PDB")),
            "gff" | "gtf" | "gff3" => Some((FuturisticClass::Bioinformatician, "GFF/GTF")),

            "sql" | "mysql" | "pgsql" | "ddl" | "dml" | "dcl" | "tab" | "viw" | "prc" | "fnc" | "idx" | "sp" => {
                Some((FuturisticClass::DatabaseAdministrator, "SQL"))
            }
            "sqlite" | "sqlite3" | "db3" | "sl3" => Some((FuturisticClass::DatabaseAdministrator, "SQLite")),

            "bson" | "mongo" => Some((FuturisticClass::NoSqlSpecialist, "MongoDB")),
            "cypher" | "cql" => Some((FuturisticClass::NoSqlSpecialist, "Neo4j/Graph")),
            "influxql" | "flux" => Some((FuturisticClass::NoSqlSpecialist, "Time Series")),
            "rdb" | "aof" => Some((FuturisticClass::NoSqlSpecialist, "Redis")),

            "graphql" | "gql" => Some((FuturisticClass::ProtocolArbiter, "GraphQL")),
            "proto" => Some((FuturisticClass::ProtocolArbiter, "Protobuf")),
            "avsc" | "avro" => Some((FuturisticClass::ProtocolArbiter, "Avro")),
            "thrift" => Some((FuturisticClass::ProtocolArbiter, "Thrift")),

            "json" | "jsonl" | "json5" | "hjson" => Some((FuturisticClass::CodecKeeper, "JSON")),
            "yaml" | "yml" => Some((FuturisticClass::CodecKeeper, "YAML")),
            "toml" => Some((FuturisticClass::CodecKeeper, "TOML")),
            "xml" | "xsd" | "xslt" => Some((FuturisticClass::CodecKeeper, "XML")),
            "pem" | "pub" | "key" | "gpg" | "pgp" => Some((FuturisticClass::CodecKeeper, "SSH/Crypt")),

            "tf" | "tfvars" => Some((FuturisticClass::IaCArchitect, "Terraform")),
            "bicep" => Some((FuturisticClass::IaCArchitect, "Bicep")),
            "nix" => Some((FuturisticClass::IaCArchitect, "Nix")),

            "apk" | "aab" | "aar" | "smali" | "axml" => Some((FuturisticClass::MobileDeveloper, "Android")),
            "storyboard" | "xib" | "xcassets" | "xcodeproj" | "xcworkspace" => {
                Some((FuturisticClass::MobileDeveloper, "iOS Storyboard"))
            }
            "dart" | "arb" => Some((FuturisticClass::MobileDeveloper, "Flutter Dart")),
            "reality" | "scn" | "sks" => Some((FuturisticClass::MobileDeveloper, "Apple Reality")),

            "unity" | "prefab" | "asset" | "meta" | "anim" | "controller" => {
                Some((FuturisticClass::VirtualArchitect, "Unity"))
            }
            "uasset" | "umap" | "uplugin" => Some((FuturisticClass::VirtualArchitect, "Unreal")),
            "tscn" | "tres" | "gd" | "gdshader" => Some((FuturisticClass::VirtualArchitect, "Godot")),
            "gml" | "yy" | "yyp" => Some((FuturisticClass::VirtualArchitect, "GameMaker")),

            "fbx" | "gltf" | "glb" | "dae" => Some((FuturisticClass::Assets3DDesigner, "3D Model")),
            "blend" => Some((FuturisticClass::Assets3DDesigner, "Blender")),
            "step" | "stp" | "dxf" | "dwg" => Some((FuturisticClass::Assets3DDesigner, "CAD Model")),
            "stl" | "3mf" => Some((FuturisticClass::Assets3DDesigner, "3D Print")),

            "vst" | "vst3" => Some((FuturisticClass::AcousticDesigner, "VST Plugin")),
            "als" => Some((FuturisticClass::AcousticDesigner, "Ableton")),
            "csound" => Some((FuturisticClass::AcousticDesigner, "Csound")),
            "pd" => Some((FuturisticClass::AcousticDesigner, "Pure Data")),
            "scd" => Some((FuturisticClass::AcousticDesigner, "SuperCollider")),

            "v" | "sv" | "svh" => Some((FuturisticClass::FpgaEngineer, "Verilog")),
            "vhd" | "vhdl" => Some((FuturisticClass::FpgaEngineer, "VHDL")),
            "sdc" | "xdc" | "ucf" => Some((FuturisticClass::FpgaEngineer, "FPGA Constraints")),

            "kicad_pcb" | "kicad_sch" => Some((FuturisticClass::PcbLayoutEngineer, "KiCad")),
            "pcbdoc" | "schdoc" => Some((FuturisticClass::PcbLayoutEngineer, "Altium")),
            "gbr" | "gtl" | "gbl" => Some((FuturisticClass::PcbLayoutEngineer, "Gerber Layer")),
            "cir" | "asy" => Some((FuturisticClass::PcbLayoutEngineer, "SPICE Simulation")),

            "pcap" | "pcapng" => Some((FuturisticClass::RedTeamOperator, "Wireshark")),
            "nse" => Some((FuturisticClass::RedTeamOperator, "Nmap")),
            "nessus" => Some((FuturisticClass::RedTeamOperator, "Nessus")),

            "yar" | "yara" => Some((FuturisticClass::BlueTeamOperator, "YARA")),
            "rules" => Some((FuturisticClass::BlueTeamOperator, "Snort Rules")),
            "threatmodel" => Some((FuturisticClass::BlueTeamOperator, "Threat Model")),

            "feature" => Some((FuturisticClass::QaEngineer, "Gherkin Feature")),
            "robot" => Some((FuturisticClass::QaEngineer, "Robot Framework")),
            "side" | "jmx" => Some((FuturisticClass::QaEngineer, "Selenium/JMeter")),
            "lcov" | "gcov" | "coverage" => Some((FuturisticClass::QaEngineer, "Code Coverage")),

            "md" | "markdown" | "mdx" => Some((FuturisticClass::Chronicler, "Markdown")),
            "tex" | "bib" => Some((FuturisticClass::Chronicler, "LaTeX")),
            "rst" => Some((FuturisticClass::Chronicler, "reStructuredText")),
            "org" => Some((FuturisticClass::Chronicler, "OrgMode")),
            "man" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" => {
                Some((FuturisticClass::Chronicler, "Man Page"))
            }

            "desktop" => Some((FuturisticClass::DesktopConfigurator, "Linux Desktop")),
            "reg" => Some((FuturisticClass::DesktopConfigurator, "Windows Registry")),

            _ => None,
        }
    } else {
        None
    }
}

pub fn classify_dominant_class(files: &[String]) -> Option<(FuturisticClass, String)> {
    if files.is_empty() {
        return None;
    }

    let mut class_counts = HashMap::new();
    let mut suffix_counts = HashMap::new();

    for file in files {
        if let Some((class, lang_name)) = classify_file(file) {
            *class_counts.entry(class).or_insert(0) += 1;
            *suffix_counts.entry((class, lang_name.to_string())).or_insert(0) += 1;
        }
    }

    if class_counts.is_empty() {
        return None;
    }

    let dominant_class = class_counts.into_iter()
        .max_by_key(|&(_, count)| count)
        .map(|(class, _)| class)?;

    let mut best_lang = None;
    let mut max_lang_count = 0;

    for ((class, lang), count) in suffix_counts {
        if class == dominant_class && count > max_lang_count {
            max_lang_count = count;
            best_lang = Some(lang);
        }
    }

    let lang_str = best_lang.unwrap_or_else(|| {
        for file in files {
            if classify_file(file).map(|(c, _)| c) == Some(dominant_class) {
                let ext = file.split('.').next_back().unwrap_or("").trim().to_uppercase();
                if !ext.is_empty() {
                    return ext;
                }
            }
        }
        "General".to_string()
    });

    let subclass = format!("{} {}", lang_str, dominant_class.role_suffix());

    Some((dominant_class, subclass))
}
