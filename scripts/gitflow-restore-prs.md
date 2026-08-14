# Восстановление GitFlow: 19 Pull Request'ов

## Проблема

19 feature-веток были **смержены локально** и запушены напрямую в `develop` — без PR на GitHub.

## Решение

1. Откатить `develop` до коммита **до** прямых merge (`a7581a3`)
2. Открыть **19 PR** по порядку (ветки уже на GitHub)
3. Смержить каждый PR через GitHub UI
4. После всех 19 — смержить PR `feature/ui-polish`

---

## Шаг 1 — откат develop (один раз, нужны права maintainer)

```bash
git checkout develop
git reset --hard a7581a3
git push --force-with-lease origin develop
```

> `--force-with-lease` безопаснее `--force`: не перезапишет, если кто-то успел запушить новые коммиты.

---

## Шаг 2 — открыть PR по порядку

Base branch для всех: **`develop`**

| # | Ветка | Ссылка для создания PR |
|---|-------|------------------------|
| 1 | `feature/project-setup` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/project-setup?expand=1 |
| 2 | `feature/fsd-aliases` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/fsd-aliases?expand=1 |
| 3 | `feature/docker` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/docker?expand=1 |
| 4 | `feature/shared-ui` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/shared-ui?expand=1 |
| 5 | `feature/track-entity` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/track-entity?expand=1 |
| 6 | `feature/audio-engine` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/audio-engine?expand=1 |
| 7 | `feature/jamendo-api` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/jamendo-api?expand=1 |
| 8 | `feature/playlist` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/playlist?expand=1 |
| 9 | `feature/upload-track` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/upload-track?expand=1 |
| 10 | `feature/toggle-playback` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/toggle-playback?expand=1 |
| 11 | `feature/seek-track` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/seek-track?expand=1 |
| 12 | `feature/audio-provider` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/audio-provider?expand=1 |
| 13 | `feature/track-search-widget` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/track-search-widget?expand=1 |
| 14 | `feature/playlist-panel` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/playlist-panel?expand=1 |
| 15 | `feature/audio-visualizer` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/audio-visualizer?expand=1 |
| 16 | `feature/player-bar` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/player-bar?expand=1 |
| 17 | `feature/app-shell` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/app-shell?expand=1 |
| 18 | `feature/storybook` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/storybook?expand=1 |
| 19 | `feature/unit-tests` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/unit-tests?expand=1 |
| 20 | `feature/ui-polish` | https://github.com/wuliiao/harmony-hub/compare/develop...feature/ui-polish?expand=1 |

**Важно:** мерджи строго по порядку — каждый следующий PR зависит от предыдущего.

---

## Шаг 3 — шаблон PR

**Title:** как в commit message ветки (например `chore: add project dependencies and configuration`)

**Body:**
```markdown
## Summary
- <что делает эта feature-ветка>

## Test plan
- [ ] `pnpm build`
- [ ] `pnpm test` (если применимо)
```

---

## Шаг 4 — после всех PR

```bash
git checkout develop
git pull origin develop
# develop снова содержит весь код + ui-polish после PR #20
```

---

## Что уже сделано

- [x] Все 19 feature-веток запушены на GitHub
- [x] `feature/ui-polish` запушена отдельно
- [ ] Откат `develop` → `a7581a3` (нужно выполнить вручную или с approve)
- [ ] 20 PR созданы и смержены через GitHub

---

## Альтернатива (без force push)

Если откатывать `develop` нельзя (защита ветки, другие разработчики):

1. Оставить `develop` как есть
2. Для **новых** задач — только через PR
3. Ревьюеру показать этот документ + таблицу веток как доказательство декомпозиции

Retroactive PR без отката **невозможны** — GitHub не создаст PR для уже смерженного кода.
