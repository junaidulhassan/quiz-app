export default {
  path: "cookies",
  title: "Cookie Policy",
  intro: [
    `This Cookie Policy explains how {{company}} ("we," "us," "our") uses cookies and similar technologies when you visit or use the Platform at {{site}}. It should be read together with our [Privacy Policy](/privacy).`,
  ],
  sections: [
    {
      title: "What are cookies",
      blocks: [
        `Cookies are small text files placed on your device when you visit a website. They help a website work properly, remember your preferences and understand how it is used. "Similar technologies" include local storage, which lets a website keep small pieces of information in your browser.`,
      ],
    },
    {
      title: "What we use",
      blocks: [
        `We use only what the Platform needs to work. These are strictly necessary and cannot be switched off without affecting basic functionality:`,
        {
          list: [
            `**Keeping you signed in.** A session token in your browser's local storage keeps you logged in to your Hyeve account or admin area until the session ends or you log out.`,
            `**Remembering your place.** Your progress through the assessment and your results are kept in your browser so you can pick up where you left off.`,
            `**Signing up.** When you go from your result to create an account, your name and email are held in your browser for that one step, to fill in the form for you.`,
          ],
        },
      ],
    },
    {
      title: "Analytics and advertising",
      blocks: [
        `We do not currently use analytics or advertising cookies, and we do not use cookies to show you advertisements. If we add them in future, we will update this policy first and ask for your consent where the law requires it.`,
      ],
    },
    {
      title: "Third-party services",
      blocks: [
        `If you choose Sign in with Google, Google loads its own sign-in button on our login and sign-up pages. Google may set its own cookies when it does. These are governed by Google's privacy policy, not ours.`,
      ],
    },
    {
      title: "Managing cookies and storage",
      blocks: [
        `You can control or delete cookies and local storage through your browser settings. Blocking the strictly necessary items will stop you from staying signed in and may stop parts of the Platform from working.`,
      ],
    },
    {
      title: "Changes to this policy",
      blocks: [
        `We may update this policy to reflect changes in what we use or for legal or regulatory reasons. We will update the "Last updated" date above when we do.`,
      ],
    },
    {
      title: "Contact us",
      blocks: [`Questions about this Cookie Policy can be sent to {{email}}.`],
    },
  ],
};
