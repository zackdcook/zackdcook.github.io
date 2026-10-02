type Person = { name: string; subtitle?: string; url: string; note: string; groupName?: string };

export function ShoutoutList({ people }: { people: Person[] }) {
  return <div className="shoutout-list">{people.map(person => (
    <article className="shoutout-card" key={person.url}>
      <div>
        <h3>{person.name}</h3>
        {person.subtitle && <p className="shoutout-subtitle">{person.subtitle}</p>}
        <p>{person.note}{person.groupName && <> <em>{person.groupName}</em></>}</p>
      </div>
      <a className="button" href={person.url} target="_blank" rel="noopener noreferrer">
        Visit {person.name}
      </a>
    </article>
  ))}</div>;
}
