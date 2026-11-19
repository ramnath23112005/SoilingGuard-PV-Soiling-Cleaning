import { announcement } from "@/lib/site";

export function AnnouncementBar() {
  return (
    <div className="bg-charcoal text-ivory">
      <p className="shell py-2.5 text-center text-[0.625rem] font-medium uppercase leading-none tracking-[0.22em] text-ivory/85 sm:text-[0.6875rem]">
        {announcement}
      </p>
    </div>
  );
}
