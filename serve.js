import db from './db.json' with { type: 'json'}
import { bogbot } from 'https://esm.sh/gh/evbogue/bog5@5b22839/bogbot.js'

await bogbot.start('wiredovedbversion1')

if (!await bogbot.pubkey()) {
  const keypair = await bogbot.generate()
  await bogbot.put('keypair', keypair)
}

const pds = async (ws) => {
  ws.onopen = async () => {
    console.log('CONNECTED!')
  }
  ws.onmessage = async (m) => {
    console.log('RECEIVED:' + m.data)
    if (m.data.length === 44) {
      const latest = await bogbot.getLatest(m.data)
      if (latest) { ws.send(latest.sig) }
      const got = await bogbot.get(m.data)
      if (got) { ws.send(got) }
    }
    if (m.data.length != 44) {
      await bogbot.make(m.data)
      await bogbot.add(m.data)
    }
  }
  ws.onclose = () => {
    console.log('DISCONNECTED!')
  }
}

const dir = async (r) => {
  const url = new URL(r.url)
  const key = url.pathname.substring(1)
  const header = new Headers()
  header.append("Content-Type", "application/json")
  header.append("Access-Control-Allow-Origin", "*")
  if (db[key]) {
    const ar = db[key]
    return new Response(JSON.stringify(ar), {headers: header})
  }
  if (await bogbot.getLatest(key)) {
    const latest = await bogbot.getLatest(key)
    if (!latest.text) {
      const text = await bogbot.get(latest.opened.substring(13))
      latest.text = text.value
    }
    return new Response(JSON.stringify(latest), {headers: header})
  }
  else if (key != '' && await bogbot.query(key)) {
    const q = await bogbot.query(key)
    return new Response(JSON.stringify(q), {headers: header})
  } else {
    return new Response('Not found')
  }
}

Deno.serve(
  {port: 9000},
  //{
  //port: 443,
  //cert: await Deno.readTextFile("./../fullchain.pem"),
  //key: await Deno.readTextFile("./../key.pem"),
  //}, 
  async r => {
  try {
    const { socket, response } = Deno.upgradeWebSocket(r)
    await pds(socket)
    return response
  } catch (err) {}
  try {
    return await dir(r)
  } catch (err) {}
})
