/** Decorative, fixed-cost atmosphere; no per-frame JavaScript or hit targets. */
export function TreeAtmosphere() {
  return <div className="bebrave-atmosphere" aria-hidden="true">
    <span className="bebrave-water-haze"/>
    <div className="bebrave-fireflies"><i/><i/><i/><i/><i/><i/><i/><i/></div>
  </div>;
}
