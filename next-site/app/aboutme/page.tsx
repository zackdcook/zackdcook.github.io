import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";

export const metadata: Metadata = pageMetadata("about", "About Me");

export default function AboutMe() {
  const person = {
    "@context": "https://schema.org", "@type": "Person",
    "@id": `${site.url}/aboutme#zack-cook`, name: "Zack Cook",
    alternateName: ["Zack D. Cook", "Zachary Cook", "Zacky C", "Zacak"],
    url: `${site.url}/aboutme`, image: `${site.url}/images/portrait.webp`,
    jobTitle: "Senior Manufacturing Industrial Engineer",
    alumniOf: { "@type": "CollegeOrUniversity", name: "University of Florida" },
    worksFor: { "@type": "Organization", name: "Publix" },
    homeLocation: { "@type": "City", name: "Lakeland, Florida" },
    knowsAbout: ["Fiction writing", "Industrial engineering", "Chemical engineering", "Lean Six Sigma"],
    sameAs: ["https://github.com/zackdcook", site.linkedin, site.instagram, site.threads],
  };
  return <div className="shell page-wrap about-me-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: person,
    }).replace(/</g, "\\u003c") }} />
    <section className="about-intro">
      <div className="page-intro">
        <p className="eyebrow">About Me</p>
        <h1>I’m Zack<br /><em>Cook.</em></h1>
      </div>
      <div className="portrait-frame tactile-photo"><Image src="/images/portrait.webp" alt="Zack Cook" width={1200} height={1200} sizes="(max-width: 740px) 90vw, 40vw" priority /></div>
    </section>
    <div className="prose about-story">
      <p>You may know me as Zack D. Cook, Zachary Cook, Zacky C, or even, one time, as accidentally written on a birthday cake, Zacak. But never Zach (I hate even writing it here)!</p>
      <p>By day, I’m an industrial engineer for Publix Manufacturing, classically trained as a chemical engineer at the University of Florida. During the times of dawn and dusk, I’m an aspiring author, self-taught. And at play, I’m a collector of hobbies.</p>
      <p>I grew up in Fort Myers, Florida to a wonderful family full of smarty-pants creatives. Most of my childhood revolved around LEGO, Pokemon, Star Wars—actually, no, I should say most of my <i>life</i>, because those interests persist to this day. Also classic 90&apos;s cartoons, of course! And you can&apos;t leave out Jurassic Park—my childhood dream was to dig up dinosaur bones. Now, I&apos;m an avid dinosaur-watcher (in the form of birds).</p>
      <p>When I was in high school, me and my friends somehow had fun loitering around CVS and creating our own <i>Jackass!</i> challenges that we called &quot;The Manliest Man&quot; competitions like milk-chugging, bike-jousting, and full-contact downhill piggy-back races (sorry for the name but it was the mid-aughts—it was still a competition for all genders). I&apos;m not sure how I ever survived to adulthood...</p>
      <p>I graduated top 10 from Estero High School in 2008, and then began my studies at UF. My original plan was to be a 3D animator, doing CGI stuff, but that wasn&apos;t an option at the time. So I went with what I was best at: math, science, chemistry... chemical engineering! It was also &quot;the toughest major&quot; so I, naturally, took on the challenge. I graduated cum laude in 2012. (Fun fact: this is where I met my wife, Jennifer)</p>
      <p>After UF, I went on to work for a bit on Siesta Key, then went mad and moved to Niagara Falls, NY because a couple of dudes wearing barrels at a recruiting event convinced me that their plant best knew how to party (they, in fact, <i>did</i> know how to party). I had a great time there but missed Florida, and my family, so I moved back after a few years. I&apos;ve been in Polk County ever since (pronounced &quot;Poke&quot;, if you&apos;re of the more-civilized class), and now work for Publix, which is such a great place to work!</p>
      <p>I get a lot of fulfillment out of my career, but I figured I needed a good creative outlet, so I took on the masochistic challenge of aspiring to be an author! Yay! And that leads us here. I&apos;m working to finish writing the rough draft of my first novel before the end of 2026, and then move on to revision early 2027. Stay tuned!</p>
    </div>
    <figure className="about-name-art"><div className="portrait-frame tactile-photo"><Image src="/images/name-doodles.webp" alt="A page of handwritten Zack Cook and Zacky C lettering" width={1200} height={1600} sizes="(max-width: 740px) 90vw, 520px" /></div></figure>
  </div>;
}
