import { Link } from "react-router-dom";
import { LEGAL } from "../../config/company.js";
import PolicyLayout, { Section } from "./PolicyLayout.jsx";

export default function DataPolicy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      intro={`This policy explains what personal information ${LEGAL.name} collects, where it comes from, how it is used and shared, and the choices you have. It applies to the Hyeve assessment at ${LEGAL.site} and to Hyeve accounts used to look up tenants and roommates.`}
    >
      <Section title="1. Who we are">
        <p>
          {LEGAL.name} owns and runs the Hyeve platform from {LEGAL.address}. {LEGAL.name} decides how and why your personal
          information is used, which makes it the data controller. You can reach us at{" "}
          <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
        </p>
      </Section>

      <Section title="2. What we collect and where it comes from">
        <p>Almost everything we hold comes directly from you.</p>
        <ul>
          <li>
            <strong>The assessment.</strong> Your first name, surname, email address, your answers to the assessment questions, and
            the result calculated from them (your archetype and trait levels). We give each result a Trust ID and record when it was
            submitted.
          </li>
          <li>
            <strong>Your Hyeve account.</strong> Your name, email address and a password, which we store only in scrambled (hashed)
            form. If you sign in with Google, Google tells us your name and verified email address. We never see your Google password.
          </li>
          <li>
            <strong>Property managers.</strong> Your phone number and the property details you enter: property name, state and local
            government area, rent, rental period and number of rooms.
          </li>
          <li>
            <strong>Using Hyeve.</strong> The profiles you search for and when, your sign-ins and account changes, and counts of how
            often links to the assessment are shared.
          </li>
          <li>
            <strong>Technical data.</strong> Our servers record basic request details such as your IP address, the page requested and
            the time, to keep the service secure and working. Your browser also stores small items locally, such as your login session
            and quiz progress.
          </li>
        </ul>
      </Section>

      <Section title="3. Information we get from Google">
        <p>
          If you choose <strong>Sign in with Google</strong>, Google gives us your <strong>name</strong>, your{" "}
          <strong>email address</strong> (which Google has already verified) and a <strong>unique Google account identifier</strong>.
          We do not receive your Google password, and we do not ask for access to your Gmail, Google Drive, contacts, calendar or any
          other Google service.
        </p>
        <p>
          We use this information only to create your Hyeve account, to recognise you when you sign in, to connect the sign-in to an
          existing Hyeve account that uses the same email address, and to contact you about your account. We store it in our database
          with the rest of your account details. We do not sell it, we do not use it for advertising, and we do not share it with
          anyone except the hosting and email providers that help us run Hyeve (see section 7).
        </p>
        <p>
          Hyeve's use of information received from Google APIs follows the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including its Limited Use requirements.
        </p>
        <p>
          You can stop using Google sign-in at any time by removing Hyeve in your{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
            Google Account permissions
          </a>
          , and you can ask us to delete your Hyeve account and the Google details we hold, as described in section 10.
        </p>
      </Section>

      <Section title="4. How we use your information">
        <ul>
          <li>To calculate and show your assessment result, and to email you a copy.</li>
          <li>To create and secure your account and to sign you in.</li>
          <li>
            To let Hyeve account holders look up a profile and see the insights described in section 5, so landlords, property
            managers, tenants and roommates can make better rental decisions.
          </li>
          <li>To prevent fraud, abuse and misuse, and to keep a record of administrative actions.</li>
          <li>To answer your requests, fix problems and improve the service.</li>
        </ul>
        <p>
          We do not sell your personal information and we do not use it for advertising. Your insights are produced by fixed rules
          applied to your own answers, not guessed by a person or by artificial intelligence.
        </p>
      </Section>

      <Section title="5. Who can see your profile">
        <p>
          This is the most important thing to know about Hyeve. Anyone with a Hyeve account can search for you by your{" "}
          <strong>email address or Trust ID</strong>. When they find you, they can see:
        </p>
        <ul>
          <li>your name, email address and Trust ID;</li>
          <li>your archetype and the personality-based behaviours linked to it;</li>
          <li>
            an overall trust score and short insights on things like rent payment habits, property care, lifestyle and noise, and
            how you handle disagreements;
          </li>
          <li>your roommate profile, hobbies and interests, and how compatible you are with the person looking.</li>
        </ul>
        <p>
          They do <strong>not</strong> see your individual quiz answers, your password, your phone number or your property details.
          Treat your Trust ID like a key. Share it only with people you want to be able to look you up.
        </p>
        <p>
          These insights come from a personality questionnaire. They are an indication, not a verified record of what you have done,
          and nobody should treat them as proof.
        </p>
      </Section>

      <Section title="6. Our legal basis">
        <p>
          Under the Nigeria Data Protection Act 2023, we rely on your consent when you take the assessment and create an account, on
          the need to provide the service you asked for, and on our legitimate interests in keeping Hyeve safe and working. You can
          withdraw your consent at any time as described in section 10.
        </p>
      </Section>

      <Section title="7. Who we share it with">
        <p>We share personal information only with the people and services that help us run Hyeve:</p>
        <ul>
          <li>Hyeve account holders, as described in section 5.</li>
          <li>Hosting and infrastructure providers that run our servers and keep protected backups.</li>
          <li>An email service provider that delivers your result and account emails.</li>
          <li>Google, if you choose to sign in with Google.</li>
          <li>The authorities, where the law requires it or to protect people from harm.</li>
        </ul>
        <p>
          Some of these providers may store data on servers outside Nigeria. When that happens we expect them to protect it to a
          standard consistent with Nigerian law.
        </p>
      </Section>

      <Section title="8. How long we keep it">
        <ul>
          <li>Assessment results and accounts stay until you ask us to delete them.</li>
          <li>Your recent searches are shown to you for 14 days.</li>
          <li>If an account is deleted, we can restore it for 30 days, after which it can be removed permanently.</li>
          <li>Server logs rotate automatically and are kept for a limited time.</li>
          <li>Backups are rotated and can hold older copies for up to about 12 months before they are overwritten.</li>
        </ul>
      </Section>

      <Section title="9. How we protect it">
        <p>
          Passwords are stored hashed, sessions expire, sign-in attempts are limited, and access to administration tools is restricted
          by role with a record of what each administrator does. No online service can promise perfect security. If we learn of a
          breach that puts your information at risk, we will tell you and the regulator as the law requires.
        </p>
      </Section>

      <Section title="10. Your rights">
        <p>You can ask us to:</p>
        <ul>
          <li>tell you what we hold about you and give you a copy;</li>
          <li>correct information that is wrong;</li>
          <li>delete your information, or restrict how we use it;</li>
          <li>stop using your information for something you object to;</li>
          <li>withdraw consent you gave us, which will not affect what we did before you withdrew it.</li>
        </ul>
        <p>
          Email <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> from the address linked to your assessment or account, and include
          your Trust ID if you have one. We may need to confirm it is really you before we act. If you are unhappy with how we handle
          your information, you can complain to the Nigeria Data Protection Commission.
        </p>
      </Section>

      <Section title="11. Children">
        <p>
          Hyeve is for people aged 18 and over. We do not knowingly collect information from anyone younger. If you think a child has
          used Hyeve, please contact us and we will remove their information.
        </p>
      </Section>

      <Section title="12. Cookies and similar storage">
        <p>
          We use your browser's local storage to keep you signed in and to remember your place in the quiz. We do not use advertising
          or tracking cookies. If you use Google sign-in, Google loads its own sign-in button, which is governed by Google's privacy
          policy.
        </p>
      </Section>

      <Section title="13. Changes to this policy">
        <p>
          We may update this policy as Hyeve changes. The date at the top shows the latest version, and we will make a clear notice if a
          change significantly affects you.
        </p>
      </Section>

      <Section title="14. Contact us">
        <p>
          {LEGAL.name}, {LEGAL.address}
          <br />
          <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </p>
        <p>
          Please also read our <Link to="/terms">Terms of Service</Link>.
        </p>
      </Section>
    </PolicyLayout>
  );
}
