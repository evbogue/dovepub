# Dovepub

**WARNING UNMAINTAINED REPO.** All of the code in this repo has been integrated into [APDS](https://github.com/evbogue/apds). Please visit that repo and check it out. 

A pubkey directory for [Wiredove](https://github.com/evbogue/wiredove)

In the [Bog5 protocol](https://github.com/evbogue/bog5) users are identified via their pubkeys. However,

1. Pubkeys are difficult to remember
1. Some users use many keys
1. People lose private keys

Dovepub aims to solve this issue by harnessing [Zooko's Triangle](https://en.wikipedia.org/wiki/Zooko%27s_triangle) on the human-meaningful-end by adding a centralized pubkey directory to Wiredove.

Right now handles are stored in the `db.json` file, but we could create a web 2.0 username and password system on top of this if it becomes popular.

Usage web: https://pub.wiredove.net/ev

Usage JavaScript:
```
const keys = await fetch('https://pub.wiredove.net/ev')
console.log(await keys.json())
```

Using CLI
```
deno run -A example ev
```

Returns:

```
[
  "EVxe89AeRwmTT0hfrT7sHe0wAuzvH9Yvg9TFUgqPh4M=",
  "evV0NdGf55+k5xho0oLB9zINdI+cfQ+iUTDeK49Ml8U="
]
```

To add your pubkey please add it to `db.json` with your desired handle and file a pull request.

---
MIT
