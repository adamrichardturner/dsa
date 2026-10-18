import { BookOpen, Check, Columns2, Gift, Moon, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingActions, LandingCloseCopy } from "@/components/landing-actions";
import { LandingMotion, Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { creatorName, siteDescription, siteDomain, siteName, siteUrl } from "@/lib/site";

const weeks = [
  {
    week: "Week 1",
    title: "Foundations",
    detail: "Learn to name the cost of a loop, then practice the scans you will reuse all month.",
    lessons: ["The cost of a loop", "Arrays", "Hash maps", "Two pointers", "Sliding window"],
  },
  {
    week: "Week 2",
    title: "Core structures",
    detail: "Build the structures interviews expect, and a sort you can explain out loud.",
    lessons: ["Linked lists", "Stacks", "Queues", "Recursion", "Binary search", "Merge sort"],
  },
  {
    week: "Week 3",
    title: "Trees and graphs",
    detail: "Walk hierarchical data, keep a priority queue, and search a graph.",
    lessons: ["Trees", "Binary search trees", "Heaps", "Graphs"],
  },
  {
    week: "Week 4",
    title: "Patterns",
    detail: "Finish with the patterns that turn a hard problem into a smaller one.",
    lessons: ["Greedy choices", "Backtracking", "Dynamic programming", "Tries"],
  },
];

const features = [
  {
    icon: Gift,
    title: "100% free",
    detail:
      "All nineteen lessons, the editor, the tests, and your progress. No trial, no card, and nothing locked behind an upgrade.",
  },
  {
    icon: BookOpen,
    title: "One idea per lesson",
    detail:
      "Each lesson is short enough to finish in a sitting. You leave with a function you wrote, not a playlist you half watched.",
  },
  {
    icon: Columns2,
    title: "A desk, not a video",
    detail:
      "The lesson and a TypeScript editor open side by side. Flip the split horizontal when you want the editor underneath.",
  },
  {
    icon: Terminal,
    title: "Tests on every exercise",
    detail:
      "Public examples show the shape of the answer. Hidden tests check the cases that are easy to forget. You see the result when you submit.",
  },
  {
    icon: Check,
    title: "A tick when it passes",
    detail:
      "Pass the exercise and the lesson keeps a green tick. It stays on the path, so you can see what is finished.",
  },
  {
    icon: Moon,
    title: "Yours when you come back",
    detail:
      "The account keeps your code and a note on the topics that still need a pass. Light and dark mode stay with the browser.",
  },
];

const steps = [
  {
    step: "01",
    title: "Read the lesson",
    detail: "A few minutes on the idea, with the cost and the trade stated in plain language.",
  },
  {
    step: "02",
    title: "Write the function",
    detail: "TypeScript checking runs as you type. The starter is already in the editor.",
  },
  {
    step: "03",
    title: "Submit",
    detail: "The tests run immediately. A pass marks the lesson done.",
  },
];

const faqs = [
  {
    question: "Is this data structures and algorithms course free?",
    answer:
      "Yes. The course is 100% free. Creating an account, the nineteen lessons, the editor, the tests, and saved progress do not cost anything. There is no paid tier.",
  },
  {
    question: "What are data structures and algorithms?",
    answer:
      "Data structures and algorithms are how a program stores values and the steps it uses to work on them. A structure is the arrangement, such as an array, hash map, tree, or graph. An algorithm is the procedure, such as a search, a sort, or a traversal.",
  },
  {
    question: "How do I learn data structures and algorithms?",
    answer:
      "Learn data structures and algorithms by writing them. This 100% free course is four weeks of TypeScript: read the lesson, implement one function, and submit it against tests. A pass marks the lesson done.",
  },
  {
    question: "Which data structures and algorithms does the course cover?",
    answer:
      "The path covers complexity, arrays, hash maps, two pointers, sliding windows, linked lists, stacks, queues, recursion, binary search, merge sort, trees, binary search trees, heaps, graphs, greedy choices, backtracking, dynamic programming, and tries.",
  },
  {
    question: "Who is this data structures and algorithms course for?",
    answer:
      "It is for people who already write TypeScript and want the structures and algorithms used in interviews and production code, without a semester of theory first. The coding desk is meant for a laptop or desktop.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      alternateName: [siteDomain, "data structures and algorithms"],
      url: siteUrl,
      description: siteDescription,
      inLanguage: "en",
    },
    {
      "@type": "Course",
      "@id": `${siteUrl}/#course`,
      name: siteName,
      description: siteDescription,
      url: siteUrl,
      inLanguage: "en",
      educationalLevel: "Beginner",
      timeRequired: "P4W",
      isAccessibleForFree: true,
      teaches: weeks.map((week) => week.detail),
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      provider: {
        "@type": "Person",
        name: creatorName,
        url: siteUrl,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <LandingMotion>
      <section className="grid items-start gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <Badge variant="secondary">100% free · TypeScript · four weeks</Badge>
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight">{siteName}</h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Data structures and algorithms are how a program stores values and the steps it uses to
            work on them. This course is 100% free. You read a short lesson, write the function in
            TypeScript, and find out at once whether it holds.
          </p>
          <div className="flex flex-wrap gap-3">
            <LandingActions />
          </div>
          <p className="text-sm text-muted-foreground">{siteDomain}</p>
        </div>
        <Card>
          <CardHeader>
            <CardDescription>Nothing to buy</CardDescription>
            <CardTitle className="font-serif text-3xl">The course is 100% free</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Nineteen lessons. One exercise each. An editor, tests, and a progress page that stays
              on your account.
            </p>
            <p>No trial period, no card, and no lesson held back for a paid plan.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-20" aria-labelledby="features">
        <Reveal className="max-w-2xl space-y-3">
          <h2 id="features" className="font-serif text-3xl tracking-tight">
            What you get
          </h2>
          <p className="text-muted-foreground">
            A month of practice for people who already write TypeScript and want the structures
            under the code they ship.
          </p>
        </Reveal>
        <RevealGroup className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <RevealItem key={feature.title} className="h-full">
                <Card className="h-full" size="sm">
                  <CardHeader>
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                    <h3 className="font-serif text-xl leading-snug font-medium">{feature.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.detail}</p>
                  </CardContent>
                </Card>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      <section className="mt-20" aria-labelledby="syllabus">
        <Reveal className="max-w-2xl space-y-3">
          <h2 id="syllabus" className="font-serif text-3xl tracking-tight">
            Four weeks of course material
          </h2>
          <p className="text-muted-foreground">
            Basics first, then the structures, then the patterns. Work in order. A lesson is
            complete when its exercise passes.
          </p>
        </Reveal>
        <RevealGroup className="mt-6 grid gap-4 lg:grid-cols-2">
          {weeks.map((week) => (
            <RevealItem key={week.week} className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardDescription>{week.week}</CardDescription>
                  <h3 className="font-serif text-2xl leading-snug font-medium">{week.title}</h3>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{week.detail}</p>
                  <ul className="mt-auto flex flex-wrap gap-2">
                    {week.lessons.map((lesson) => (
                      <li key={lesson}>
                        <Badge variant="outline">{lesson}</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="mt-20" aria-labelledby="desk">
        <Reveal className="max-w-2xl space-y-3">
          <h2 id="desk" className="font-serif text-3xl tracking-tight">
            How a lesson goes
          </h2>
          <p className="text-muted-foreground">
            The coding desk is built for a computer, where the lesson and the editor can sit open
            together.
          </p>
        </Reveal>
        <RevealGroup className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <RevealItem key={step.step} className="h-full">
              <Card className="h-full" size="sm">
                <CardHeader>
                  <CardDescription>{step.step}</CardDescription>
                  <h3 className="font-serif text-xl leading-snug font-medium">{step.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                </CardContent>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="mt-20" aria-labelledby="faq">
        <Reveal className="max-w-2xl space-y-3">
          <h2 id="faq" className="font-serif text-3xl tracking-tight">
            Questions about data structures and algorithms
          </h2>
          <p className="text-muted-foreground">
            Short answers, kept in the open so you can read them before you sign up.
          </p>
        </Reveal>
        <RevealGroup className="mt-8 divide-y border-y">
          {faqs.map((faq, index) => (
            <RevealItem key={faq.question}>
              <article className="grid gap-3 py-8 md:grid-cols-12 md:items-start md:gap-8">
                <p className="font-mono text-xs tracking-wide text-muted-foreground md:col-span-1">
                  {index < 9 ? `0${index + 1}` : `${index + 1}`}
                </p>
                <h3 className="font-serif text-xl leading-snug md:col-span-4">{faq.question}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground md:col-span-7 md:pt-1">
                  {faq.answer}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <Reveal className="mt-20">
        <section
          aria-labelledby="signup"
          className="rounded-2xl bg-primary px-8 py-12 text-primary-foreground sm:px-12 sm:py-16"
        >
          <p className="text-sm font-medium tracking-wide text-primary-foreground/70">100% free</p>
          <LandingCloseCopy />
          <div className="mt-8 flex flex-wrap gap-3">
            <LandingActions tone="inverse" />
          </div>
        </section>
      </Reveal>
      </LandingMotion>
    </main>
  );
}
