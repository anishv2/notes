# Frontend Developer (5 YOE) Interview Guide: React + Next.js (Expanded Edition)

**How to use:** At 5 YOE, interviewers test *depth and judgment*, not definitions. For every answer: **what it is → why it exists → trade-off → real example from your work.**

**Expanded sections (deep dives):** 3B React internals & advanced hooks, 6B Performance, 7B Next.js, 11B Frontend system design. Question IDs in deep dives use prefixes **D** (React internals), **P** (performance), **N** (Next.js). Other sections are unchanged from the first edition.

---

## 1. JavaScript / TypeScript Core

**Q1. Explain closures with a practical use.**
A function that remembers variables from its lexical scope after the outer function returns. Used in hooks, memoization, debounce.
```js
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
```
*Follow-up trap:* `var` in a loop with `setTimeout` prints the same value; `let` creates a new binding per iteration.

**Q2. Event loop: microtasks vs macrotasks?**
Call stack runs first, then all microtasks (Promises, `queueMicrotask`), then one macrotask (`setTimeout`, I/O), repeat.
```js
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4); // 1 4 3 2
```

**Q3. `this`, `call/apply/bind`, arrow functions?**
`this` depends on the call site. Arrow functions capture `this` lexically and can't be rebound. `bind` returns a new function; `call/apply` invoke immediately.

**Q4. Prototype vs class inheritance?**
Classes are syntactic sugar over prototype chains. Objects delegate property lookups up `__proto__`.

**Q5. `==` vs `===`, `null` vs `undefined`, `Object.is`?**
`==` coerces types. `Object.is(NaN, NaN)` is true and `Object.is(0, -0)` is false. React uses `Object.is` for state and dependency comparison.

**Q6. Promise combinators?**
`all` (fails fast), `allSettled` (never rejects), `race` (first settled), `any` (first fulfilled).

**Q7. Immutability: shallow vs deep copy?**
Spread/`Object.assign` are shallow. Use `structuredClone` for deep copies. React relies on new references to detect change.

**Q8. Other must-knows:** hoisting and TDZ, `map/filter/reduce`, destructuring, optional chaining, ES modules vs CommonJS, generators, `WeakMap`, debounce vs throttle, currying.

**TypeScript**

**Q9. `type` vs `interface`?** Interfaces support declaration merging and `extends`; types support unions, intersections, mapped and conditional types. Use interface for object shapes and public APIs, type for everything else.

**Q10. Explain generics with a React example.**
```tsx
function List<T>({ items, render }: { items: T[]; render: (i: T) => React.ReactNode }) {
  return <ul>{items.map((i, idx) => <li key={idx}>{render(i)}</li>)}</ul>;
}
```

**Q11. Utility types?** `Partial`, `Required`, `Pick`, `Omit`, `Record`, `ReturnType`, `Awaited`. Also know `unknown` vs `any` (unknown forces narrowing), discriminated unions, and `satisfies`.
```ts
type State = { status: "loading" } | { status: "ok"; data: User } | { status: "error"; error: string };
```

---

## 2. React Fundamentals

**Q12. What is the Virtual DOM and reconciliation?**
React builds a tree of elements, diffs it against the previous tree, and applies minimal DOM updates. Heuristics: different element types get a full remount; siblings are matched by `key`.

**Q13. Why are `key`s important? Why not use index?**
Keys give identity across renders. Index keys break when items reorder, insert, or delete, causing wrong state (e.g., input values sticking to the wrong row). Use stable IDs.

**Q14. Controlled vs uncontrolled components?**
Controlled: React state drives the value (`value` + `onChange`). Uncontrolled: DOM holds the value, read via `ref`. Uncontrolled is simpler and faster for big forms (React Hook Form uses it).

**Q15. What triggers a re-render?**
State change, parent re-render, context value change. Props changing alone don't trigger it; the parent re-rendering does. `React.memo` skips a child if props are shallow-equal.

**Q16. Lifting state vs composition vs context?**
Lift state to the nearest common parent. Use composition (`children`) to avoid prop drilling first. Use context for truly global, rarely-changing data (theme, auth).

**Q17. React 18/19 highlights?**
Automatic batching, concurrent rendering, `useTransition`, `useDeferredValue`, Suspense for data, `useId`, `useSyncExternalStore`. React 19: Actions, `use()`, `useActionState`, `useOptimistic`, `ref` as a prop, Server Components stable, React Compiler (auto-memoization).

---

## 3. Hooks (Beginner → Advanced)

**Q18. Rules of hooks and why?**
Call at top level, only in components/custom hooks. React tracks hooks by call order in a linked list; conditionals break that order.

**Q19. `useEffect` vs `useLayoutEffect`?**
`useEffect` runs after paint; `useLayoutEffect` runs after DOM mutation but before paint (measure layout, avoid flicker).

**Q20. Stale closure bug: explain and fix.**
```jsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000); // stale `count`
  return () => clearInterval(id);
}, []);
// Fix: functional update
setCount(c => c + 1);
```

**Q21. `useMemo` vs `useCallback` vs `React.memo`?**
`useMemo` caches a value, `useCallback` caches a function identity, `React.memo` caches a component render. Only use them when there's a measured cost or a referential-equality need (memoized child, effect dependency). Premature memoization adds overhead.

**Q22. `useRef` uses?**
DOM access, mutable value persisting across renders without triggering re-render (timers, previous value, latest callback).

**Q23. `useReducer` vs `useState`?**
Use a reducer for complex, related state or when next state depends on transitions. It's easy to test and works well with context.

**Q24. Write a custom hook: `useDebounce` and `useFetch` with cleanup.**
```jsx
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function useFetch(url) {
  const [state, set] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    const ctrl = new AbortController();
    set(s => ({ ...s, loading: true }));
    fetch(url, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => set({ data, error: null, loading: false }))
      .catch(e => e.name !== "AbortError" && set({ data: null, error: e, loading: false }));
    return () => ctrl.abort(); // prevents race conditions
  }, [url]);
  return state;
}
```

**Q25. Do you need `useEffect` for this?** (Senior favorite)
No, for derived data (compute in render), event-driven logic (use handlers), or resetting state on prop change (use `key`). Effects are for syncing with *external* systems. See "You Might Not Need an Effect".

**Q26. `useTransition` / `useDeferredValue`?**
Mark updates as non-urgent so typing stays responsive while a heavy list re-renders.
```jsx
const [isPending, startTransition] = useTransition();
onChange={e => { setQuery(e.target.value); startTransition(() => setFilter(e.target.value)); }}
```

**Q27. Why does Strict Mode run effects twice in dev?** To surface missing cleanup and impure logic. Effects must be resilient to mount, unmount, remount.

---

## 3B. Deep Dive: How React Actually Works (Expanded)

> Why this matters: at 5 YOE, "why did this re-render / why is this value stale / why did the effect run twice?" separates seniors from mid-level. All of these come from understanding the render → commit lifecycle.

### The mental model

```
Trigger (setState / parent render / context change)
   ↓
RENDER PHASE  (pure; may be paused, restarted or thrown away in concurrent mode)
   call components → build new element tree → diff vs current Fiber tree
   ↓
COMMIT PHASE  (synchronous, cannot be interrupted)
   1. DOM mutations
   2. useLayoutEffect (cleanup of old, then run new)   ← before paint
   3. Browser paints
   4. useEffect (cleanup of old, then run new)         ← after paint
```

