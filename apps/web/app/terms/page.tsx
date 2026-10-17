import type { Metadata } from "next";
import {
  LegalLink,
  LegalList,
  LegalPage,
  LegalSection,
  LegalSubheading,
} from "@/components/legal-page";
import { contactEmail, creatorName, legalUpdated, siteName, siteUrl, socialImage } from "@/lib/site";

const description = `The terms for ${siteName}. The course is free: no card, no trial, and no paid tier.`;

export const metadata: Metadata = {
  title: "Terms",
  description,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms",
    description,
    url: "/terms",
    images: [socialImage],
  },
};

const contents = [
  { id: "agreement", label: "This agreement" },
  { id: "free", label: "The course is free" },
  { id: "who", label: "Who can join" },
  { id: "account", label: "Your account" },
  { id: "course", label: "Using the course" },
  { id: "code", label: "Your code" },
  { id: "material", label: "Our material" },
  { id: "use", label: "Acceptable use" },
  { id: "providers", label: "Google and GitHub" },
  { id: "privacy", label: "Privacy" },
  { id: "changes", label: "Availability and changes" },
  { id: "education", label: "What the course is" },
  { id: "liability", label: "Liability" },
  { id: "ending", label: "Closing the account" },
  { id: "law", label: "Law and courts" },
  { id: "contact", label: "Contact" },
] as const;

