# Fariborz Aref · Labs

**Sociology you can run.** Twelve interactive demonstrations in inequality and research methods, published at **[fariborzaref.github.io](https://fariborzaref.github.io/)**.

| | Lab | Demonstrations |
|---|---|---|
| Vol. I | [The Inequality Lab](https://fariborzaref.github.io/inequality) | The Birth Lottery · The Champagne Glass · The Lorenz Curve and the Gini · Redistribution by Welfare Regime · The Great Divergence |
| Vol. II | [The Methods Lab](https://fariborzaref.github.io/methods) | Simpson's Paradox · The Ecological Fallacy · What 95% Confidence Means · The Garden of Forking Paths · Between and Within · Twenty Years Are Not Twenty Observations · Twenty-Seven Countries, Many Variables |
| | [Courses](https://fariborzaref.github.io/courses) | Ten courses and a map of which demonstrations each one uses |

## Standards

- **Published data.** The Inequality Lab draws on the World Inequality Report, the OECD, the World Bank, the UN, UNDP, and the Maddison series. The source sits under every chart.
- **Stated assumptions.** Where a chart interpolates, approximates, or simulates, the note beneath it says how.
- **Built for teaching.** Each demonstration fits one class session and carries notes for instructors and a citation line.

## How it is built

No framework and no build step. GitHub Pages serves the files as they are.

| File | Role |
|---|---|
| `labs.css` | The visual system: type, colour tokens (light and dark), layout |
| `labs.js` | Shared helpers: charts, statistics, theme, navigation, citation copy |
| `inequality.js`, `methods.js` | The demonstrations |
| `sw.js`, `manifest.webmanifest` | Offline support and install as an app |

Type is set in Newsreader, Inter Tight, and JetBrains Mono. Every chart reads its colours from CSS variables, so the dark theme is complete.

## Cite

> Aref, F. (2026). *Labs: Interactive demonstrations in inequality and research methods* [Interactive website]. https://fariborzaref.github.io/

© Fariborz Aref · [fariborzaref.com](https://fariborzaref.com/) · [ORCID](https://orcid.org/0000-0001-6622-1824)
