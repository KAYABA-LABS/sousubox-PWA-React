import { redirect } from "next/navigation";

export default function DiscoverPoolsRedirect() {
  redirect("/pools?tab=discover");
}
