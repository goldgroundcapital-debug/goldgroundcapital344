import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AuthShell({
  title,
  subtitle,
  children,
  altText,
  altHref,
  altCta,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  altText: string;
  altHref: string;
  altCta: string;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-5 sm:px-8 py-12 md:py-20 page-enter">
        <div className="card p-7 sm:p-8">
          <h1 className="font-serif text-2xl sm:text-3xl tracking-tight text-ink-900">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-600">{subtitle}</p>

          <div className="mt-7">{children}</div>

          <p className="mt-7 pt-5 border-t border-cream-200 text-sm text-ink-600">
            {altText}{" "}
            <Link href={altHref} className="text-gold-600 hover:text-gold-700 font-medium">
              {altCta}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
