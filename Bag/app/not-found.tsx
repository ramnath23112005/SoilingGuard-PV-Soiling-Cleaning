import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60svh] flex-col justify-center py-20">
      <p className="label label-light">404</p>
      <h1 className="display display-l mt-6 max-w-[16ch]">
        This page has been left out.
      </h1>
      <p className="body-s mt-8 max-w-[38ch]">
        Like everything we design, only what earns its place makes the cut. The page you
        asked for is not one of them.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn">
          Back home
          <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
        </Link>
        <Link href="/shop" className="btn btn-outline">
          Shop the collection
        </Link>
      </div>
    </div>
  );
}
