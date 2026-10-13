import { Link } from "react-router-dom";
import { LEGAL } from "../../config/company.js";
import PolicyLayout, { Section } from "./PolicyLayout.jsx";

export default function ServiceTerms() {
  return (
    <PolicyLayout
      title="Terms of Service"
      intro={`These terms are the agreement between you and ${LEGAL.name} for using the Hyeve assessment and Hyeve accounts. By taking the assessment, creating an account or using Hyeve, you agree to them and to our Privacy Policy.`}
    >
      <Section title="1. About Hyeve">
        <p>
          Hyeve is an assessment and insights platform for renting. People take an assessment, and Hyeve account holders such as
          landlords, property managers, tenants and roommates can look up results to understand rental habits and compatibility.
          {" "}{LEGAL.name} owns and operates Hyeve from {LEGAL.address}.
        </p>
      </Section>

      <Section title="2. Who can use it">
        <p>
          You must be at least 18 and able to enter a binding agreement. If you use Hyeve for an organisation, you confirm you are
          allowed to act for it.
        </p>
      </Section>

      <Section title="3. Your account">
        <ul>
          <li>Give accurate information and keep it up to date.</li>
          <li>Keep your password and Trust ID safe. You are responsible for what happens under your account.</li>
          <li>Do not let someone else use your account, and tell us straight away if you think it has been misused.</li>
          <li>You choose a role when you sign up. Property managers must give true property details.</li>
        </ul>
      </Section>

      <Section title="4. The assessment and what the insights mean">
        <ul>
          <li>Answer the assessment honestly and for yourself. The result only means something if the answers are your own.</li>
          <li>
            Results and insights are produced from your answers by fixed rules. They are a personality-based indication, not a credit
            check, background check, reference or verified record of anything you have done.
          </li>
          <li>They can be wrong or out of date. Do not treat them as proof, and do not rely on them as legal or financial advice.</li>
          <li>You decide whether to rent to, or share with, anyone. Hyeve does not make that decision for you.</li>
        </ul>
      </Section>

      <Section title="5. Looking up other people">
        <p>
          When you search for someone, you are using information they gave Hyeve so that others can understand them better. You agree
          to:
        </p>
        <ul>
          <li>search only for a genuine rental or roommate purpose;</li>
          <li>
            never use Hyeve insights to unfairly exclude or treat someone worse because of disability, health, age, family status,
            ethnicity, religion, gender or financial situation;
          </li>
          <li>keep what you see private and not share, publish or sell it;</li>
          <li>not harass, threaten or pressure anyone you find;</li>
          <li>follow the Nigeria Data Protection Act and any other law that applies to how you use personal information.</li>
        </ul>
      </Section>

      <Section title="6. What you must not do">
        <ul>
          <li>Break the law or help someone else to.</li>
          <li>Search in bulk, scrape or copy Hyeve data, or build a competing service from it.</li>
          <li>Try to get into accounts, systems or data that are not yours, or disrupt the service.</li>
          <li>Pretend to be someone else or enter another person's details without their permission.</li>
          <li>Reverse engineer or copy how Hyeve works.</li>
        </ul>
      </Section>

      <Section title="7. Ownership">
        <p>
          Hyeve, including its software, design, content, questions, archetypes, scoring and matching methods and brand, belongs to{" "}
          {LEGAL.name}. We give you a limited, personal, non-transferable right to use Hyeve as these terms allow. You keep
          ownership of the information you give us, and you allow us to use it to run Hyeve as our Privacy Policy describes.
        </p>
      </Section>

      <Section title="8. Fees">
        <p>
          Using the assessment is free. Some lookup features may later be offered on paid plans priced in naira. We will show the price
          before you pay, and we will not charge you for anything you have not agreed to.
        </p>
      </Section>

      <Section title="9. Suspending or ending access">
        <p>
          We may suspend or close an account that breaks these terms, puts others at risk or is used to misuse Hyeve. You can stop
          using Hyeve at any time and ask us to delete your account and result as set out in the Privacy Policy.
        </p>
      </Section>

      <Section title="10. Third-party services">
        <p>
          Hyeve relies on services from others, such as Google sign-in and email delivery. We are not responsible for their
          availability or their own terms.
        </p>
      </Section>

      <Section title="11. Our responsibility">
        <p>
          We work to keep Hyeve accurate and available, but we provide it "as is". We do not promise it will always be uninterrupted or
          free from errors. To the fullest extent the law allows, {LEGAL.name} is not liable for losses that come from decisions you
          or others make using Hyeve insights, or for indirect or consequential losses. Nothing in these terms removes any right you
          have that the law does not let us remove.
        </p>
      </Section>

      <Section title="12. Changes">
        <p>
          We may update these terms. The date at the top shows the latest version. If you keep using Hyeve after a change, you accept the
          new terms.
        </p>
      </Section>

      <Section title="13. Governing law">
        <p>
          These terms are governed by the laws of the Federal Republic of Nigeria. We will first try to resolve any dispute with you in
          good faith. If we cannot, either of us may take it to the competent courts in Nigeria.
        </p>
      </Section>

      <Section title="14. Contact">
        <p>
          {LEGAL.name}, {LEGAL.address}
          <br />
          <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </p>
        <p>
          See also our <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </Section>
    </PolicyLayout>
  );
}
