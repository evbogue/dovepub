import db from './db.json' with { type: 'json'}
import { bogbot } from 'https://esm.sh/gh/evbogue/bog5@2ccd8e23a6/bogbot.js'

await bogbot.start('wiredovedbversion1')

if (!await bogbot.pubkey()) {
  const keypair = await bogbot.generate()
  await bogbot.put('keypair', keypair)
}

const pubkey = await bogbot.pubkey()

const kv = await Deno.openKv()

Deno.serve({port: 9000, hostname: '127.0.0.1'}, r => {
  try {
    const { socket, response } = Deno.upgradeWebSocket(r)

    socket.onopen = () => { 
      //console.log('CONNECTED!')
    }
    socket.onmessage = async (m) => {
      //console.log('RECEIVED:' + m.data) 
      if (m.data.length === 44) {
        const blob = await kv.get([m.data])
        if (blob.value) { 
          //console.log('SENDING:' + blob.value)
          socket.send(blob.value)
        } else {console.log('do not have it')}
      } else { 
        const hash = await bogbot.hash(m.data)
        await kv.set([hash], m.data)
      }
    }
    socket.onclose = () => { 
      // console.log('DISCONNECTED!')
    }

    return response
  } catch (err) {
    console.log(err)
    const url = new URL(r.url)
    const key = url.pathname.substring(1)
    const ar = db[key]
    const header = new Headers()

    header.append("Content-Type", "application/json")
    header.append("Access-Control-Allow-Origin", "*")

    return new Response(JSON.stringify(ar), {headers: header})
  }
})
