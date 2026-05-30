pub fn generate_badge_svg(level: u32, class_name: &str) -> String {
    let left_text = "Repogee";
    let right_text = format!("Lvl {} {}", level, class_name);
    
    let left_width = calculate_text_width(left_text) + 10;
    let right_width = calculate_text_width(&right_text) + 10;
    let total_width = left_width + right_width;
    
    format!(
        r##"<svg xmlns="http://www.w3.org/2000/svg" width="{}" height="20">
  <linearGradient id="smooth" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="round">
    <rect width="{}" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#round)">
    <rect width="{}" height="20" fill="#555"/>
    <rect x="{}" width="{}" height="20" fill="#007ec6"/>
    <rect width="{}" height="20" fill="url(#smooth)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="{}" y="15" fill="#010101" fill-opacity=".3">{}</text>
    <text x="{}" y="14">{}</text>
    <text x="{}" y="15" fill="#010101" fill-opacity=".3">{}</text>
    <text x="{}" y="14">{}</text>
  </g>
</svg>"##,
        total_width,
        total_width,
        left_width,
        left_width,
        right_width,
        total_width,
        left_width / 2,
        left_text,
        left_width / 2,
        left_text,
        left_width + right_width / 2,
        right_text,
        left_width + right_width / 2,
        right_text
    )
}

fn calculate_text_width(text: &str) -> u32 {
    let mut width = 0;
    for c in text.chars() {
        width += if c.is_uppercase() { 7 } else { 6 };
    }
    width
}