**D1. Explain the render phase vs commit phase. Why must render be pure?**
Render only *calculates* what the UI should look like; commit *applies* it. In concurrent React, a render can be interrupted, restarted or discarded (e.g., a higher-priority update arrives, or Suspense). If render has side effects (mutating outside variables, network calls, `Math.random()` used for output), they can run multiple times or for output that is never shown. Strict Mode double-invokes render in dev to expose this.

**D2. What is Fiber?**
Fiber is React's internal reconciler architecture. Each component instance is a *fiber node* (a plain object with `type`, `props`, `state`, `child`, `sibling`, `return`) forming a linked-list tree. Because work is split into units per fiber, React can yield to the browser between units, assign priorities ("lanes"), and keep two trees (**current** and **work-in-progress**, "double buffering") so it can build the next UI off-screen and swap on commit. You don't need to recite internals; you need to explain *what it enables*: interruptible rendering, `useTransition`, Suspense.

**D3. Effect ordering: in what order do effects and cleanups run?**
Children before parents (for both effects and layout effects). On update, *all* cleanups of changed effects run before *any* new effect body. On unmount, cleanups run. Effects with unchanged deps are skipped.
```jsx
function Child() {
  useEffect(() => { console.log("child effect"); return () => console.log("child cleanup"); });
  return null;
}
function Parent() {
  useEffect(() => { console.log("parent effect"); return () => console.log("parent cleanup"); });
  return <Child />;
}
// mount: child effect → parent effect
// rerender: child cleanup → parent cleanup → child effect → parent effect
```

**D4. State is a snapshot. What does this print / render?** (Classic)
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  function handle() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    console.log(count);   // 0  (snapshot of THIS render)
  }
  // After click: count === 1, not 3
}
```
Every render has its own `count`; `setCount` schedules the next render. Fix with updater functions: `setCount(c => c + 1)` ×3 gives 3. Follow-up: *"What's the difference between `setCount(5)` and `setCount(c => 5)`?"* (none in result; the updater form just reads the latest queued state).

**D5. Automatic batching. What changed in React 18?**
React 17 batched only inside React event handlers. React 18 batches *all* updates (promises, `setTimeout`, native events) into one render. Opt out with `flushSync` (rare: e.g., measuring DOM right after update).

**D6. A component defined inside another component. What's the bug?**
```jsx
function Parent() {
  const [n, setN] = useState(0);
  const Child = () => <input />;      // NEW function identity every render
  return <><button onClick={() => setN(n + 1)}>+</button><Child /></>;
}
```
React compares element `type` by reference. New `Child` each render means a different type, so React unmounts and remounts it: state and focus are lost. Define components at module level, or pass data via props.

**D7. Reset a component's state when a prop changes: without an effect.**
Use `key`. Changing `key` tells React "this is a different component instance."
```jsx
<ProfileForm key={userId} userId={userId} />   // state resets whenever userId changes
```
This is the correct answer to "should I `useEffect` to reset state?" (No.)

**D8. Race condition in a data-fetching effect. Explain and fix.**
Typing "a", then "ab" fires two requests; if "a" returns *after* "ab", the UI shows the wrong result.
```jsx
useEffect(() => {
  let ignore = false;                       // flag per effect run
  fetchResults(query).then(res => { if (!ignore) setResults(res); });
  return () => { ignore = true; };          // cleanup marks the stale run
}, [query]);
// Better: AbortController to actually cancel; best: TanStack Query, which handles it for you.
```

**D9. Dependency array pitfalls: objects, functions, and `useEffectEvent`.**
Objects/functions created in render are new every time, so an effect depending on them re-runs every render. Fixes, in order of preference: move them inside the effect; move them out of the component; derive a primitive; `useMemo`/`useCallback` as a last resort.
When an effect needs the *latest* value of something without re-syncing when it changes (e.g., logging with the current theme inside a connection effect), React 19.2 provides `useEffectEvent`:
```jsx
const onConnected = useEffectEvent(() => showToast(`Connected (${theme})`));
useEffect(() => {
  const conn = createConnection(roomId);
  conn.on("connected", onConnected);        // reads latest `theme`, not a dependency
  conn.connect();
  return () => conn.disconnect();
}, [roomId]);
```
Never silence `react-hooks/exhaustive-deps`; restructure instead.

**D10. What is `useSyncExternalStore` and why does it exist?**
It subscribes React to an *external* store (Redux, Zustand, `window.matchMedia`, `navigator.onLine`) safely under concurrent rendering, preventing **tearing** (different components in the same render reading different store versions). It requires `getSnapshot` to return a *cached/stable* value, otherwise you get an infinite loop.
```jsx
function useOnline() {
  return useSyncExternalStore(
    (cb) => { addEventListener("online", cb); addEventListener("offline", cb);
              return () => { removeEventListener("online", cb); removeEventListener("offline", cb); }; },
    () => navigator.onLine,
    () => true                                  // server snapshot (SSR)
  );
}
```

**D11. React 19 Actions: `useActionState`, `useOptimistic`, `use`, `useFormStatus`.**
```jsx
function LikeButton({ likes, like }) {
  const [optimisticLikes, addOptimistic] = useOptimistic(likes, (n) => n + 1);
  const [error, action, isPending] = useActionState(async (_prev, formData) => {
    addOptimistic();                        // instant UI
    try { await like(formData.get("id")); return null; }
    catch (e) { return "Failed to like"; } // optimistic value auto-reverts
  }, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value="42" />
      <button disabled={isPending}>♥ {optimisticLikes}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```
`use(promise)` reads a promise during render (suspends until resolved) and `use(context)` can be called conditionally, unlike `useContext`. `useFormStatus` gives a child of a `<form>` its pending state.

**D12. React Compiler: does it make `useMemo`/`useCallback` obsolete?**
The compiler auto-memoizes components and hooks at build time, provided your code follows the Rules of React (pure render, no mutation of props/state). For new code you can mostly stop hand-writing memoization; keep `useMemo` where you need a *stable identity for semantic reasons* (effect dependency) or the compiler bails out. Existing manual memoization keeps working. Answer with trade-offs, not hype.

**D13. Predict the output (Strict Mode, dev).** 
```jsx
function App() {
  useEffect(() => { console.log("mount"); return () => console.log("unmount"); }, []);
  return null;
}
// Dev + StrictMode logs: mount → unmount → mount
```
Interview point: this simulates a component being hidden and re-shown (e.g., Activity / Offscreen). If double-run breaks your code (double analytics event, double subscription), your effect lacks proper cleanup.

**D14. Common "why is it re-rendering?" checklist.**
1. Parent re-rendered and the child isn't memoized.
2. Context value changed (new object each render).
3. Inline object/array/function props defeating `React.memo`.
4. State stored too high in the tree (colocate it lower).
5. Store subscription without a selector (subscribes to the whole store).
6. `key` changing (remount, not re-render).

---

## 4. Advanced React Patterns

**Q28. Context performance problem?**
Every consumer re-renders when the value changes. Fixes: split contexts (state vs dispatch), memoize the value, or use a store with selectors (Zustand, `useSyncExternalStore`).

**Q29. Patterns: HOC, render props, compound components, custom hooks?**
Custom hooks replaced most HOCs and render props. Compound components (`<Tabs><Tabs.List/>…`) share implicit state via context, giving a flexible API.

**Q30. Error boundaries?**
Class components with `getDerivedStateFromError` / `componentDidCatch` (or `react-error-boundary`). They catch render and lifecycle errors, *not* event handlers, async code, or SSR errors.

**Q31. Portals, Suspense, `lazy`?**
Portals render outside the parent DOM (modals) while keeping React tree and event bubbling. `React.lazy` + `Suspense` for code splitting.

**Q32. Refs: `forwardRef`, `useImperativeHandle`?** Expose a limited imperative API (e.g., `focus()`) to a parent. In React 19, `ref` is a normal prop.

**Q33. Concurrent rendering in one line?** React can pause, interrupt, and resume renders so urgent updates (typing) preempt non-urgent ones.

**Q34. Design a reusable Modal / Dropdown / Table.** Cover accessibility (focus trap, `aria-*`, Esc), portal, controlled + uncontrolled API, composition, keyboard support, and virtualization for tables.

---

## 5. State Management & Data Fetching

**Q35. How do you choose a state solution?**
| State type | Tool |
|---|---|
| Local UI | `useState` / `useReducer` |
| Server/cache | TanStack Query, SWR, RSC |
| Global client | Zustand, Redux Toolkit, Jotai |
| URL state | `searchParams` / router |
| Form | React Hook Form + Zod |

**Q36. Why TanStack Query over Redux for API data?**
Caching, dedupe, background refetch, stale-while-revalidate, retries, pagination, and optimistic updates for free. Redux is for client state.

**Q37. Optimistic update flow?** Update the cache immediately (`onMutate`), snapshot previous data, roll back on error (`onError`), invalidate on settle.

**Q38. Redux Toolkit vs Zustand?** RTK: structure, devtools, large teams, middleware. Zustand: minimal boilerplate, selector-based subscriptions, small/medium apps.

---

## 6. Performance Optimization

**Q39. How do you diagnose a slow React app?**
1) React DevTools Profiler (why did it render). 2) Chrome Performance tab (long tasks). 3) Lighthouse / Web Vitals. 4) Bundle analyzer. Fix the measured bottleneck only.

**Q40. Optimization toolbox?**
- Avoid unnecessary renders: `memo`, move state down, split components, pass `children`.
- Virtualize long lists (`react-window`, TanStack Virtual).
- Code split (`lazy`, dynamic import), tree-shake, and analyze bundle.
- Images: `next/image`, modern formats, lazy loading.
- Debounce input, `useTransition` for heavy updates.
- Move work to the server (RSC), Web Workers for CPU tasks.

**Q41. Core Web Vitals?**
LCP (loading, <2.5s), INP (interactivity, <200ms; replaced FID), CLS (layout shift, <0.1). Improve LCP with priority images and SSR/SSG; INP by breaking long tasks; CLS by reserving image/font space.

**Q42. Memoization example where it *doesn't* help:** memoized child receiving an inline object/function prop; the reference changes every render so `memo` is useless without `useMemo`/`useCallback`.

---

## 6B. Performance Deep Dive (Expanded)

> Interviewers want a **method** ("measure → find bottleneck → fix → verify"), not a list of tricks. Always quote numbers from your own projects.

**P1. "Typing in a search box is laggy." Walk me through your approach.**
1. **Reproduce and measure.** Chrome DevTools Performance tab with 4× CPU throttle; look for long tasks (>50 ms) after each keystroke. React Profiler: which components re-rendered and *why* ("Props changed", "Hooks changed", "Parent rendered").
2. **Identify the class of problem.**
   - Too many components re-rendering, so colocate state or memoize.
   - One expensive render (filtering 10k items), so `useMemo`, virtualization, or move work off the main thread.
   - Expensive handlers or layout thrash, so debounce, batch reads/writes.
3. **Fix the biggest item first**, re-measure, and stop when the metric (INP) is within budget.
```jsx
// Before: every keystroke re-renders the whole list
function Page() {
  const [query, setQuery] = useState("");
  return (<><input value={query} onChange={e => setQuery(e.target.value)} /><HugeList items={items} filter={query} /></>);
}

// After: urgent input update + deferred list update
function Page() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);              // list lags behind, input stays instant
  return (<><input value={query} onChange={e => setQuery(e.target.value)} /><HugeList items={items} filter={deferred} /></>);
}
const HugeList = memo(function HugeList({ items, filter }) { /* filtered via useMemo, virtualized */ });
```

**P2. State colocation and "children as props": fix re-renders without `memo`.**
```jsx
// Slow: `position` state in App re-renders <ExpensiveTree /> on every mousemove
function App() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}><Dot pos={pos} /><ExpensiveTree /></div>;
}

