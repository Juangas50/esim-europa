/**
 * Renders a single JSON-LD <script> block.
 * Safe: dangerouslySetInnerHTML is intentional for structured data.
 */
export default function JsonLd({ data, nonce }: { data: object; nonce?: string }) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
