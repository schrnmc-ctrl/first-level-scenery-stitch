<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep editable embedded-game source in `game-src`; compile it in temporary staging to `public/game` so the TanStack wrapper stays independent.
- Select backgrounds, road gates, and object boundaries through `levelScenery` with a shared source-image/world cover transform so images and collisions stay aligned and exclusive to their stages.
- Keep campaign presentation in `CampaignScreens` with a logical 16:9 canvas, accessible matching controls, and one commented screen CONFIG; App coordinates fades while GameEngine owns gate validation and level completion so gameplay dimensions remain independent.
- Keep hero assets, sizing, animation frame selection, box collision helpers and life damage rules in the browser-safe `hero` module; GameEngine applies damage and GameRenderer preloads art and tracks displacement for animation so presentation stays independent of campaign screens.
- Keep Virus art trimming, sizing, attack timing and hitbox rules in the browser-safe `virus` module; the boss stage is campaign Level 3 and reuses Level 3 scenery through `levelScenery`.
