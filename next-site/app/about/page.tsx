import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About Zack Cook",
  description:
    "Meet Zack Cook, also known as Zacky C: a fiction writer, Publix industrial engineer, and University of Florida chemical engineering graduate in Lakeland, Florida.",
  alternates: { canonical: "/about" },
};

export default function About() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://zackdcook.com/about#zack-cook",
    name: "Zack Cook",
    alternateName: ["Zacky C", "Zack D. Cook"],
    url: "https://zackdcook.com/about",
    image: "https://zackdcook.com/images/portrait.webp",
    jobTitle: "Senior Manufacturing Industrial Engineer",
    alumniOf: { "@type": "CollegeOrUniversity", name: "University of Florida" },
    worksFor: { "@type": "Organization", name: "Publix" },
    homeLocation: { "@type": "City", name: "Lakeland, Florida" },
    knowsAbout: [
      "Fiction writing",
      "Industrial engineering",
      "Chemical engineering",
      "Lean Six Sigma",
    ],
    sameAs: ["https://github.com/zackdcook"],
  };
  return (
    <div className="shell page-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: person,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <section className="about-intro">
        <div className="page-intro">
          <p className="eyebrow">Nice to meet you</p>
          <h1>
            I’m Zack
            <br />
            <em>Cook.</em>
          </h1>
          <p>
            A fiction writer, an engineer, and someone who’s happiest making
            something.
          </p>
          <p>
            Also known as Zacky C. You may have seen my name written as Zack D.
            Cook.
          </p>
        </div>
        <Image
          className="about-portrait"
          src="/images/portrait.webp"
          alt="Zack Cook"
          width={1200}
          height={1200}
          sizes="(max-width: 740px) 90vw, 40vw"
        />
      </section>
      <div className="prose section-space">
        <h2>The engineering part</h2>
        <p>
          I’m a Senior Manufacturing Industrial Engineer at Publix in Lakeland,
          Florida, and a Lean Six Sigma Black Belt. I graduated from the
          University of Florida in 2012 with a B.S. in Chemical Engineering, cum
          laude.
        </p>
        <p>
          My work is about understanding how things run, finding the right
          problem to solve, and making systems work better for the people using
          them.
        </p>
        <h2>The writing part</h2>
        <p>
          Making things has always mattered to me. Drawing, music, model kits,
          stories. Engineering became my career; fiction is something I’m
          choosing to give room to as well.
        </p>
        <p>
          I’m writing my first novel and learning as I go. I’m drawn to strange
          worlds, found family, and stories that leave room for humor even when
          things get dark.
        </p>
        <h2>The home part</h2>
        <p>
          I live in Lakeland with my wife, Jennifer, and our cats Chemi, Tashi,
          and Brave. There’s usually music playing, something I’m building, or a
          bird outside worth getting distracted by.
        </p>
      </div>
      <figure className="about-cats">
        <Image
          src="/images/cats.webp"
          alt="The three cats at home in a sunny patch by the window"
          width={1400}
          height={1034}
          sizes="90vw"
        />
        <figcaption>
          Chemi, Tashi, and Brave. Enthusiastic participants in every
          work-from-home day.
        </figcaption>
      </figure>
      <section className="signature-section section-space">
        <div>
          <p className="eyebrow">A name with some history</p>
          <h2>
            Sometimes,
            <br />
            <em>Zacky C.</em>
          </h2>
          <p>Same person. A few different ways of signing things.</p>
        </div>
        <Image
          src="/images/name-doodles.webp"
          alt="A page of handwritten Zack Cook and Zacky C lettering"
          width={1200}
          height={1600}
          sizes="(max-width: 740px) 90vw, 50vw"
        />
      </section>
      <p className="contact-line">
        Want to say hello? <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
    </div>
  );
}
