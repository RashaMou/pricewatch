config/
watches.json (your watch list)
providerUrls.json (endpoint templates + defaults)
secrets.example.env (document required env vars, not real secrets)
state.json (gitignored; runtime state)
src/
cli.ts (command wiring)
run.ts (main “watch run” logic)
providers/
garmin.ts
scuba.ts
index.ts (registry)
notifiers/
email.ts
state/
store.ts (read/write config/state.json)
types.ts
And add config/state.json to .gitignore.
