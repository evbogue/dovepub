try {
  const keys = await fetch('https://pub.wiredove.net/' + Deno.args[0]).then(a => a.json())
  console.log(keys)
} catch (err) {
  console.log(err)
  console.log('not found')
}
