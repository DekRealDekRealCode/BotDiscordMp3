const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function uploadToSupabase(localPath, remotePath, contentType) {
  const fs = require("fs");
  const fileBuffer = fs.readFileSync(localPath);

  const { error } = await supabase.storage
    .from("youtube-files")
    .upload(remotePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("❌ Upload Error:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("youtube-files").getPublicUrl(remotePath);
  return data.publicUrl;
}

module.exports = { uploadToSupabase };
