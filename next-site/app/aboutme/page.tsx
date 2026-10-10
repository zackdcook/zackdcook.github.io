import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { ArtworkImage } from "@/components/artwork";
import { ZackyCPreview } from "@/components/zacky-c-preview";
import { site } from "@/content/site";

export const metadata: Metadata = pageMetadata("about", "About Me");

export default function AboutMe() {
  const person = {
    "@context": "https://schema.org", "@type": "Person",
    "@id": `${site.url}/aboutme#zack-cook`, name: "Zack Cook",
    alternateName: ["Zack D. Cook", "Zachary David Cook", "Zacky C", "Zacak"],
    url: `${site.url}/aboutme`, image: `${site.url}/images/portrait.webp`,
    jobTitle: "Senior Manufacturing Industrial Engineer",
    alumniOf: { "@type": "CollegeOrUniversity", name: "University of Florida" },
    worksFor: { "@type": "Organization", name: "Publix" },
    homeLocation: { "@type": "City", name: "Lakeland, Florida" },
    knowsAbout: ["Fiction writing", "Industrial engineering", "Chemical engineering", "Lean Six Sigma"],
    sameAs: ["https://github.com/zackdcook", site.linkedin, site.instagram, site.threads],
  };

  return <div className="page-wrap about-me-page"><div className="shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: person,
    }).replace(/</g, "\\u003c") }} />

    <section className="about-intro">
      <div className="page-intro">
        <p className="eyebrow">About Me</p>
        <h1>I’m Zack<br /><em>Cook.</em></h1>
      </div>

      <div className="portrait-frame tactile-photo" data-material-surface="glass">
        <div className="photo-clip"><ArtworkImage slot="portrait" alt="Zack Cook" width={1200} height={1200}
          sizes="(max-width: 740px) 90vw, 40vw" preload /></div>
      </div>
    </section>
  </div>

  <section className="about-biography section-space">
    <div className="shell"><div className="prose about-story">
      <p>You may know me as Zack, Zack D. Cook, or, if you’re the government, Zachary David Cook. If you’ve known me for a while, you might be inclined to call me {" "}<ZackyCPreview />. For one brief moment in the annals of history, I became Zacak when your friendly neighborhood supermarket accidentally wrote it on my birthday cake.</p>

      <p>Hello there!</p>

      <p>By day, I’m an industrial engineer for Publix Manufacturing, classically trained as a chemical engineer at the University of Florida. At dawn and dusk, I’m a self-taught aspiring author. And in whatever time I have left, I collect hobbies. So many hobbies. Please, in the name of all things holy, don’t tempt me with another one.</p>

      <p>Cue history lesson.</p>

      <p>I grew up in Fort Myers, Florida, surrounded by a wonderful family full of smarty-pants creatives. Spend five minutes with them and you'll see that my creativity bug is both contagious and hereditary. Most of my childhood revolved around LEGO, Pokémon, and Star Wars—no, wait, scratch “childhood.” That still pretty much describes my adult life. My childhood dream was to dig up dinosaur bones. Thanks, <i>Jurassic Park</i>. I never quite became a paleontologist, but these days, I’m an avid dinosaur-watcher (by which I mean birds). Nailed it!</p>

      <p>Growing up, I wasn’t much of a reader. The only books I enjoyed back then were Those That Must Not be Named and <i>The Lord of the Rings</i>. I hated school writing assignments, too. There was one exception, though: a short story I wrote about a family of killer whales. I was pretty proud of that one. I think I got a B+, which Mr. Death-by-Perfectionism here interpreted as a personal failure. Maybe that's where I got the idea that I couldn't write?</p>

      <p>When I was in high school, my friends and I somehow managed to entertain ourselves by loitering around CVS and inventing our own <i>Jackass</i>-style challenges. We called them “The Manliest Man” competitions, featuring milk-chugging, bike-jousting, and full-contact downhill piggyback races. Apart from stupid stunts, I spent a lot of time on the computer, chatting on AIM, playing <i>World of Warcraft</i>, and downloading viruses—I mean songs—through LimeWire. The mid-aughts sure were a fun time.</p>

      <p>I graduated in the top 10 of my class at Estero High School in 2008, then began my studies at UF. My original plan was to study 3D animation and CGI, fantasizing about making CGI for Star Wars, but that major wasn't offered by UF at the time. Besides, <i>Revenge of the Sith</i> had come out a few years earlier, and George Lucas had said he was done making Star Wars movies. So what was the point of studying animation? (HAHA. Hah. ha...) So, in choosing my major, I went with what I was best at: math, science, chemistry… chemical engineering! It was also touted as “the toughest major,” which, for some reason, only made me want to do it more.</p>

      <p>During my final year of college, I moved to a small town in Arkansas for a summer internship. Reading for pleasure was somewhere near the bottom of my list of enjoyable activities, but after a few weeks in a town of 11,619 people, I got so bored that I searched for dopamine in a place I'd always considered barren of entertainment: a bookstore. There, on the shelf, sat a book with a vaguely familiar title: <i>A Game of Thrones</i>. I read that bitch in approximately seven breaths. I couldn’t put it down, nor the rest of the series.</p>

      <p>Review: "Oh shit. Books can be this good?"</p>

      <p>I graduated cum laude from UF in 2012 (fun fact: this is where I met my wife), and then went on to work in Sarasota for a short while. This is when I began experiencing heavy withdrawal symptoms from the literary high that George R. R. Martin had injected straight into my basal ganglia. Taking pity on the starved and clueless book junkie I’d become, a friend lent me his copies of the first three books in the Wheel of Time series.</p>

      <p>"Now <i>this</i> is podracing!"</p>

      <p>My career path in Sarasota wasn’t what I had planned—it wasn’t related to my degree—so I attended UF’s career showcase to look for something more fulfilling. And there I found it! A company I interviewed with offered me first choice among several plants located across the country. Madness took me, and I decided to relocate to Niagara Falls, NY. Why, you ask? Because a couple of dudes wearing literal barrels at the recruiting event—a suit-and-tie recruiting event, mind you—convinced me that their plant knew how to party better than any of the others.</p>

      <p>They, in fact, <i>did</i> know how to party.</p>

      <p>In addition to bringing me along for all of their shenanigans, my Buffalonian friends also inducted me into their book club. By crazy coincidence, they had just finished reading The Wheel of Time series! From there, reading became one of the few hobbies that stuck with me.</p>

      <p>While still in New York, my brother also introduced me to Dungeons & Dragons. This was after we’d quit our raiding group in <i>World of Warcraft</i> because we thought it was taking up too much of our time. Oh, sweet summer child. Turns out, D&D can consume infinitely more of your life, especially when you decide to run the game as Dungeon Master.</p>

      <p>Which I, of course, did.</p>

      <p>There was something about the creative freedom of making up crazy shit and having fun on the fly that filled me with a latent eldritch power. I just wouldn't learn how to tap into it until years later.</p>

      <p>I had a great time in New York, but grew to miss my family too much, so I moved back to Florida in 2017. Upon arrival back in the Sunshine State, I picked up my first book by Brandon Sanderson, <i>The Way of Kings</i>, and he became my favorite author on the spot.</p>

      <p>Sanderson's ability to write from such diverse perspectives made me curious about who he was as a person. I did some research into his life experiences and eventually stumbled upon videos of his creative writing lectures at BYU. I think it was the way he taught those classes, breaking down the craft of writing almost like the scientific method, that made me brave enough to venture into the world of writing myself.</p>

      <p>That and the existential dread of a temporary mortal life. So I started writing my own novel.</p>

      <p>And that, my patient friend, is what brings us here to this peculiar intersection of space and time: me, writing this short account of my life, sitting by the window with my three cats, listening to the birds enjoy their lunch during a calm autumnal drizzle; and you, somewhere else, sometime after this moment has passed, reading these very words.</p>
    </div></div>
  </section>
  </div>;
}
