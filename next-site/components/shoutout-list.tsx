type Person = { name: string; url: string; note: string };

export function ShoutoutList({ people }: { people: Person[] }) {
  return <div className="shoutout-list">{people.map(person => (
    <article className="shoutout-card" key={person.url}>
      <div><h3>{person.name}</h3><p>{person.note}</p></div>
      <a className="button" href={person.url} target="_blank" rel="noopener noreferrer">
        Visit {person.name} <span aria-hidden="true">↗</span>
      </a>
    </article>
  ))}</div>;
}