// Fast (option A): move state into the component that needs it
function MovingDot() { const [pos, setPos] = useState({x:0,y:0}); return <div onMouseMove={...}><Dot pos={pos} /></div>; }

// Fast (option B): pass the expensive part as children (same element reference, so React skips it)
function Tracker({ children }) { const [pos, setPos] = useState({x:0,y:0}); return <div onMouseMove={...}><Dot pos={pos} />{children}</div>; }
<Tracker><ExpensiveTree /></Tracker>
```
This is often *better* than `memo` because it removes the cost instead of caching around it.

**P3. Virtualizing a 10,000-row list.**
Only render rows visible in the viewport (+ small overscan). Libraries: TanStack Virtual, react-window. Trade-offs: breaks browser find (Ctrl+F), needs fixed/estimated row heights, careful accessibility (`aria-rowcount`, `aria-rowindex`).
```jsx
import { useVirtualizer } from "@tanstack/react-virtual";
function VirtualList({ rows }) {
  const parentRef = useRef(null);
  const v = useVirtualizer({ count: rows.length, getScrollElement: () => parentRef.current, estimateSize: () => 48, overscan: 8 });
  return (
    <div ref={parentRef} style={{ height: 600, overflow: "auto" }}>
      <div style={{ height: v.getTotalSize(), position: "relative" }}>
        {v.getVirtualItems().map(item => (
          <div key={item.key} style={{ position: "absolute", top: 0, transform: `translateY(${item.start}px)`, height: item.size }}>
            {rows[item.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**P4. Reducing JavaScript bundle size: a concrete checklist.**
- **Measure:** `@next/bundle-analyzer` / `source-map-explorer` / `vite-bundle-visualizer`. Look for the biggest chunks and duplicates.
- **Split:** route-level splitting is automatic in Next; use `next/dynamic` or `React.lazy` for heavy, below-the-fold or interaction-triggered components (charts, editors, modals).
- **Right-size dependencies:** replace `moment` with `date-fns`/`dayjs`; import `lodash-es` functions individually; avoid barrel-file imports that defeat tree-shaking (Next's `experimental.optimizePackageImports` helps).
- **Ship less JS:** use Server Components for non-interactive UI; avoid client-side state libraries for server data.
- **Third-party scripts:** load with `next/script` (`lazyOnload`), or move to a worker (Partytown); analytics/chat widgets are frequent LCP/INP offenders.
- **Verify** with a performance budget in CI (Lighthouse CI, `size-limit`).

**P5. How do you improve INP (Interaction to Next Paint)?**
INP measures the worst-ish latency from user input to the next paint. Culprits: long tasks blocking the main thread, expensive re-renders, layout thrash, heavy third-party scripts.
- Break long tasks: yield with `await scheduler.yield()` (fallback: `setTimeout(0)`), chunk work.
- Use `startTransition` / `useDeferredValue` for non-urgent updates.
- Do the minimal work synchronously in the handler (update the visible state first), defer analytics.
- Move CPU-heavy work to a **Web Worker** (parsing, sorting big data, image processing).
- Avoid forced synchronous layout: don't interleave DOM reads (`offsetHeight`) and writes in loops.

**P6. Improving LCP for a Next.js product page.**
1. Identify the LCP element (DevTools "LCP" marker), usually the hero image.
2. `next/image` with `priority` (adds preload + `fetchpriority="high"`), correct `sizes` so mobile doesn't download desktop images, AVIF/WebP.
3. Render HTML on the server (SSG/ISR/streaming); don't fetch hero data client-side.
4. Remove render-blocking resources; `next/font` with `display: swap` and preload.
5. Cut TTFB: CDN caching, ISR, avoid slow waterfall queries (parallelize).
6. Don't lazy-load the LCP image (a very common mistake).

**P7. Prevent layout shift (CLS).**
Reserve space: explicit `width`/`height` or `aspect-ratio` on images/video/embeds; skeletons with the same dimensions as content; font metric overrides (`next/font` does this); never inject banners above existing content; animate with `transform`/`opacity` only.

**P8. Memory leaks in React apps: causes and detection.**
Causes: un-removed event listeners, timers/intervals, subscriptions (WebSocket, observers), closures holding large objects, unbounded caches/arrays, detached DOM nodes.
Detect: Chrome DevTools → Memory → take heap snapshots before/after repeating an action (navigate to a page and back several times); look for growing "Detached HTMLElement" and retained listeners. Fix: cleanup functions in effects, `AbortController`, bounded caches (LRU).

**P9. Measuring in production: RUM vs lab.**
Lab (Lighthouse) is reproducible but synthetic. **Real User Monitoring** uses the `web-vitals` library sent to analytics / `useReportWebVitals` in Next.js; look at **p75** by device and route. Field data (CrUX) is what Google uses for ranking. Alert on regressions after deploys.
```js
import { onLCP, onINP, onCLS } from "web-vitals";
[onLCP, onINP, onCLS].forEach(fn => fn(m => navigator.sendBeacon("/api/vitals", JSON.stringify(m))));
```

**P10. When NOT to optimize.**
If it's not measured, not user-visible, or costs readability for microseconds. Say this in the interview; it signals maturity. ("I profile first; the last time I memoized everything by default it made the code noisier and gave no measurable gain.")

---

## 7. Next.js (App Router focus)

**Q43. Pages Router vs App Router?**
App Router (`app/`) uses nested layouts, Server Components by default, streaming, `loading.tsx`/`error.tsx`, Server Actions, and route handlers. Pages Router uses `getServerSideProps` / `getStaticProps`.

**Q44. Server Components vs Client Components?**
Server Components run only on the server: zero JS shipped, direct DB/secret access, can be `async`. Client Components (`"use client"`) handle state, effects, and browser APIs. Push `"use client"` as deep as possible (leaf components). Pass Server Components as `children` into Client Components.

```tsx
// app/products/page.tsx (Server Component)
export default async function Page() {
  const products = await db.product.findMany();
  return <ProductList products={products} />;
}
```

**Q45. Rendering strategies: SSG, SSR, ISR, CSR, PPR?**
| Strategy | When | How |
|---|---|---|
| SSG | Marketing, docs | Static at build |
| ISR | Catalogs, blogs | `revalidate` interval or on-demand |
| SSR | Personalized, real-time | Dynamic per request (cookies/headers, `no-store`) |
| CSR | Dashboards behind auth | Client fetch |
| PPR | Static shell + dynamic holes | Suspense boundaries |

**Q46. Caching layers in Next.js?**
Request memoization (dedupe same `fetch` in one render), Data Cache (`fetch` results), Full Route Cache (static HTML/RSC payload), Router Cache (client-side). Behavior differs between Next 14 and 15+ (fetch no longer cached by default in 15), so state your version and verify in the docs. Revalidate with `revalidatePath` / `revalidateTag`.

**Q47. Server Actions?**
Async functions marked `"use server"` callable from forms/components; they run on the server, support progressive enhancement, and pair with `useActionState`/`useOptimistic`. Always validate input and authorize inside the action, since it's a public endpoint.
```tsx
"use server";
export async function addTodo(formData: FormData) {
  const title = z.string().min(1).parse(formData.get("title"));
  await db.todo.create({ data: { title } });
  revalidatePath("/todos");
}
```

**Q48. Routing features?** Dynamic (`[id]`), catch-all (`[...slug]`), route groups `(group)`, parallel routes `@slot`, intercepting routes (modal on link click), `generateStaticParams`, `notFound()`, `redirect()`.

**Q49. Middleware use cases?** Auth redirects, i18n, A/B tests, headers. Runs on the Edge before a request completes; keep it light (no heavy Node APIs). Don't rely on middleware alone for authorization; check again at the data layer.

**Q50. Data fetching patterns?** Fetch in Server Components; parallelize with `Promise.all` to avoid waterfalls; stream with `<Suspense>` + `loading.tsx`; preload data; use route handlers (`app/api/x/route.ts`) for webhooks/public APIs.

**Q51. What is hydration and a hydration mismatch?**
Hydration attaches event handlers to server HTML. A mismatch happens when server and client output differ (e.g., `Date.now()`, `window`, random). Fix by moving logic into `useEffect`, using `suppressHydrationWarning` sparingly, or dynamic import with `ssr: false`.

**Q52. SEO and metadata?** `metadata` / `generateMetadata`, `sitemap.ts`, `robots.ts`, canonical URLs, Open Graph, structured data (JSON-LD), and SSR/SSG for crawlable content.

**Q53. `next/image`, `next/font`, `next/script`?** Automatic resizing, lazy loading, and CLS prevention; self-hosted fonts with no layout shift; script loading strategies (`afterInteractive`, `lazyOnload`).

**Q54. Authentication in Next.js?** Auth.js (NextAuth) / Clerk / custom JWT or session cookies. Store tokens in `httpOnly`, `Secure`, `SameSite` cookies (not localStorage). Check sessions in Server Components/actions and middleware.

**Q55. Deployment and env?** Vercel vs self-hosted (`output: "standalone"`, Docker). `NEXT_PUBLIC_` vars are exposed to the browser; others stay server-side. Know ISR/edge runtime limitations when self-hosting.

---

## 7B. Next.js Deep Dive (Expanded)

> **Version note:** Next.js behavior changed across 13 → 14 → 15 → 16. Caching defaults were relaxed in 15, and newer releases move toward explicit opt-in caching (`"use cache"` / Cache Components) and rename `middleware` to `proxy`. In an interview, **say which version you used** and mention you verify against the official docs for the version in the job description.

### N1. How do Server Components actually work?

1. On the server, React renders the Server Component tree into a special streamed format, the **RSC payload**. It contains rendered output for Server Components and *references* (module id + chunk) for Client Components, with their serialized props.
2. The server also produces initial **HTML** from that same tree for a fast first paint (SSR of both server and client components).
3. In the browser, the RSC payload is used to reconcile the React tree; Client Components' JS is loaded and **hydrated** to become interactive. Server Component code is never shipped.
4. On client navigation, Next fetches only the new RSC payload for changed segments (layouts persist), not a full HTML page.

**Server vs Client: decision table**

| Need | Server Component | Client Component |
|---|---|---|
| Fetch data, read DB/secrets | Yes | No (use API / actions) |
| `useState`, `useEffect`, event handlers | No | Yes |
| Browser APIs (`window`, `localStorage`) | No | Yes |
| Reduce JS bundle | Yes | Costs JS |
| Context providers | No | Yes |

**N2. The server/client boundary: rules and gotchas.**
- `"use client"` marks a *boundary*: that module and everything it **imports** becomes client code. It's not needed in each child file.
- **Props crossing the boundary must be serializable** (primitives, plain objects/arrays, Date, Map/Set, promises, JSX, Server Actions). You **cannot** pass ordinary functions or class instances from server to client.
- A Client Component can render Server Components passed as `children`/props (they're already rendered on the server):
```tsx
// app/layout.tsx (Server)
<ThemeProvider>          {/* "use client" provider */}
  {children}             {/* Server Components remain server-rendered */}
</ThemeProvider>
```
- Protect server-only modules: `import "server-only"` makes the build fail if a client file imports it (prevents leaking secrets).
- Third-party components using hooks need a small `"use client"` wrapper file.
- Push `"use client"` to the **leaves**: a `<LikeButton />`, not the whole page.

### N3. Caching in depth (the question that filters candidates)

Four layers exist (App Router, classic model):

| Layer | What | Where | Scope | Invalidate with |
|---|---|---|---|---|
| Request Memoization | Dedupes identical `fetch` (and `cache()`-wrapped) calls | Server, per request | Single render pass | Automatic |
| Data Cache | Persisted `fetch` results | Server | Across requests/deploys | `revalidateTag`, `revalidatePath`, `revalidate` time |
| Full Route Cache | Rendered HTML + RSC payload of static routes | Server | Across requests | Revalidation / redeploy |
| Router Cache | RSC payload of visited/prefetched segments | Client (browser memory) | User session | `router.refresh()`, revalidation via actions, time-based expiry |

Key points to state:
- **Next 15 changed defaults:** `fetch` requests, `GET` route handlers and the client Router Cache for page segments are **not cached by default** any more; you opt in (`cache: "force-cache"`, `next: { revalidate }`, or `export const dynamic = "force-static"`).
- A route becomes **dynamic** when it uses dynamic APIs (`cookies()`, `headers()`, `searchParams`) or uncached fetches. Then the Full Route Cache doesn't apply.
- For non-`fetch` data (ORM/DB clients), use React `cache()` for per-request dedupe and `unstable_cache` (or `"use cache"` in newer versions) for persistence.
```tsx
// Time-based (ISR-style)
const res = await fetch(url, { next: { revalidate: 3600, tags: ["products"] } });

// On-demand: after a mutation
"use server";
import { revalidateTag, revalidatePath } from "next/cache";
export async function updateProduct(id: string, data: FormData) {
  await db.product.update({ where: { id }, data: parse(data) });
  revalidateTag("products");          // invalidates every fetch tagged "products"
  revalidatePath(`/products/${id}`);  // and this route
}
```
**Newer model (Next.js 16 "Cache Components"):** caching is *opt-in* per function/component/page with the `"use cache"` directive plus `cacheLife` / `cacheTag`; everything else is dynamic by default. Mention it as the direction of travel, and check the docs for exact APIs on your version.

### N4. Rendering strategies with concrete routes

```tsx
// SSG: fully static at build, with dynamic params pre-generated
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(p => ({ slug: p.slug }));
}
export const dynamicParams = true;    // unknown slugs are rendered on demand, then cached

// ISR: static + revalidated
export const revalidate = 60;

// SSR: per-request
export const dynamic = "force-dynamic";   // or use cookies()/headers()
```

**Choosing (scenario questions):**
- *Marketing/blog:* SSG + on-demand revalidation via CMS webhook (`revalidateTag`).
- *E-commerce PDP:* static shell + ISR for product data; dynamic bits (price by region, stock, personalization) streamed via Suspense (PPR / Cache Components).
- *Logged-in dashboard:* dynamic server rendering with streaming, or a thin shell + client fetching via TanStack Query for highly interactive widgets.
- *SEO-critical + personalized:* render public content statically; personalize in client or streamed dynamic islands.

### N5. Streaming and Suspense

`loading.tsx` automatically wraps the segment's `page` in a `<Suspense>` boundary. For finer control, wrap slow parts yourself and fetch in parallel:
```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;                 // params is async in Next 15+
  const product = await getProduct(id);        // fast, blocks the shell
  return (
    <>
      <ProductHeader product={product} />
      <Suspense fallback={<ReviewsSkeleton />}><Reviews id={id} /></Suspense>   {/* slow, streamed */}
      <Suspense fallback={<RecsSkeleton />}><Recommendations id={id} /></Suspense>
    </>
  );
}
```
Interview nuance: once streaming begins the **HTTP status is already 200**; `notFound()` thrown after that point can't change it (Next adds a `noindex` meta tag instead), so do critical existence checks *before* streaming starts (in the layout/page body outside Suspense).

**Avoiding request waterfalls**
```tsx
// Waterfall (slow): 2 sequential round trips
const user = await getUser(id);
const posts = await getPosts(id);

// Parallel
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);

// Preload pattern / pass promise to a child and read with use()
const postsPromise = getPosts(id);          // start now, don't await
return <Suspense fallback={...}><Posts promise={postsPromise} /></Suspense>;
```

### N6. Server Actions: security and patterns

**Q. Are Server Actions safe by default?**
They are **public HTTP POST endpoints**. Next adds some protections (encrypted closure variables, Origin/Host comparison against CSRF, unguessable ids), but *you* must still:
1. **Authenticate and authorize inside every action** (not only in the UI that renders the button).
2. **Validate input** (Zod). `FormData` and arguments are attacker-controlled.
3. Not return sensitive data or rely on hiding the button.
4. Rate limit sensitive actions.

```tsx
"use server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const schema = z.object({ title: z.string().min(1).max(120) });

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = schema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors.title?.[0] ?? "Invalid" };

  await db.post.create({ data: { title: parsed.data.title, authorId: session.user.id } });
  revalidatePath("/posts");
  return { error: null };
}
```
```tsx
"use client";
export function NewPost() {
  const [state, action, pending] = useActionState(createPost, { error: null });
  return (
    <form action={action}>
      <input name="title" required />
      <button disabled={pending}>{pending ? "Saving…" : "Create"}</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```
**Actions vs Route Handlers:** Actions are for *mutations triggered by your own UI* (progressive enhancement, tight cache invalidation). Route Handlers (`app/api/.../route.ts`) are for **webhooks, third-party consumers, mobile clients, and non-POST semantics**. Actions run sequentially per client (queued), so they're not for parallel data *fetching*.

### N7. Routing deep dive

| Feature | Syntax | Use |
|---|---|---|
| Dynamic segment | `app/blog/[slug]/page.tsx` | One page, many URLs |
| Catch-all / optional | `[...slug]`, `[[...slug]]` | Docs, CMS paths |
| Route group | `(marketing)/about` | Organize / different layouts without affecting the URL |
| Private folder | `_components` | Excluded from routing |
| Parallel route | `@modal`, `@analytics` | Render multiple pages in one layout, independently loading/erroring |
| Intercepting route | `(.)photo/[id]` | Show a link's target as a **modal** while keeping the URL shareable; hard refresh shows the full page |
| Template | `template.tsx` | Like layout, but remounts on navigation |

**Q. Layout vs template?** Layouts persist and keep state across navigations between their child routes (and don't re-render on navigation); templates create a new instance on each navigation (good for enter animations or per-page effects).

**Q. Error handling files?** `error.tsx` (must be a Client Component; catches errors in its segment's children, gets a `reset()`), `global-error.tsx` (root layout errors), `not-found.tsx`, `loading.tsx`. Errors in a layout are caught by the *parent* segment's `error.tsx`.

**Q. Navigation APIs?** `<Link>` (prefetches when in viewport; static routes prefetched fully, dynamic partially up to the nearest `loading.tsx`), `useRouter().push/replace/refresh`, `redirect()` (server), `usePathname`, `useSearchParams` (needs a `Suspense` boundary in statically rendered pages, otherwise the whole route bails to client rendering).

### N8. Middleware / Proxy: what belongs there

- Good: redirects (auth gate, locale), rewrites (A/B testing), setting headers/cookies, bot filtering, simple feature-flag routing.
- Bad: heavy computation, DB queries (Edge runtime limits; latency on every matching request), and being your **only** auth check. A `matcher` bug or a direct call to your data layer/Server Action bypasses it (see the middleware bypass CVE class of issues), so enforce authorization **at the data-access layer** as well ("defense in depth").
```ts
// middleware.ts  (named proxy.ts in newer Next versions)
import { NextResponse, type NextRequest } from "next/server";
export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*"] };
```

### N9. Authentication architecture

1. **Session cookies (recommended for web):** server-issued opaque or signed session id in an `httpOnly; Secure; SameSite=Lax` cookie. Simple revocation.
2. **JWT:** stateless, but hard to revoke; keep short-lived + refresh tokens; never store in `localStorage` (XSS-readable).
3. **Where to check:** middleware for optimistic redirects → **Server Component / action / route handler** for real authorization (a "Data Access Layer" with `getCurrentUser()` using React `cache()`).
4. Libraries: Auth.js, Clerk, Better Auth, Lucia patterns, or custom. Know OAuth/OIDC basics (authorization code + PKCE).
5. Don't put secrets in `NEXT_PUBLIC_*`, and don't pass whole DB rows to Client Components (leaks fields); map to a DTO.

### N10. Hydration errors: causes and cures

| Cause | Fix |
|---|---|
| `Date.now()`, `Math.random()`, locale/timezone formatting differing server vs client | Render on server only, or compute in `useEffect` after mount; pass fixed timestamps/time zone |
| `typeof window !== "undefined"` branching in render | Use `useEffect` + state, or `useSyncExternalStore` with a server snapshot |
| Invalid HTML nesting (`<div>` inside `<p>`, `<a>` in `<a>`) | Fix markup |
| Browser extensions modifying DOM | `suppressHydrationWarning` on the specific element |
| Client-only widget (maps, charts) | `dynamic(() => import("./Map"), { ssr: false })` (only from a Client Component) |

### N11. Metadata, SEO and i18n
```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);          // deduped with the page's own fetch via memoization
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { title: post.title, images: [post.cover] },
  };
}
```
Also: `app/sitemap.ts`, `app/robots.ts`, JSON-LD in a `<script type="application/ld+json">`, `hreflang` via `alternates.languages`, and i18n routing with `[locale]` segment + `next-intl` (middleware for locale detection).

### N12. Environment variables, config, deployment
- `NEXT_PUBLIC_*` are **inlined at build time** into client bundles (changing them needs a rebuild); other vars are server-only and read at runtime on the server.
- **Self-hosting:** `output: "standalone"` for a minimal Docker image; you own the cache: multiple instances need a shared cache handler (Redis/S3) for ISR/Data Cache consistency; configure `sharp` for images; know Node vs Edge runtime differences.
- **Vercel:** zero-config, edge network, Image Optimization, ISR on-demand revalidation built in.
- CI: type-check, lint, unit tests, Playwright against a preview deployment, bundle-size checks.

### N13. Migrating Pages Router → App Router (common "tell me about a migration" question)
Incremental (both routers can coexist). Approach: move shared layout first, migrate leaf routes one by one; replace `getServerSideProps`/`getStaticProps` with async Server Components and `fetch` options; convert `_app`/`_document` to `layout.tsx`; replace `next/router` with `next/navigation`; isolate client-only libs behind `"use client"`; watch out for context providers, CSS-in-JS runtime libs (need a registry or a swap), and changed caching semantics. Ship behind route-by-route rollout and monitor Web Vitals.

### N14. Rapid-fire Next.js questions

| Question | Short answer |
|---|---|
| Can a Server Component use `useState`? | No. Extract a Client Component. |
| Can a Client Component import a Server Component? | Not directly; pass it as `children`/props. |
| Difference between `redirect()` and `router.push()`? | `redirect` is server-side (during render/action), `router.push` client-side navigation. |
| How to make a route dynamic? | Use `cookies()/headers()`, `searchParams`, `export const dynamic = "force-dynamic"`, or uncached fetch. |
| How to show a loading state? | `loading.tsx` or `<Suspense>`. |
| `next/link` vs `<a>`? | Client-side navigation + prefetch; `<a>` does full reload. |
| `useSearchParams` warning? | Needs `<Suspense>` for static rendering. |
| How to call an API route from a Server Component? | Don't; call the data function directly. Fetching your own route from the server is an anti-pattern. |
| Where does `console.log` in a Server Component appear? | Server terminal (not the browser). |
| Image optimization requirement? | Configure `images.remotePatterns` for remote hosts. |
| How do you revalidate after a CMS change? | Webhook → route handler → `revalidateTag`. |
| Edge vs Node runtime? | Edge: low latency, limited APIs; Node: full APIs. Prefer Node unless you need the edge. |
| What is `generateStaticParams`? | Pre-render dynamic route params at build time. |
| How to share data between layout and page without double fetch? | Both call the same function; request memoization / `cache()` dedupes. |

---

## 8. Web Fundamentals

**CSS / Layout**
- **Box model, specificity, stacking context**, `position` types.
- **Flexbox vs Grid:** 1-D vs 2-D layout. Use Grid for page layout, Flex for components.
- **Responsive:** mobile-first, `clamp()`, container queries, `rem`.
- **Styling in React:** CSS Modules, Tailwind, styled-components/Emotion (runtime cost; problematic with RSC), vanilla-extract/Panda (zero-runtime).

**Accessibility (asked a lot at 5 YOE)**
Semantic HTML first; ARIA only when needed; keyboard navigation and focus management; alt text; color contrast (4.5:1); `label` for inputs; live regions for async updates. Test with axe and a screen reader.

**Browser & Network**
- Critical rendering path, reflow vs repaint.
- HTTP caching (`Cache-Control`, ETag), CDN, HTTP/2.
- CORS (preflight for non-simple requests), cookies vs localStorage, `SameSite`.
- **Security:** XSS (escape output, avoid `dangerouslySetInnerHTML`, CSP), CSRF (SameSite cookies, tokens), never trust client-side auth.

---

## 9. Testing & Tooling

**Q56. Testing strategy?**
Unit (Vitest/Jest), component (React Testing Library: test behavior, not implementation), integration, E2E (Playwright/Cypress), mock network with MSW. Follow the testing trophy: mostly integration.
```jsx
test("submits form", async () => {
  render(<Login onSubmit={fn} />);
  await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
  expect(fn).toHaveBeenCalledWith({ email: "a@b.com" });
});
```

**Q57. Tooling you should discuss:** Vite/Webpack/Turbopack, ESLint + Prettier, Husky, CI/CD pipeline, monorepos (Turborepo/Nx), Storybook, Git workflow, feature flags, error monitoring (Sentry).

---

## 10. Machine-Coding / Live Coding Practice

Practice building these in 45 mins: **debounced search/typeahead, infinite scroll, todo with filters, star rating, accordion, tabs, modal, pagination, image carousel, tic-tac-toe, OTP input, file uploader with progress, data table with sort/filter, nested comments.** While coding, state assumptions, think about edge cases (empty, loading, error), accessibility, and clean component splitting.

**Common JS coding questions:** implement `debounce`, `throttle`, `Promise.all`, `deepClone`, `flatten`, `curry`, `bind`, `memoize`, event emitter, LRU cache.

```js
Promise.myAll = (promises) => new Promise((res, rej) => {
  const out = []; let done = 0;
  if (!promises.length) return res(out);
  promises.forEach((p, i) => Promise.resolve(p).then(v => {
    out[i] = v; if (++done === promises.length) res(out);
  }, rej));
});
```

---

## 11. Frontend System Design

**Framework (use for any question):** Requirements → Component architecture → Data model & API → State management → Rendering strategy → Performance → Accessibility → Error handling/observability → Trade-offs.

**Practice prompts:** news feed / infinite scroll, e-commerce product listing + cart, autocomplete, chat app (WebSockets), dashboard with real-time charts, design system / component library, image gallery, collaborative editor, micro-frontends.

**Example: Autocomplete.** Debounce input (~300ms), abort stale requests (`AbortController`), cache results by query, keyboard navigation + ARIA combobox, highlight matches, handle empty/error, limit results, and consider a server-side/edge cache.

---

## 11B. Frontend System Design: Worked Examples (Expanded)

### The RADIO framework (say it out loud at the start)

| Step | What to cover |
|---|---|
| **R**equirements | Functional (what it does), non-functional (perf, a11y, offline, i18n), scale, devices, out-of-scope |
| **A**rchitecture | Component tree, layers (UI / state / data), rendering strategy (SSR/CSR/RSC) |
| **D**ata model | Client state shape, normalization, server entities, cache keys |
| **I**nterface (API) | Endpoints, pagination style, real-time protocol, error format, component props API |
| **O**ptimizations | Performance, a11y, security, reliability, analytics, testing |

Spend ~5 min on requirements, ~25 on architecture/data/API, ~10 on optimizations. Ask questions and state assumptions.

---

### Example 1: Autocomplete / Typeahead (search box)

**Requirements:** suggest results as the user types; keyboard + mouse selection; handle slow networks; accessible; ~10 results; mobile support. **Out of scope:** ranking algorithm (backend).

**Architecture**
```
<Autocomplete>
  ├─ <Input role="combobox" aria-expanded aria-controls aria-activedescendant />
  ├─ <Listbox role="listbox">   (portal if it must escape overflow:hidden)
  │     └─ <Option role="option" aria-selected />
  └─ useAutocomplete()  ← debounce, fetch, cache, keyboard reducer
```

**Data model**
```ts
type State = { query: string; status: "idle"|"loading"|"success"|"error"; results: Item[]; activeIndex: number; open: boolean };
const cache = new Map<string, Item[]>();     // key: normalized query (trim + lowercase)
```

**API:** `GET /search?q=rea&limit=10` returns `{ items: [{id, label, highlight}] }`. Support `AbortSignal`.

**Core logic**
```tsx
function useAutocomplete(query: string) {
  const debounced = useDebounce(query.trim().toLowerCase(), 250);
  const [state, setState] = useState<{ items: Item[]; status: string }>({ items: [], status: "idle" });

  useEffect(() => {
    if (debounced.length < 2) { setState({ items: [], status: "idle" }); return; }
    const hit = cache.get(debounced);
    if (hit) { setState({ items: hit, status: "success" }); return; }

    const ctrl = new AbortController();
    setState(s => ({ ...s, status: "loading" }));
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(({ items }) => { cache.set(debounced, items); setState({ items, status: "success" }); })
      .catch(e => { if (e?.name !== "AbortError") setState({ items: [], status: "error" }); });
    return () => ctrl.abort();                 // fixes out-of-order responses
  }, [debounced]);
  return state;
}
```

**Optimizations & edge cases (this is where you win)**
- **Debounce** (200-300 ms) + **cancel stale requests** + **cache** by query (LRU, TTL).
- **Keyboard:** ↑/↓ moves `activeIndex` (wrap), Enter selects, Esc closes, Home/End; `aria-activedescendant` keeps focus in the input.
- **IME composition:** don't fire on `compositionstart` until `compositionend` (CJK input).
- **Empty / error / loading states**, minimum characters, trim whitespace, highlight matched text safely (no `dangerouslySetInnerHTML` with unsanitized data).
- **Perf:** limit results, virtualize if large, memoize option rows, prefetch popular queries, HTTP caching / CDN for common prefixes, server-side prefix index (trie/search service).
- **Mobile:** touch targets ≥44 px, virtual keyboard doesn't cover the list.
- **Security:** escape output, encode query.
- **Testing:** unit test the hook (fake timers), RTL for keyboard behavior, a11y audit.

---

### Example 2: News Feed / Infinite Scroll (Twitter-like)

**Requirements:** scrolling feed of posts, load more on scroll, like/comment with instant feedback, new-posts banner, works on flaky mobile networks, good LCP.

**Architecture**
- **Initial page: server-rendered** (RSC/SSR) for fast LCP and SEO of public content; subsequent pages via client fetch.
- Feed container (`useInfiniteQuery`) → virtualized list → `PostCard` (memoized) → action buttons.

**API: cursor pagination, not offset**
```
GET /feed?cursor=<opaque>&limit=20  →  { items: Post[], nextCursor: string | null }
```
Offset pagination breaks when new posts are inserted (duplicates/skips) and is slow at large offsets; a cursor (last id/timestamp) is stable.

**Data model: normalize entities**
```ts
{ posts: { [id]: Post }, users: { [id]: User }, feedIds: string[] }   // one source of truth: like a post once, all views update
```

**Infinite scroll trigger**
```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ["feed"], queryFn: ({ pageParam }) => api.feed(pageParam),
  initialPageParam: null, getNextPageParam: (last) => last.nextCursor,
});
const sentinelRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  const io = new IntersectionObserver(([e]) => e.isIntersecting && hasNextPage && !isFetchingNextPage && fetchNextPage(),
    { rootMargin: "600px" });                       // prefetch before the user reaches the end
  sentinelRef.current && io.observe(sentinelRef.current);
  return () => io.disconnect();
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
```

**Optimistic like**
```tsx
useMutation({
  mutationFn: (id) => api.like(id),
  onMutate: async (id) => {
    await qc.cancelQueries({ queryKey: ["feed"] });
    const prev = qc.getQueryData(["feed"]);
    qc.setQueryData(["feed"], (d) => toggleLike(d, id));      // instant UI
    return { prev };
  },
  onError: (_e, _id, ctx) => qc.setQueryData(["feed"], ctx.prev),   // rollback
  onSettled: () => qc.invalidateQueries({ queryKey: ["feed"] }),
});
```

**Optimizations & trade-offs**
- **Virtualization** when DOM nodes grow past ~a few hundred (trade-off: variable heights, scroll restoration, a11y). Alternative: "windowing" older pages off-screen.
- **Scroll restoration** when navigating back (keep query cache + `scrollTop`/anchor id).
- **New posts:** poll or WebSocket/SSE; show a "N new posts" pill instead of shifting content (avoids CLS/jumps).
- **Images/video:** lazy load, `srcset`, blurhash placeholders, autoplay only in view (IntersectionObserver).
- **Offline/flaky:** retry with backoff, show cached feed, queue mutations.
- **Accessibility:** `role="feed"`/`article`, "Load more" button fallback for keyboard/screen-reader users (infinite scroll traps focus in footer).
- **Analytics:** impression tracking with IntersectionObserver, batched with `sendBeacon`.

---

### Example 3: Design System / Component Library

**Requirements:** shared across several apps/teams, accessible, themeable (light/dark/brand), tree-shakeable, versioned, documented.

**Architecture**
- **Monorepo package** (Turborepo/Nx + pnpm workspaces), published to a private registry, versioned with **Changesets** (semver: breaking changes in majors, deprecation warnings first).
- **Layers:** design tokens (color, spacing, typography as CSS variables / JSON) → primitives (Box, Text, Stack) → headless behavior (focus, keyboard: Radix/React Aria) → styled components (Button, Modal, Select) → patterns (DataTable, Form).
- **Styling:** CSS variables + CSS Modules/Tailwind/zero-runtime CSS-in-JS (avoid runtime CSS-in-JS in RSC).
- **Docs & QA:** Storybook (docs + interaction tests), visual regression (Chromatic/Playwright), a11y checks (axe), unit tests (RTL), TypeScript types as API contract.

**API design principles (great to discuss)**
```tsx
// Compound + polymorphic + controlled/uncontrolled
<Dialog open={open} onOpenChange={setOpen}>
  <Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Delete item?</Dialog.Title>
    <Dialog.Close>Cancel</Dialog.Close>
  </Dialog.Content>
</Dialog>
```
- **Composition over configuration** (avoid 30-boolean-prop components); sensible defaults; escape hatches (`className`, `asChild`, `ref` forwarding, spreading native props).
- **Controlled and uncontrolled** support (`value/onChange` and `defaultValue`).
- **Accessibility built in**, not optional; keyboard and ARIA patterns per WAI-ARIA APG.
- **Theming** via tokens so brand changes don't require component edits.
- **Bundle:** ESM + `sideEffects: false`, per-component entry points to keep tree-shaking effective.
- **Adoption:** migration guides, codemods for breaking changes, contribution model, usage analytics.

---

### Example 4: Quick-fire design prompts and what to emphasize

| Prompt | Key discussion points |
|---|---|
| **Chat app** | WebSocket vs SSE vs polling; message ordering/ids, optimistic send + retry/ack, reconnection with backoff, unread counts, virtualized reverse-scroll list, typing indicators (throttled), offline queue |
| **E-commerce listing + cart** | SSR/ISR for SEO, faceted filters in URL params, debounce filters, pagination vs infinite, cart in server + local optimistic state, inventory races, image performance, analytics |
| **Real-time dashboard** | WebSocket/SSE streaming, throttle renders (requestAnimationFrame batching), canvas/WebGL for large charts, downsampling, worker-based aggregation, stale-data indicators |
| **Collaborative editor** | CRDT vs OT, presence/cursors, local-first with sync, undo/redo per user, conflict resolution, debounced persistence |
| **Image gallery / Pinterest grid** | Masonry layout, lazy loading, responsive images, blurhash, virtualization, prefetching next page, lightbox a11y |
| **Micro-frontends** | Module Federation vs iframes vs route-level composition, shared deps/versioning, design-system consistency, cross-app communication, when NOT to use (team-size/ownership justification) |
| **Video player controls / streaming** | Adaptive bitrate (HLS/DASH), buffering states, keyboard shortcuts, captions, lazy load player SDK |

**Closing move for any design answer:** summarize trade-offs ("I chose X for simplicity; at 10× scale I'd revisit with Y"), then list what you'd monitor (Web Vitals, error rate, API latency) and how you'd test it.

---

## 12. Behavioral & Senior Expectations

Prepare 5 STAR stories (Situation, Task, Action, Result with metrics):
1. Performance win (e.g., "cut LCP from 4.2s to 1.8s by ...")
2. Difficult production bug and how you debugged it
3. Disagreement with a teammate/PM and how you resolved it
4. Mentoring / code review / raising quality bar
5. Trade-off decision or migration you led (e.g., Pages → App Router, CRA → Vite)

**Questions to ask the interviewer:** team structure, deployment frequency, testing culture, how tech debt is handled, growth path.

---

## 13. Final Checklist

- [ ] Can explain the event loop, closures, and `this` without notes
- [ ] Can explain re-rendering and fix a stale closure live
- [ ] Can build a custom hook and a machine-coding component in 45 min
- [ ] Can explain RSC vs Client Components and Next caching layers
- [ ] Can profile and fix a perf problem with numbers
- [ ] Know accessibility and security basics
- [ ] Can explain render vs commit phase, effect ordering, and state-as-snapshot (3B)
- [ ] Can walk through a perf investigation with numbers (6B)
- [ ] Can explain Next.js caching layers, streaming, and Server Action security (7B)
- [ ] Can run RADIO on autocomplete, feed and design-system prompts (11B)
- [ ] Have 5 STAR stories with metrics
- [ ] Can walk through one system-design question end to end

**Tips:** Think aloud, ask clarifying questions, mention trade-offs ("I'd use X because..., the downside is..."), and admit gaps honestly while reasoning toward an answer.

*Note:* Next.js and React 19 details (especially caching defaults) change between versions. Verify against the official docs for the version in the job description.
