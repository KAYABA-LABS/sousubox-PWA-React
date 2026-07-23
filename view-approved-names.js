import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function viewApprovedNames() {
  const { data, error } = await supabase
    .from("approved_names")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching approved names:", error);
  } else {
    console.log("Approved Names:");
    console.table(data);
  }
}

viewApprovedNames();