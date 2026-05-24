/**
 * Renders a single JSON-LD <script> block.
 * Safe: dangerouslySetInnerHTML is intentional for structured data.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
