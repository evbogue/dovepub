try {
  const keys = await fetch('http://localhost:8000/' + Deno.args[0]).then(a => a.json())
  console.log(keys)
} catch (err) {
  console.log('not found')
}
