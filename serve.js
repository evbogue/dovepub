import db from './db.json' with { type: 'json'}

Deno.serve(r => {
  const url = new URL(r.url)
  const key = url.pathname.substring(1)
  const ar = db[key]
  const header = new Headers()

  header.append("Content-Type", "application/json")
  header.append("Access-Control-Allow-Origin", "*")

  return new Response(JSON.stringify(ar), {headers: header})
})
