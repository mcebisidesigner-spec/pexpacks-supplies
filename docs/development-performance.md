# Local development performance

The default `npm run dev` command uses Turbopack. Keep the repository and its
`.next` directory on a local SSD for fast cold compilation. Network drives,
cloud-synchronised folders, and real-time scanning of `.next` can add seconds
to every first route render.

Recommended workstation setup:

- Keep the checkout on a local SSD.
- Exclude only this checkout's `.next` directory from real-time antivirus
  scanning when company policy permits it.
- Use `npm run dev:webpack` only when diagnosing a Turbopack-specific issue.
- Remove this checkout's `.next` directory after changing Next.js versions or
  when static assets return 404; do not routinely clear it between runs.
