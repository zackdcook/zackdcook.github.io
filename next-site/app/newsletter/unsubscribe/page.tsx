import { NewsletterUnsubscribe } from "@/components/book-launch/newsletter-unsubscribe";
export const metadata = { title: "Unsubscribe from newsletters", robots: { index: false, follow: false } };
export default function UnsubscribePage() {
  return <div className="shell page-wrap prose-page"><div className="page-intro"><h1>Your inbox.<br/><em>Your choice.</em></h1></div><NewsletterUnsubscribe/></div>;
}
