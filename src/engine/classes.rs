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
