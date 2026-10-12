import styles from "./shoutout-list.module.css";
type Person = { name: string; subtitle?: string; url: string; note: string; groupName?: string };

export function ShoutoutList({ people }: { people: Person[] }) {
  return <div className={`shoutout-list ${styles.list}`}>{people.map(person => (
    <article className={`shoutout-card ${styles.person}`} key={person.url}>
      <div className={styles.name}><h3>{person.name}</h3>{person.subtitle && <p className="shoutout-subtitle">{person.subtitle}</p>}</div>
      <div className={styles.note}>
        <p>{person.note}{person.groupName && <> <em>{person.groupName}</em></>}</p>
        <a className="button" href={person.url} target="_blank" rel="noopener noreferrer">Visit {person.name}</a>
      </div>
    </article>
  ))}</div>;
}
