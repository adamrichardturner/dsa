import type { Metadata } from "next";
import {
  LegalCode,
  LegalLink,
  LegalList,
  LegalPage,
  LegalSection,
  LegalSubheading,
} from "@/components/legal-page";
import { contactEmail, creatorName, legalUpdated, siteName, siteUrl, socialImage } from "@/lib/site";

const description = `How ${siteName} handles personal data. The course is free. We do not sell personal data or use it for advertising.`;

export const metadata: Metadata = {
  title: "Privacy",
  description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy",
    description,
    url: "/privacy",
    images: [socialImage],
  },
};

const contents = [
  { id: "who", label: "Who is responsible" },
  { id: "free", label: "Free, and what that means" },
  { id: "laws", label: "Which laws apply" },
  { id: "data", label: "What we hold" },
  { id: "why", label: "Why we use it" },
  { id: "runner", label: "The code you submit" },
  { id: "storage", label: "Storage on your device" },
  { id: "sharing", label: "Who else handles it" },
  { id: "transfers", label: "Where the data is" },
  { id: "retention", label: "How long we keep it" },
  { id: "security", label: "How we protect it" },
  { id: "europe", label: "Rights in the UK and Europe" },
  { id: "united-states", label: "Rights in the United States" },
  { id: "elsewhere", label: "Other countries" },
  { id: "age", label: "Age" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact and complaints" },
] as const;

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker={siteName}
      title="Privacy policy"
      updated={legalUpdated}
      lede={
        <>
          <p>
            This policy explains what personal data {siteName} uses, and why. The course at{" "}
            <LegalLink href={siteUrl}>{siteUrl.replace("https://", "")}</LegalLink> is free. We do
            not take a payment card, sell personal data, or use it for advertising.
          </p>
          <p>
            The same promises are in the <LegalLink href="/terms">Terms</LegalLink>.
          </p>
        </>
      }
      contents={contents}
    >
      <LegalSection id="who" title="Who is responsible">
        <p>
          {creatorName} created {siteName} and is the controller of your personal data. He is a
          private individual, not a company or an organisation. He decides why an account exists
          and what data is needed to run the course.
        </p>
        <p>
          Email{" "}
          <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink> for any privacy
          request. You do not need a special form. If you need a postal address for a formal
          notice, ask and he will provide one.
        </p>
        <p>
          If the law requires a representative in the United Kingdom or the European Economic
          Area, we will publish their name and contact details on this page. You can use your
          rights by writing to us directly.
        </p>
      </LegalSection>

      <LegalSection id="free" title="Free, and what that means for your data">
        <p>
          The lessons, the editor, the tests, and saved progress are free. Creating an account
          does not start a trial or a subscription, and we do not ask for a card.
        </p>
        <p>
          We do not sell personal data, rent a marketing list, or show ads. We do not send a
          newsletter. There is no paid tier holding a lesson back.
        </p>
      </LegalSection>

      <LegalSection id="laws" title="Which laws apply">
        <p>
          We offer the course internationally. The rights below follow the law that applies to
          you. Where more than one law applies, we follow the one that gives you the stronger
          protection on that point.
        </p>
        <LegalSubheading>United Kingdom</LegalSubheading>
        <p>
          The UK GDPR and the Data Protection Act 2018 apply if you are in the United Kingdom.
          The Information Commissioner&apos;s Office is the supervisory authority. We do not
          process special-category data, such as health, religion, or biometrics used to identify
          you, and we do not process criminal-offence data. Part 3 of the Data Protection Act
          2018, which covers law enforcement processing, does not apply to this course.
        </p>
        <LegalSubheading>European Economic Area</LegalSubheading>
        <p>
          The EU General Data Protection Regulation (Regulation (EU) 2016/679) applies when we
          offer the course to you in the EEA. You can complain to the supervisory authority where
          you live, where you work, or where you believe a problem happened.
        </p>
        <LegalSubheading>Switzerland</LegalSubheading>
        <p>
          The Federal Act on Data Protection applies. The access, correction, deletion, and
          complaint rights in the UK and Europe section are how you use it with us.
        </p>
        <LegalSubheading>Messages and storage on your device</LegalSubheading>
        <p>
          The UK Privacy and Electronic Communications Regulations 2003, and the EU ePrivacy
          rules, cover cookies and similar storage. The section on your browser says what we
          store. We do not send marketing email, so there is no mailing list to opt out of.
          Creating an account, resetting a password, and changing a password each send one
          message about that account.
        </p>
        <LegalSubheading>United States and other countries</LegalSubheading>
        <p>
          California&apos;s Consumer Privacy Act, as amended by the CPRA, and the similar laws in
          other US states, are in the United States section. Canada&apos;s PIPEDA, Australia&apos;s
          Privacy Act, and Brazil&apos;s LGPD are in the other countries section. The age line
          covers the US Children&apos;s Online Privacy Protection Act, which protects children
          under 13, and the higher digital-consent ages used in parts of Europe.
        </p>
      </LegalSection>

      <LegalSection id="data" title="What we hold">
        <p>
          We collect the data needed to run an account and the course. We do not buy data about
          you.
        </p>
        <LegalSubheading>Account</LegalSubheading>
        <p>
          Name, email address, and the time the account was created. If you set a password, we
          store a scrypt hash and a salt. We do not store the password itself. A password reset
          stores a SHA-256 hash of a one-hour link. You can save a picture link. We store the
          link. We do not analyse the picture.
        </p>
        <LegalSubheading>Google or GitHub</LegalSubheading>
        <p>
          If you use one of those buttons, we receive the provider&apos;s user id, your name, a
          verified email address, and a picture link when the provider sends one. Google is asked
          for the openid, email, and profile scopes. GitHub is asked for read:user and user:email.
          An email the provider has not verified is not used to create or link an account. The
          provider&apos;s user id stays on the account, so a later change of email still signs you
          into the same account.
        </p>
        <LegalSubheading>Course work</LegalSubheading>
        <p>
          Each submission stores the code, whether it passed, how many tests passed, the total,
          the feedback, the per-test results, and the time. The progress page is calculated from
          those submissions: lessons completed, pass rate, topics, and a
          short note on what to practise next. That note is for you. It is not a profile we sell,
          and it is not used to decide anything outside the course.
        </p>
        <LegalSubheading>Session</LegalSubheading>
        <p>
          A signed-in browser holds a random token. We store a SHA-256 hash of that token, with
          an expiry 30 days ahead. Signing out deletes that session on the server and removes the
          token from the browser.
        </p>
        <LegalSubheading>Connection data</LegalSubheading>
        <p>
          Vercel, which hosts the website, and the server that hosts the API and the database, may
          record an IP address, a browser type, and the time of a request in ordinary host logs.
          We use those logs to deliver the site and to look into abuse. We do not add them to your
          account, and we do not run a separate analytics product.
        </p>
      </LegalSection>

      <LegalSection id="why" title="Why we use it">
        <p>Each use has a basis in the UK GDPR and the EU GDPR.</p>
        <LegalSubheading>Running the course</LegalSubheading>
        <p>
          Account details, sessions, and submissions are used to provide the lessons, the editor,
          the tests, and the progress page. The basis is contract, Article 6(1)(b). You
          ask for an account, and this is the data needed to provide it.
        </p>
        <LegalSubheading>Google or GitHub sign-in</LegalSubheading>
        <p>
          When you use that button, we use the profile fields the provider sends so we can open
          or link your account. The basis is the same contract, limited to that sign-in.
        </p>
        <LegalSubheading>Security and abuse</LegalSubheading>
        <p>
          We use the account, the submission, and short-lived host logs to keep the service up,
          protect accounts, and stop misuse of the code runner. The basis is legitimate interests,
          Article 6(1)(f). The interest is a free course that stays available for the people using
          it. You can object. We will stop unless we have a compelling reason to continue, such as
          investigating abuse of the service.
        </p>
        <LegalSubheading>Legal duties</LegalSubheading>
        <p>
          We use the data a duty requires when we answer a privacy right, keep a record the law
          tells us to keep, or send a breach notice. The basis is legal obligation, Article
          6(1)(c).
        </p>
        <p>
          We do not use your data for advertising. We do not use consent as a substitute for the
          contract that runs the course. If we ever wanted a new use that the law treats as
          optional, we would ask first, and refusing would leave the course in place.
        </p>
      </LegalSection>

      <LegalSection id="runner" title="The code you submit">
        <p>
          Submitting an exercise runs your code on our server so the tests can mark it. The runner
          allows a short time for each run and does not load outside packages. It is a teaching
          tool. It is not a private computer, and it is not a safe place for secrets.
        </p>
        <p>
          Do not put passwords, keys, or another person&apos;s personal data in a solution. We
          store the code so you can come back to it. We do not publish it, and we do not offer it
          as training data. Public pages of the site can be crawled. Your account, your email, and
          your solutions are not public pages.
        </p>
      </LegalSection>

      <LegalSection id="storage" title="Storage on your device">
        <p>
          We do not set advertising cookies, and we do not use a third-party analytics cookie. The
          browser&apos;s local storage holds:
        </p>
        <LegalList>
          <li>
            <LegalCode>kiln.token</LegalCode>, the session token, so the course can load your
            account
          </li>
          <li>
            <LegalCode>kiln.user</LegalCode>, a copy of your name, email, picture link, whether a
            password is set, and which providers are linked, so the page can show you
          </li>
          <li>
            <LegalCode>dsa.theme</LegalCode>, light or dark
          </li>
          <li>
            <LegalCode>dsa.editor-theme</LegalCode>, the editor colours
          </li>
          <li>
            <LegalCode>dsa.split</LegalCode>, whether the desk is split vertically or horizontally
          </li>
        </LegalList>
        <p>
          The theme, editor theme, and split stay on the device. Our servers do not receive them.
          The session token is stored because you asked to stay signed in. Under the UK Privacy
          and Electronic Communications Regulations and the ePrivacy rules, that storage is
          strictly necessary for the service you asked for, or it is a display preference that
          never leaves your browser. We do not show a consent banner for it.
        </p>
        <p>
          If we add optional measurement, we will describe it here and ask where the law requires
          a choice, before it starts.
        </p>
        <p>
          You can clear local storage in the browser. Clearing <LegalCode>kiln.token</LegalCode>{" "}
          signs you out on that browser. Clearing the display keys resets the theme, the editor
          theme, and the split.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="Who else handles it">
        <p>
          We do not sell personal data. We do not share it for advertising. We do not give it to a
          data broker.
        </p>
        <LegalSubheading>Hosting</LegalSubheading>
        <p>
          Vercel hosts the website and processes connection data, and the pages you request, to
          deliver the site. The API and the database run on a server we operate. The
          infrastructure provider for that server stores accounts, sessions, and submissions.
          Those hosts act as our processors. Resend sends the account and password messages. It
          receives the address, the name, and the content of that message.
        </p>
        <LegalSubheading>The data processing terms</LegalSubheading>
        <p>
          Article 28 of the UK GDPR and the EU GDPR requires a contract with each processor. That
          contract tells the processor to follow our instructions, keep the data confidential, use
          people who are bound to confidentiality, help us with rights requests and security
          incidents, delete or return the data when the service ends, and allow the work to be
          reviewed. We use hosts on those terms. That contract is the data processing agreement
          for this course.
        </p>
        <p>
          {creatorName} is the controller of learner accounts. He does not process personal data
          as a school&apos;s, an employer&apos;s, or another organisation&apos;s processor. An
          account belongs to the person who creates it.
        </p>
        <LegalSubheading>Google and GitHub</LegalSubheading>
        <p>
          If you use their sign-in, Google and GitHub are separate controllers for their own
          services. Their notices describe what they do before they send us a profile:{" "}
          <LegalLink href="https://policies.google.com/privacy">Google&apos;s privacy policy</LegalLink>{" "}
          and{" "}
          <LegalLink href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
            GitHub&apos;s privacy statement
          </LegalLink>
          . We receive the fields listed above. A picture link is loaded by your browser from the
          site that hosts the picture, and that site sees the request.
        </p>
        <LegalSubheading>The law</LegalSubheading>
        <p>
          We disclose data if the law requires it, or to establish or defend a legal claim. Where
          the law allows us to say so first, we will.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="Where the data is">
        <p>
          You may be in a different country from the servers. Vercel processes website traffic in
          the United States and in other countries it publishes. The API and the database run on a
          server we operate, which may be outside the United Kingdom and the European Economic
          Area.
        </p>
        <p>
          When personal data moves from the UK or the EEA to a country without an adequacy
          decision, we use a transfer tool the law recognises. For the EEA that is the European
          Commission&apos;s Standard Contractual Clauses. For the UK that is the International Data
          Transfer Agreement, or the UK Addendum to the Standard Contractual Clauses. We use hosts
          whose contracts include those terms. Where a transfer needs supplementary measures, we
          rely on the ones the contract and the law require, including encryption in transit.
        </p>
        <p>You can ask which country your account is stored in, and which safeguard applies. We will tell you.</p>
      </LegalSection>

      <LegalSection id="retention" title="How long we keep it">
        <LegalList>
          <li>
            Account, profile, linked Google or GitHub identity, and submissions: until you delete
            the account in Settings, or until you ask us to delete it.
          </li>
          <li>Session: 30 days, or sooner when you sign out. Sign-out deletes the session.</li>
          <li>
            Google and GitHub sign-in checks: about 10 minutes for the sign-in state, and about 2
            minutes for the one-time exchange. Expired rows are deleted.
          </li>
          <li>Host logs: for the host&apos;s ordinary security retention, separate from your account.</li>
        </LegalList>
        <p>
          Deleting the account deletes the user and, with it, the sessions, the linked providers,
          and the submissions. The copy in the browser is removed when that deletion signs you
          out. Display preferences can remain on the device until you clear them. They do not
          identify the deleted account to us.
        </p>
        <p>
          If a host keeps backups, they age out on that host&apos;s backup cycle. We do not restore
          a deleted account into the live course.
        </p>
      </LegalSection>

      <LegalSection id="security" title="How we protect it">
        <p>
          In production the site and the API are served over HTTPS. Passwords are hashed with
          scrypt. Session tokens are stored as SHA-256 hashes, so a copy of the database is not a
          list of usable tokens. Google and GitHub are linked only from a verified email. You can
          delete the account yourself in Settings.
        </p>
        <p>
          If a breach creates a risk to your rights, we will tell the relevant authority and,
          when the law requires it, tell you. A notice to an authority is due without undue delay
          and, where feasible, within 72 hours of our becoming aware of the breach, as the UK GDPR
          and the EU GDPR require.
        </p>
      </LegalSection>

      <LegalSection id="europe" title="Your rights in the UK and Europe">
        <p>
          If the UK GDPR, the Data Protection Act 2018, or the EU GDPR applies, you can:
        </p>
        <LegalList>
          <li>Be told what we do with your data. This page is that notice.</li>
          <li>Access the personal data we hold about you.</li>
          <li>Correct it. Name, email, picture link, and password can be changed in Settings.</li>
          <li>
            Delete it. Settings includes Delete account. You can also email us. Deletion covers
            the account, the submissions, the sessions, and the linked providers.
          </li>
          <li>Restrict what we do with it while a correction or an objection is open.</li>
          <li>
            Receive a portable copy of your account details and the code you submitted. Email us
            and we will send JSON. There is no export button in the product today.
          </li>
          <li>
            Object to processing based on legitimate interests. We will stop unless we have a
            compelling legitimate ground, such as an open abuse investigation.
          </li>
          <li>
            Ask us not to make a decision about you based only on automated processing if that
            decision has a legal effect, or a similar significant effect. A green tick and the progress
            note are feedback on exercises. They do not affect a job, credit, insurance, or a
            legal right. The course is not run under Article 22.
          </li>
          <li>
            Complain to a supervisory authority. You can complain to us first. You do not have to.
          </li>
        </LegalList>
        <p>
          We reply within one month of a request that shows it is from you. If a request is
          complex, or you send several, the law lets us extend that by up to two further months,
          and we will tell you within the first month if we do. We may ask you to confirm you
          control the email on the account before we send code or delete anything. We do not
          charge for a request the law requires us to meet. A fee or a refusal is reserved for a
          request that is manifestly unfounded or excessive, which is the limit the UK GDPR and
          the EU GDPR already set.
        </p>
        <p>
          These rights sit with the Data Protection Act 2018. This policy does not waive them.
          Where processing is based on consent, you can withdraw that consent at any time. The
          account itself runs on contract, not on consent.
        </p>
      </LegalSection>

      <LegalSection id="united-states" title="Your rights in the United States">
        <p>
          This section uses &quot;personal information&quot; in the sense of the California
          Consumer Privacy Act, as amended by the CPRA, and the similar comprehensive privacy laws
          in other states, including Virginia, Colorado, Connecticut, Utah, Texas, and Oregon.
        </p>
        <LegalSubheading>Categories</LegalSubheading>
        <p>
          Identifiers: name, email, account id, and, if you use them, a Google or GitHub user id.
          Account records: those identifiers, a password hash if you set a password, and a picture
          link if one is stored. Education information you create on the course: submitted code,
          test results, and the progress summary. Internet or network activity is limited
          to requests to the site and host logs.
        </p>
        <p>
          We do not collect precise geolocation, government identifiers, financial information, or
          a purchase history. There is nothing to buy. We do not collect sensitive personal
          information as the CPRA defines it, and we do not use sensitive personal information to
          infer characteristics.
        </p>
        <LegalSubheading>Sources, purposes, and disclosure</LegalSubheading>
        <p>
          We collect this information from you, and from Google or GitHub if you choose them. We
          use it to provide the course, to keep it secure, and to meet the law. We disclose it to
          the hosts named above so they can run the site and the database, and to Google or GitHub
          when you start that sign-in. We do not disclose personal information to third parties for
          their own direct marketing.
        </p>
        <p>
          We do not sell personal information. We do not share it for cross-context behavioral
          advertising. We do not use it for targeted advertising. We have no actual knowledge of
          selling or sharing the personal information of anyone under 16.
        </p>
        <LegalSubheading>Requests</LegalSubheading>
        <p>
          Depending on your state, you can ask us to confirm, access, correct, delete, and provide
          a portable copy of your personal information. You can opt out of sale, sharing, and
          targeted advertising. There is no sale, sharing, or targeted advertising to stop. A
          browser Global Privacy Control signal is treated as that opt-out. You can appeal a
          refusal by replying to our email about the request. You will not be charged, and the
          free course will not be reduced, because you used a privacy right. An authorised agent
          can ask for you if you show that the agent is allowed to act.
        </p>
        <p>
          We do not offer a financial incentive in exchange for personal information.
        </p>
      </LegalSection>

      <LegalSection id="elsewhere" title="Other countries">
        <p>
          Canada&apos;s PIPEDA, Australia&apos;s Privacy Act, and Brazil&apos;s LGPD give people
          rights to be told what is collected, to access it, to correct it, and to delete it. In
          Brazil those rights include information about sharing and a portable copy. If one of
          those laws applies to you, write to us and we will handle the request under it.
        </p>
        <p>
          If your country gives you a privacy right this policy has not named, write to us and we
          will follow the right that binds us.
        </p>
      </LegalSection>

      <LegalSection id="age" title="Age">
        <p>
          The course is for people aged 16 and over. It is not directed at children, and it is not
          designed for anyone under 16. We do not knowingly create an account for a child under
          16. If you are a parent or guardian and you believe we have, email us and we will delete
          the account.
        </p>
        <p>
          The UK Age Appropriate Design Code applies to online services likely to be accessed by
          children. This course is written for people who already write TypeScript, on a computer.
          The age line is part of keeping it that way. We do not profile children for advertising,
          and we do not nudge an account into giving us extra data.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this policy">
        <p>
          If we change how we use personal data, we will update this page and the date at the top.
          A change that starts a new use, or that needs a fresh legal basis, will be described
          before it starts. Keeping the course free is not something we will reverse by editing
          this policy quietly. A charge would be a separate offer, and the{" "}
          <LegalLink href="/terms">Terms</LegalLink> say you would have to accept it first.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact and complaints">
        <p>
          Email <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink>. We will
          reply.
        </p>
        <p>
          In the United Kingdom, complain to the Information Commissioner&apos;s Office at{" "}
          <LegalLink href="https://ico.org.uk">ico.org.uk</LegalLink>. In the EEA, complain to the
          supervisory authority in your country. The European Data Protection Board publishes the{" "}
          <LegalLink href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_en">
            list of authorities
          </LegalLink>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
