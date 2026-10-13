import { Link } from "react-router-dom";
import { LEGAL } from "../../config/company.js";
import PolicyLayout, { Section } from "./PolicyLayout.jsx";

const TOKENS = { company: LEGAL.name, site: LEGAL.site, address: LEGAL.address };
const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\{\{[a-z]+\}\})/g;

function renderInline(text) {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("{{")) {
        const key = part.slice(2, -2);
        if (key === "email") {
          return (
            <a key={index} href={`mailto:${LEGAL.email}`}>
              {LEGAL.email}
            </a>
          );
        }
        return TOKENS[key] || "";
      }
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const [, label, target] = link;
        if (target.startsWith("/")) {
          return (
            <Link key={index} to={target}>
              {label}
            </Link>
          );
        }
        return (
          <a key={index} href={target} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        );
      }
      return part;
    });
}

function renderBlock(block, index) {
  if (typeof block === "string") return <p key={index}>{renderInline(block)}</p>;
  if (block.sub) return <h3 key={index}>{block.sub}</h3>;
  return (
    <ul key={index}>
      {block.list.map((item, itemIndex) => (
        <li key={itemIndex}>{renderInline(item)}</li>
      ))}
    </ul>
  );
}

export default function PolicyPage({ policy }) {
  return (
    <PolicyLayout title={policy.title}>
      {policy.intro.map((paragraph, index) => (
        <p key={index} className="hv-policy-intro">
          {renderInline(paragraph)}
        </p>
      ))}
      {policy.sections.map((section, index) => (
        <Section key={section.title} title={`${index + 1}. ${section.title}`}>
          {section.blocks.map(renderBlock)}
        </Section>
      ))}
    </PolicyLayout>
  );
}
