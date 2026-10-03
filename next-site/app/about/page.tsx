import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import Image from "next/image";
import editorial from "@/content/editorial.json";
import { site } from "@/content/site";

export const metadata: Metadata = pageMetadata("about", "About Zack Cook");

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
    sameAs: ["https://github.com/zackdcook", site.linkedin, site.instagram, site.threads],
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
          <p className="eyebrow">Aboot Zack</p>
          <h1>
            I’m Zack
            <br />
            <em>Cook.</em>
          </h1>
          <p>
            An engineer, an aspiring author, and someone who’s happiest making
            something.
          </p>
          <p>
            Also known as Zacky C. You may have seen my name written as Zack D.
            Cook.
          </p>
        </div>
        <div className="portrait-frame tactile-photo"><Image
          src="/images/portrait.webp"
          alt="Zack Cook"
          width={1200}
          height={1200}
          sizes="(max-width: 740px) 90vw, 40vw"
        /></div>
      </section>
      <div className="prose section-space">
        {editorial.aboutSections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
      </div>
      <figure className="about-cats">
        <div className="tactile-photo kitty-photo">
        <Image
          src="/images/cats.webp"
          alt="The three cats at home in a sunny patch by the window"
          width={1400}
          height={1034}
          sizes="90vw"
        /></div>
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