export default function TermsPage() {
  return (
    <LegalPage
      kicker={siteName}
      title="Terms"
      updated={legalUpdated}
      lede={
        <>
          <p>
            These terms are the agreement between you and {creatorName} for the course at{" "}
            <LegalLink href={siteUrl}>{siteUrl.replace("https://", "")}</LegalLink>. The
            course is free. Creating an account means you agree to these terms and have read the{" "}
            <LegalLink href="/privacy">Privacy policy</LegalLink>.
          </p>
        </>
      }
      contents={contents}
    >
      <LegalSection id="agreement" title="This agreement">
        <p>
          {creatorName} is the other party to this agreement. He created the course. He is a
          private individual, not a company or an organisation. Contact{" "}
          <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink>. If you need a
          postal address for a formal notice, ask and he will provide one.
        </p>
        <p>
          Before you create an account, these terms tell you who we are, what the course is, that
          the price is zero, that there is no subscription term, and how to close the account.
          That is the information a distance contract is meant to give you up front.
        </p>
      </LegalSection>

      <LegalSection id="free" title="The course is free">
        <p>The nineteen lessons, the editor, the tests, and saved progress are free.</p>
        <LegalList>
          <li>We do not take a payment card to open an account.</li>
          <li>We do not start a trial that becomes a subscription.</li>
          <li>We do not lock a lesson behind a paid plan.</li>
          <li>We do not sell your personal data to pay for the course.</li>
        </LegalList>
        <p>
          If we ever offer something optional and paid, it will be a separate offer with its own
          price. It will not be required to keep using the course these terms describe, and we
          will not charge this account unless you agree to that separate offer first.
        </p>
        <p>There is nothing to refund, because there is nothing to pay.</p>
      </LegalSection>

      <LegalSection id="who" title="Who can join">
        <p>
          You need to be at least 16 years old, and able to enter an agreement under the law that
          applies to you. The course is for a person learning. It is not directed at children.
        </p>
        <p>
          Use your own account. Do not create an account for someone else unless you are allowed
          to agree for them and they are at least 16.
        </p>
      </LegalSection>

      <LegalSection id="account" title="Your account">
        <p>
          You can register with email and a password, or with Google or GitHub. A verified email
          from Google or GitHub signs into the account that already uses that address. An
          unverified address is not linked. Keep your password to yourself if you set one. Tell us
          if you think someone else is using the account.
        </p>
        <p>
          A password has to be at least 8 characters. You can change your name, email, picture
          link, and password in Settings. You can delete the account there. Deletion removes the
          account, the sessions, the linked providers, and the submissions, as the{" "}
          <LegalLink href="/privacy">Privacy policy</LegalLink> describes.
        </p>
        <p>
          We can suspend or close an account that breaks these terms, that is being used to attack
          the service, or that the law requires us to close. Where we can do so safely, we will
          tell you the reason first and let you ask for a copy of your code. We will act first
          where waiting would leave the service, or another person, at risk.
        </p>
      </LegalSection>

      <LegalSection id="course" title="Using the course">
        <p>
          Lessons are meant to be taken in order. An exercise is complete when its tests pass.
          A green tick stays on that lesson. The tick is a learning record for you. It is not a
          qualification, a certificate, or a reference we give to an employer.
        </p>
        <p>
          The editor runs in your browser. A submission runs on our server long enough for the
          tests, with a short time limit, and without loading outside packages. That is enough for
          these exercises. It is not a hardened sandbox, and it is not a place to run code you do
          not want stored.
        </p>
        <p>The coding desk is built for a laptop or desktop.</p>
      </LegalSection>

      <LegalSection id="code" title="Your code">
        <p>
          You keep the rights in the code you submit. You give us a licence to host it, show it
          back to you, and run it for the tests, for as long as the account exists, and only so we
          can provide the course. The licence ends when the code is deleted, apart from a backup
          copy that ages out on the host&apos;s backup cycle.
        </p>
        <p>
          We do not publish your solutions, sell them, or offer them as training data.
        </p>
        <p>
          You agree that the code is yours to submit, and that it does not include another
          person&apos;s personal data, a secret, or anything you are not allowed to store with us.
        </p>
      </LegalSection>

      <LegalSection id="material" title="Our material">
        <p>
          The lesson text, examples, tests, starter code supplied with the course, and the site
          design belong to {creatorName}, or are used with his permission. He gives you a personal,
          non-exclusive licence to use them while you take the course. You may keep copies of your
          own solutions.
        </p>
        <p>
          Do not republish the lessons as your own course, scrape the site to build a competing
          product, or strip attribution from material that carries it.
        </p>
        <p>
          If you believe material on the site infringes a copyright you hold, email{" "}
          <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink> with the page,
          what the material is, and a statement that you are the rightsholder or allowed to act
          for them. We will review the notice and remove or restrict material that infringes. This
          is a notice process. It is not a registration with a copyright office.
        </p>
      </LegalSection>

      <LegalSection id="use" title="Acceptable use">
        <p>Use the course to learn. In particular, do not:</p>
        <LegalList>
          <li>
            Probe, scan, or try to break out of the code runner, or use it to reach the server,
            another account, or anyone else&apos;s data
          </li>
          <li>Overload the site, or automate submissions in a way that degrades it for other people</li>
          <li>Try to access an account that is not yours</li>
          <li>Upload malware, or code whose purpose is to harm the service or another person</li>
          <li>Use the course to harass, or to store unlawful material</li>
          <li>Present progress as a credential issued by us</li>
        </LegalList>
        <p>
          We may remove a submission or end a session that does this. For a mistake that does not
          put other people at risk, we will tell you and give you a chance to stop, where the law
          and the safety of the service allow it.
        </p>
      </LegalSection>

      <LegalSection id="providers" title="Google and GitHub">
        <p>
          Those buttons are optional. Google and GitHub provide their own services under their own
          terms, and they are responsible for those services. An outage or a decision on their
          side is theirs. You can use email and a password instead. If the account started with a
          provider, you can add a password later from Settings.
        </p>
      </LegalSection>

      <LegalSection id="privacy" title="Privacy">
        <p>
          The <LegalLink href="/privacy">Privacy policy</LegalLink> explains the personal data we
          use. It is the notice for the UK GDPR, the Data Protection Act 2018, and the EU GDPR.
          These terms do not reduce the rights in that policy. The hosts that store the site and
          the database do so as our processors, on the data processing terms the policy describes.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Availability and changes">
        <p>
          We aim to keep the course available. Maintenance, a host failure, or a legal duty can
          take a page offline for a time. We do not promise uninterrupted access.
        </p>
        <p>
          We may correct a lesson, a test, or the way a score is explained. A correction will not
          be used to remove a pass you have already earned, except where a broken test marked a
          wrong answer as right, and we will say so when that happens.
        </p>
        <p>
          We may update these terms. The page will show a new date. If a change materially reduces
          the free course, or adds a restriction that affects why you joined, we will post it
          before it takes effect. You can delete the account if you do not want the new terms.
          Using the course after that date means you accept the update, except where the law
          requires a clearer agreement. An update will not add a fee to this account.
        </p>
        <p>
          If we close the course, we will say so on the site beforehand when we can, and you can
          ask for a copy of your code before the closing date.
        </p>
      </LegalSection>

      <LegalSection id="education" title="What the course is">
        <p>
          The course is practice in data structures and algorithms, in TypeScript. It is
          educational. It is not a programme from an accredited institution, not professional
          advice, and not an offer of an interview, a job, or a particular result. You decide how
          you use what you practise.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Liability">
        <p>
          You keep every right that a contract is not allowed to take away. That includes
          liability for death or personal injury caused by negligence, liability for fraud or
          fraudulent misrepresentation, and any mandatory consumer or data-protection right in the
          United Kingdom, the European Economic Area, Switzerland, or the country where you live.
        </p>
        <LegalSubheading>Consumer rights</LegalSubheading>
        <p>
          If you are a consumer, the Consumer Rights Act 2015 and the unfair-terms rules in the
          United Kingdom still apply, including the bar on terms that hide a fee or that deny a
          statutory right. In the EEA, the mandatory rules on unfair terms still apply, and so do
          the rules on digital content and digital services where they cover a free service,
          including where personal data is part of the bargain and the law treats it that way.
          Nothing in these terms is applied so as to remove one of those rights.
        </p>
        <LegalSubheading>Other loss</LegalSubheading>
        <p>
          Outside those rights, we are liable for direct loss that was a foreseeable result of our
          breaking these terms, or of our failing to use reasonable care and skill. We are not
          liable for loss of profit, loss of business, or other indirect or consequential loss, to
          the extent the law allows that limit. The course is free, so a foreseeable direct loss
          will often be limited. A court can still award what the law requires.
        </p>
        <p>
          The code runner can stop a run that exceeds the time limit. Keep your own copy of work
          you care about, as well as the copy on the account.
        </p>
      </LegalSection>

      <LegalSection id="ending" title="Closing the account">
        <p>
          You may delete the account at any time in Settings, or by emailing us. If you live in
          the United Kingdom or the EEA and a statutory cooling-off right applies to this free
          service, you can cancel within 14 days of creating the account by deleting it or writing
          to us. There is no charge to return.
        </p>
        <p>
          We are not obliged to use an alternative dispute resolution scheme. You can still email
          us. You can also complain to a consumer authority, or to a data-protection authority,
          where you have that right. In the UK the data-protection authority is the Information
          Commissioner&apos;s Office.
        </p>
      </LegalSection>

      <LegalSection id="law" title="Law and courts">
        <p>These terms are governed by the laws of England and Wales.</p>
        <p>
          If you live in the United Kingdom or the European Economic Area, you keep the mandatory
          protections of the country where you live, and you may bring a claim in the courts of
          that country. We may bring a claim in the courts of your country of residence, or in the
          courts of England and Wales. This section leaves in place any right to a local court
          that the law says you cannot give up.
        </p>
        <p>
          If you live somewhere else, you can still bring a claim where a local mandatory rule
          says the courts of your country must be open to you. Otherwise the courts of England and
          Wales decide disputes under these terms.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Email <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink>. The{" "}
          <LegalLink href="/privacy">Privacy policy</LegalLink> explains personal data, including
          how to complain to a supervisory authority.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
