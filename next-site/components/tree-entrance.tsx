"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/components/site-preferences";
import { additionalStrike, beginAdditionalStrikes } from "@/lib/local-timeline";
import { emptyTree, type TreeState } from "@/lib/tree-space";

const CypressTree = dynamic(() => import("@/components/cypress-tree").then(m => m.CypressTree), { loading: () => <p className="shell tree-status" role="status">Wandering toward the bark…</p> });
type Scene = "entry" | "base" | "admire" | "carve" | "chop" | "confirm" | "strikes" | "falling" | "fallen" | "stump";
export function TreeEntrance({ enabled, siteKey }: { enabled: boolean; siteKey: string }) {
  const { timeline, changeTimeline, hydrated, reduced, resetVersion } = usePreferences();
  const [scene, setScene] = useState<Scene>("entry");
  const [tree, setTree] = useState<TreeState>(emptyTree);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const environment = useRef<HTMLDivElement>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestReset = useRef(resetVersion);
  const activeRequest = useRef<AbortController | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; activeRequest.current?.abort(); if (transitionTimer.current) clearTimeout(transitionTimer.current); };
  }, []);
  useEffect(() => {
    if (latestReset.current !== resetVersion) {
      latestReset.current = resetVersion; activeRequest.current?.abort();
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      setScene("entry"); setProblem(""); setBusy(false); setTree(emptyTree);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [resetVersion]);
  useEffect(() => {
    if (hydrated && timeline.kind === "living" && new URL(window.location.href).searchParams.has("id")) void explore("admire");
  }, [hydrated]);
  async function snapshot() {
    activeRequest.current?.abort(); const controller = new AbortController(); activeRequest.current = controller;
    const response = await fetch("/api/tree?snapshot=1", { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw Error("The tree couldn’t load right now. Please try again.");
    const data = await response.json();
    return data.state as TreeState;
  }
  async function explore(choice: "admire" | "carve") {
    if (timeline.kind === "felled" || busy) return;
    setBusy(true); setProblem("");
    try { const state = await snapshot(); if (alive.current) { setTree(state); setScene(choice); } }
    catch (e) { if ((e as Error).name !== "AbortError" && alive.current) setProblem((e as Error).message); }
    finally { if (alive.current) setBusy(false); }
  }
  function impact(strong = false) {
    if (reduced || !environment.current) return;
    const d = strong ? 7 : 1.2;
    environment.current.animate([{ transform: "translate(0,0)" }, { transform: `translate(${-d}px,${d*.3}px)` }, { transform: `translate(${d*.7}px,${-d*.2}px)` }, { transform: "translate(0,0)" }], { duration: strong ? 220 : 110, easing: "ease-out" });
  }
  async function strike() {
    if (busy || timeline.kind === "felled") return;
    if (scene === "chop") { changeTimeline({ ...timeline, hacked: true }); impact(); setScene("confirm"); return; }
    if (scene !== "strikes") return;
    impact();
    if (timeline.remaining > 1) { changeTimeline(additionalStrike(timeline, 0, new Date().toISOString())); return; }
    setBusy(true); setProblem("");
    try {
      // One authoritative read at the final strike captures the communal frontier.
      // No server-side carving, moderation, or tree mutation occurs here.
      const state = await snapshot();
      if (!alive.current) return;
      setTree(state); changeTimeline(additionalStrike(timeline, state.approved_count, new Date().toISOString()));
      setScene("falling"); impact(true);
      transitionTimer.current = setTimeout(() => { if (alive.current) setScene("fallen"); }, reduced ? 0 : 230);
    } catch (e) { if ((e as Error).name !== "AbortError" && alive.current) setProblem("That final cut couldn’t finish. Your progress is saved; tap the trunk to try again."); }
    finally { if (alive.current) setBusy(false); }
  }
  function continueChopping() {
    const byte = new Uint8Array(1); crypto.getRandomValues(byte);
    changeTimeline(beginAdditionalStrikes(timeline, byte[0] % 4 + 1)); setScene("strikes");
  }
  if (!hydrated) return <div className="shell swamp-entry"><p role="status">You follow a quiet path into the swamp…</p></div>;
  if (scene === "admire" || scene === "carve" || scene === "fallen") return <CypressTree key={resetVersion + ":" + scene} initialState={tree} initialEntries={[]} enabled={enabled} siteKey={siteKey} initialSigning={scene === "carve" && !timeline.carvingId} fallen={scene === "fallen"} cutoff={scene === "fallen" ? timeline.felledAtGuestNumber ?? 0 : undefined} />;
  const dead = timeline.kind === "felled" && scene !== "falling";
  const striking = scene === "chop" || scene === "strikes";
  return <div className="swamp-visit">
    {scene === "entry" && <div className="shell swamp-entry">
      {dead ? <><p>You meander into a hot Florida swamp. The smell of rot fills your lungs. Before you sits a decaying tree stump.</p><p>You have the distinct feeling that this is your fault.</p><div className="actions"><button className="button" onClick={() => setScene("stump")}>Look at the stump</button><button className="button" onClick={() => setScene("stump")}>Regret your decisions</button></div></> : <><p>You meander into a humid Florida swamp and are greeted by a tree, impossibly tall, reaching into the clouds. The pleasant aroma of fresh cypress tingles your nose. You notice etchings in the bark of the tree, some new, others higher up, seemingly older.</p><p>What do you do?</p><div className="actions"><button className="button" disabled={busy} onClick={() => setScene("base")}>Nothing</button><button className="button" disabled={busy} onClick={() => explore("admire")}>Admire the tree</button>{!timeline.carvingId && <button className="button" disabled={busy} onClick={() => explore("carve")}>Carve something into the tree</button>}<button className="button" disabled={busy} onClick={() => setScene(timeline.roll !== null && timeline.remaining > 0 ? "strikes" : "chop")}>Chop down the tree</button></div></>}
      {busy && <p role="status">Walking closer…</p>}
      {problem && <p role="alert">{problem}</p>}
    </div>}
    {scene === "confirm" && <div className="shell swamp-entry" role="status"><p>You hack at the tree’s hardened trunk. This tree has been here a very long time. Continue?</p><div className="actions"><button className="button" onClick={continueChopping}>Continue</button><button className="button" onClick={() => setScene("base")}>Stop</button></div></div>}
    {striking && <p className="shell strike-instruction" role="status">{busy ? "The trunk gives way…" : "Click or tap the trunk."}</p>}
    {problem && scene !== "entry" && <p className="shell" role="alert">{problem}</p>}
    <div ref={environment} className={"swamp-base" + (dead ? " dead-swamp" : "") + (scene === "falling" ? " is-felling" : "")}>
      {dead ? <img className="dead-stump" src="/images/cypress-stump.webp" width="1200" height="800" alt="A decaying bald-cypress stump in the Florida swamp" /> : <div className="standing-base" role={striking ? undefined : "img"} aria-label={striking ? undefined : "The enormous living cypress, with its flared base disappearing into the wetland"}>
        {timeline.hacked && <span className="axe-hack" aria-hidden="true" />}
        {striking && <button className="trunk-hit" aria-label="Strike the trunk" disabled={busy} onClick={strike} />}
      </div>}
    </div>
  </div>;
}
