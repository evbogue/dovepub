import db from './db.json' with { type: 'json'}
import { bogbot } from 'https://esm.sh/gh/evbogue/bog5@1fd476c/bogbot.js'

await bogbot.start('wiredovedbversion1')

if (!await bogbot.pubkey()) {
  const keypair = await bogbot.generate()
  await bogbot.put('keypair', keypair)
}

const pubkey = await bogbot.pubkey()

const kv = await Deno.openKv()

const allEntries = await Array.fromAsync(kv.list({prefix:[]}));

for (const entry of allEntries) {
  await bogbot.make(entry.value)
  await bogbot.add(entry.value)
}

const log = await bogbot.query()

const pubkeys = await bogbot.getPubkeys()

Deno.serve({port: 9000, hostname: '127.0.0.1'}, async r => {
  try {
    const { socket, response } = Deno.upgradeWebSocket(r)

    socket.onopen = async () => {
      console.log('CONNECTED!')
    }
    socket.onmessage = async (m) => {
      console.log('RECEIVED:' + m.data) 
      if (m.data.length === 44) {
        const blob = await kv.get([m.data])
        const latest = await bogbot.getLatest(m.data)
        if (latest) {
          console.log(latest) 
          socket.send(latest.sig)
        }
        if (blob.value) { 
          //console.log('SENDING:' + blob.value)
          socket.send(blob.value)
        } else {console.log('do not have ' + m.data)}
      } else { 
        const hash = await bogbot.hash(m.data)
        await bogbot.add(m.data)
        await kv.set([hash], m.data)
      }
    }
    socket.onclose = () => { 
      // console.log('DISCONNECTED!')
    }

    return response
  } catch (err) {
    //console.log(err)
  }
  try {
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
      latest.text = await bogbot.get(latest.opened.substring(13))
      console.log(latest)
      return new Response(JSON.stringify(latest), {headers: header})
    }
    else if (await bogbot.query(key)) {
      const q = await bogbot.query(key)
      q.text = await bogbot.get(q.opened.substring(13))
      return new Response(JSON.stringify(q), {headers: header})
    } else {
      return new Response('Not found')
    }
  } catch (err) {
    console.log(err)
  }
})
