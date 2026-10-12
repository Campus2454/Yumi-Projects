module.exports = {
    apps: [
      { name: "Camming", script: "yarn", args: "start", env: { FORCE_COLOR: "1" }, watch: false, },
      { name: "CammingTest", script: "yarn", args: "dev", env: { FORCE_COLOR: "1" }, watch: false, },
      { name: "CammingStatus", script: "yarn", args: "status", env: { FORCE_COLOR: "1" }, watch: false, },
      { name: "CammingClosing", script: "yarn", args: "closing", env: { FORCE_COLOR: "1" }, watch: false, },
    ]
  }
  