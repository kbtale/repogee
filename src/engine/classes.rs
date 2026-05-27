use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum FuturisticClass {
    GridInfiltrator,
    NexusArchitect,
    QuantumArchivist,
    ProtocolSentinel,
    HoloSculptor,
    VoidEngineer,
    DataScribe,
    SyntaxPurifier,
}

impl FuturisticClass {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::GridInfiltrator => "Grid Infiltrator",
            Self::NexusArchitect => "Nexus Architect",
            Self::QuantumArchivist => "Quantum Archivist",
            Self::ProtocolSentinel => "Protocol Sentinel",
            Self::HoloSculptor => "Holo-Sculptor",
            Self::VoidEngineer => "Void Engineer",
            Self::DataScribe => "Data Scribe",
            Self::SyntaxPurifier => "Syntax Purifier",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.trim() {
            "Grid Infiltrator" => Some(Self::GridInfiltrator),
            "Nexus Architect" => Some(Self::NexusArchitect),
            "Quantum Archivist" => Some(Self::QuantumArchivist),
            "Protocol Sentinel" => Some(Self::ProtocolSentinel),
            "Holo-Sculptor" => Some(Self::HoloSculptor),
            "Void Engineer" => Some(Self::VoidEngineer),
            "Data Scribe" => Some(Self::DataScribe),
            "Syntax Purifier" => Some(Self::SyntaxPurifier),
            _ => None,
        }
    }
}

impl std::fmt::Display for FuturisticClass {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

pub fn classify_file(path: &str) -> Option<FuturisticClass> {
    let lower_path = path.to_lowercase();
    
    // Cross-platform path handling
    let path_buf = std::path::Path::new(&lower_path);
    let filename = path_buf.file_name()
        .and_then(|f| f.to_str())
        .unwrap_or(&lower_path);

    if filename.contains(".prettierrc") || filename.contains(".eslintrc") || filename == "prettier.config.js" || filename == "eslint.config.js" {
        return Some(FuturisticClass::SyntaxPurifier);
    }

    // Void Engineer (DevOps & Infrastructure) rules
    let is_workflow = lower_path.contains(".github/workflows") || lower_path.contains(".github\\workflows");
    if is_workflow 
        || filename == "dockerfile" 
        || filename.starts_with("dockerfile.") 
        || filename.ends_with(".dockerfile")
        || filename == "makefile"
        || filename == "vagrantfile"
        || filename == "jenkinsfile"
        || filename.starts_with("docker-compose.")
    {
        return Some(FuturisticClass::VoidEngineer);
    }

    if let Some(ext) = filename.split('.').next_back() {

        match ext {
            "py" | "sh" | "bash" | "zsh" => Some(FuturisticClass::GridInfiltrator),
            "rs" | "go" | "java" | "php" | "c" | "cpp" | "h" | "hpp" | "cs" | "swift" | "kt" => Some(FuturisticClass::NexusArchitect),
            "sql" | "db" | "sqlite" | "prisma" => Some(FuturisticClass::QuantumArchivist),
            "json" | "yaml" | "xml" | "toml" | "graphql" | "proto" => Some(FuturisticClass::ProtocolSentinel),
            "html" | "css" | "js" | "ts" | "jsx" | "tsx" | "vue" | "svelte" => Some(FuturisticClass::HoloSculptor),
            "yml" => Some(FuturisticClass::VoidEngineer),
            "md" | "txt" | "rst" | "adoc" => Some(FuturisticClass::DataScribe),
            _ => None,
        }
    } else {
        None
    }
}


pub fn classify_dominant_class(files: &[String]) -> Option<FuturisticClass> {
    if files.is_empty() {
        return None;
    }

    let mut counts = HashMap::new();
    for file in files {
        if let Some(class) = classify_file(file) {
            *counts.entry(class).or_insert(0) += 1;
        }
    }

    counts.into_iter()
        .max_by_key(|&(_, count)| count)
        .map(|(class, _)| class)
}
