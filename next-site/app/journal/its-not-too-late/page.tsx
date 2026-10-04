import { permanentRedirect } from "next/navigation";

// The old essay has been removed. Existing bookmarks lead to the new collection.
export default function RetiredJournalEntry() {
  permanentRedirect("/journal");
}
