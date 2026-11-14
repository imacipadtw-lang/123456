/* The two web addresses of every screen: GitHub Pages (main) and the claude.ai page (backup).
   Both are updated together on every change. */
(function () {
  const L = (window.TC_LINKS = {
    github: "https://imacipadtw-lang.github.io/123456/english-quest/",
    claude: "https://claude.ai/artifact/EGDBXGnMnVbkMtdUMgWxjn",
  });
  L.gate = (g) => ({ github: L.github + "station.html?gate=" + g, claude: L.claude + "#gate-" + g });
  L.list = () => [
    ...[1, 2, 3, 4, 5, 6].map((g) => ({ key: "gate-" + g, gate: g, ...L.gate(g) })),
    { key: "final", github: L.github + "control.html", claude: L.claude + "#final" },
    { key: "opening", github: L.github + "opening.html", claude: L.claude + "#opening" },
    { key: "home", github: L.github, claude: L.claude },
  ];
})();
