export default {
  path: "privacy",
  title: "Privacy Policy",
  intro: [
    `This Privacy Policy explains how {{company}} ("we," "us," "our") collects, uses, stores, shares and protects data that identifies or is associated with an individual person ("personal data") in relation to our website at {{site}}, including the services offered on it (the "Platform"), and your choices about the collection and use of your information.`,
    `By using the Platform, you agree to the practices described in this Policy. If you do not agree, please do not use the Platform.`,
  ],
  sections: [
    {
      title: "What data we collect",
      blocks: [
        { sub: "Information you provide directly" },
        {
          list: [
            `**The assessment.** Your first name, surname and email address, and your answers to the assessment questions. We save these only when you submit your name and email at the end of the assessment. We then give you a Trust ID and record the result calculated from your answers.`,
            `**Your Hyeve account.** Your full name, email address and a password, which we store only in hashed (scrambled) form. If you sign in with Google, see "Information we get from Google" below.`,
            `**Property managers.** Your phone number and the property details you enter: property name, state and local government area, rent, rental period and number of rooms.`,
            `**Messages to us.** Support requests, feedback and anything else you send us.`,
          ],
        },
        { sub: "Information collected automatically" },
        {
          list: [
            `Our servers record basic request details such as your IP address, browser type, device information, the page requested and the time, to keep the Platform secure and working.`,
            `We record which profiles you search for and when, your sign-ins and account changes, and counts of how often links to the assessment are shared.`,
            `Your browser stores small items locally, such as your login session and your place in the assessment. See our [Cookie Policy](/cookies).`,
          ],
        },
        { sub: "A note on sensitive information" },
        `We do not knowingly collect information about your race, ethnicity, religion, disability status, sexual orientation or immigration status, and the assessment is not designed to ask for it. If you voluntarily tell us such information, for example in a support message, we will only use it to respond to your request.`,
      ],
    },
    {
      title: "Legal basis for processing",
      blocks: [
        `Under the Nigeria Data Protection Act, 2023 ("NDPA") and applicable data protection principles, we process your data on these bases:`,
        {
          list: [
            `**Consent:** for collecting and processing your assessment responses, compatibility results and profile data, and for letting other Hyeve account holders look up your profile.`,
            `**Contractual necessity:** to provide the assessment and account features you have asked for.`,
            `**Legitimate interest:** for basic technical operations such as security, fraud prevention, resolving disputes and improving the service, balanced against your rights and interests.`,
          ],
        },
        `Your compatibility profile and behaviour insights are informational only. We never use them to automatically approve, reject or rank you for housing.`,
      ],
    },
    {
      title: "Information we get from Google",
      blocks: [
        `If you choose **Sign in with Google**, Google gives us your **name**, your **email address** (which Google has already verified) and a **unique Google account identifier**. We do not receive your Google password, and we do not ask for access to your Gmail, Google Drive, contacts, calendar or any other Google service.`,
        `**How we use it.** We use this information only to create your Hyeve account, to recognise you when you sign in, to connect the sign-in to an existing Hyeve account that uses the same email address, and to contact you about your account. We store it in our database with the rest of your account details.`,
        `**Who we share it with.** We do not share it with anyone except the hosting and email providers that help us run Hyeve. Hyeve account holders can see your name and email address only if they search for you and you have also taken the Hyeve assessment, as described in "Who can see your profile".`,
        `**What we never do with it.** We do not use Google user data for advertising of any kind, including targeted, personalised, retargeted or interest-based advertising. We do not sell it or transfer it to data brokers or information resellers. We do not use it to assess creditworthiness or to make lending decisions. We do not use it to develop, improve or train any artificial intelligence or machine-learning model.`,
        `**How we protect it.** It travels between your browser, Google and our servers over encrypted HTTPS connections. It is held in our database, which only authorised Hyeve staff and our service providers can reach, and access to our administration tools is limited by role and recorded in an audit log.`,
        `**How long we keep it.** We keep it for as long as your Hyeve account exists. If you delete your account, we can restore it for 30 days and then remove it permanently. Older protected backups are overwritten on a rotation of up to about 12 months. You can ask us to delete it sooner at any time by emailing {{email}}.`,
        `Hyeve's use of information received from Google APIs follows the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including its Limited Use requirements. You can stop using Google sign-in at any time by removing Hyeve in your [Google Account permissions](https://myaccount.google.com/permissions).`,
      ],
    },
    {
      title: "How we use your data",
      blocks: [
        `We use your data to:`,
        {
          list: [
            `set up and secure your account and sign you in;`,
            `provide an analysis of your assessment responses and generate your profile and compatibility results;`,
            `let Hyeve account holders look up a profile and see the insights described in "Who can see your profile", so landlords, property managers, tenants and roommates can make better rental decisions;`,
            `show you how compatible you are with a roommate you look up;`,
            `communicate with you about your account or the Platform and answer your requests;`,
            `keep the Platform secure, prevent fraud and misuse, and keep a record of administrative actions;`,
            `improve and maintain the Platform, using aggregated or anonymised analysis where possible, including benchmarks that do not identify you;`,
            `comply with our legal obligations.`,
          ],
        },
        `We do not use your data to screen or exclude applicants for housing based on health or mental health, age, family status, race, ethnicity or tribe, financial situation, religion, disability status, sexual orientation or immigration status.`,
      ],
    },
    {
      title: "Who can see your profile",
      blocks: [
        `Anyone with a Hyeve account can search for you by your **email address or Trust ID**. When they find you, they can see:`,
        {
          list: [
            `your name, email address and Trust ID;`,
            `your assessment profile and the behaviours linked to it;`,
            `an overall trust score and short insights on things like rent payment habits, property care, lifestyle and noise, and how you handle disagreements;`,
            `your roommate profile, hobbies and interests, and how compatible you are with the person looking.`,
          ],
        },
        `They do **not** see your individual assessment answers, your password, your phone number or your property details. Treat your Trust ID like a key and share it only with people you want to be able to look you up.`,
        `These insights come from an assessment. They are an indication, not a verified record of what you have done, and nobody should treat them as proof.`,
        `If you do not want to be found, email {{email}} and we will remove your result so it can no longer be looked up.`,
      ],
    },
    {
      title: "Consent",
      blocks: [
        `You give your consent when you submit your details at the end of the assessment, where the form tells you that Hyeve account holders can look you up by your email or Trust ID, and again when you create an account. You can withdraw your consent at any time by emailing {{email}}. We will then delete your result and stop it being found by others, without affecting what we did before you withdrew.`,
      ],
    },
    {
      title: "How we share your data",
      blocks: [
        `We may share personal information:`,
        {
          list: [
            `with other Hyeve users such as landlords, property managers, roommates and tenants, as described in "Who can see your profile";`,
            `with service providers that perform services on our behalf, such as hosting and infrastructure providers that run our servers and keep protected backups, an email provider that delivers your result and account emails, Google if you choose to sign in with Google and, if we introduce paid plans, payment platforms to complete an order;`,
            `when we do a business deal, or negotiate one, involving the sale or transfer of all or part of our business or assets, such as a merger, financing, acquisition or bankruptcy proceeding;`,
            `to respond to lawful requests and legal processes, and with banking partners as required by card association rules;`,
            `to protect the rights and property of Hyeve, our agents, customers and others, including enforcing our agreements, policies and terms of use;`,
            `in an emergency, to protect the safety of our employees and agents, our customers or any person;`,
            `with people who need it to do work for us;`,
            `in aggregated or anonymised form that does not identify you, for their own uses.`,
          ],
        },
        `We do not sell your personal information and we do not share it with third parties for their own advertising.`,
      ],
    },
    {
      title: "Data retention",
      blocks: [
        `We keep your information only as long as needed to provide the services on our Platform. We will keep it as necessary to comply with legal, accounting or regulatory requirements. The retention period for data available to Hyeve account holders, such as your name, email address, assessment result and profile, is up to 7 years, unless you ask us to delete it sooner or the law requires otherwise.`,
        {
          list: [
            `If you do not submit your name and email after taking the assessment, your answers are not saved.`,
            `If an account is deleted, we can restore it for 30 days and then remove it permanently.`,
            `Server logs rotate automatically and are kept for a limited time. Protected backups are rotated and can hold older copies for up to about 12 months before they are overwritten.`,
          ],
        },
        `When you delete your account or withdraw consent, we will delete or anonymise your personal data except where the law requires us to keep it. Aggregated, anonymised results used for benchmarks and research may be kept for research and product improvement.`,
      ],
    },
    {
      title: "Your rights",
      blocks: [
        `Under the NDPA and general data protection principles, you have the right to:`,
        {
          list: [
            `access the personal data we hold about you;`,
            `correct inaccurate or incomplete data;`,
            `delete your data ("right to erasure"), subject to legal retention requirements;`,
            `withdraw consent at any time, without affecting the lawfulness of processing before withdrawal;`,
            `restrict or object to certain processing, including asking us to stop your profile being found by others;`,
            `ask for your data in a portable format;`,
            `complain to the Nigeria Data Protection Commission (NDPC), or your local data protection authority, if you believe your rights have been violated.`,
          ],
        },
        `We respond to all requests in line with applicable data protection laws. To use any of these rights, email {{email}} from the address linked to your assessment or account and include your Trust ID if you have one. We may need to confirm it is really you before we act.`,
      ],
    },
    {
      title: "Third-party applications, websites and services",
      blocks: [
        `We are not responsible for the practices of any applications, websites or services linked to or from our Platform, including the information or content in them. When you use a link to go from our Platform to another application, website or service, this Privacy Policy does not apply to it. Your browsing and interaction on any third-party application, website or service are subject to that third party's rules and policies. We also do not control any third party you authorise to access your account. If you allow a third-party app, website or service to access your account, you do so at your own risk.`,
      ],
    },
    {
      title: "Data security",
      blocks: [
        `We use reasonable technical and organisational measures to protect your personal data against loss, misuse, unauthorised access, disclosure, alteration and destruction. Passwords are stored hashed, sessions expire, sign-in attempts are limited, and access to administration tools is restricted by role with a record of what each administrator does. No security measure is impenetrable, so we ask you to help: you are responsible for keeping your password and account information secret and for controlling access to the emails between you and us. We are not responsible for any other organisation's functionality, privacy or security measures. If we learn of a breach that puts your information at risk, we will tell you and the regulator as the law requires.`,
      ],
    },
    {
      title: "Cookies and similar technologies",
      blocks: [
        `We use your browser's local storage to keep you signed in and to remember your place in the assessment. We do not currently use advertising or analytics cookies. See our [Cookie Policy](/cookies) for details.`,
      ],
    },
    {
      title: "Children's privacy",
      blocks: [
        `The Platform is for people aged 18 and over. We do not knowingly collect personal data from anyone under 18. If we learn that we have collected personal data from a person under 18, we will delete it promptly. If you think a child has used Hyeve, please contact us.`,
      ],
    },
    {
      title: "International data transfers",
      blocks: [
        `We may transfer personal information to countries other than the country in which it was collected. These countries may not have the same data protection laws as the country in which you gave us the information. When we transfer your personal information to other countries, we will make sure appropriate safeguards are in place consistent with NDPA requirements, such as standard contractual clauses or equivalent protections.`,
      ],
    },
    {
      title: "Changes to this policy",
      blocks: [
        `We may update this Policy from time to time. We will tell you about material changes by email or by updating the "Last updated" date above. Continued use of the Platform after changes take effect means you accept the updated Policy.`,
      ],
    },
    {
      title: "Contact us",
      blocks: [
        `If you have questions, concerns or requests about this Policy, please contact us:`,
        `{{company}}, {{address}}`,
        `{{email}}`,
      ],
    },
  ],
};
