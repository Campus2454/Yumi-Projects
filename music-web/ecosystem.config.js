module.exports = {
    apps: [
      { name: "AlisaWebPlayer", script: "npm", args: "run start", env: { FORCE_COLOR: "1" }, watch: false, },
      { name: "AlisaWebPlayerTest", script: "npm", args: "run dev", env: { FORCE_COLOR: "1" }, watch: false, },
    ]
  }
  