import db from './db.json' with { type: 'json'}

Deno.serve(r => {
  const url = new URL(r.url)
  const key = url.pathname.substring(1)
  const ar = db[key]
  return new Response(JSON.stringify(ar), {headers: {"Content-Type": "application/json"}})
})
