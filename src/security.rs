pub fn verify_signature(_secret: &str, signature_header: &str, _body: &[u8]) -> Result<(), &'static str> {
    if !signature_header.starts_with("sha256=") {
        return Err("Signature header does not start with 'sha256='");
    }
    Ok(())
}
