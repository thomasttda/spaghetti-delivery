<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:supabase-ts-build-rules -->
# Supabase & TypeScript Build Guidelines

To prevent `npm run build` (tsc) errors in this project, ALL AGENTS MUST follow these strict rules:

1. **Supabase v2 `.single()` Types (`never` error)**: When calling `.single()` on a query without fully generated schema types, TypeScript may infer the result properties as `never` (e.g., `Property 'active' does not exist on type 'never'`). Always cast the property access like `(data as any).field` or type the destructuring explicitly.
2. **Supabase v2 `.update()` and `.insert()` Types**: Passing an object to `.update()` or `.insert()` might cause `Argument of type 'any' is not assignable to parameter of type 'never'`. To bypass this in the absence of generated DB types, cast the payload as `never` (e.g., `.update({ active: newValue } as never)`).
3. **No `.finally()` on Supabase Queries**: Supabase `.then()` returns a `PromiseLike` object, not a native Promise. `PromiseLike` **does not** have a `.finally()` method. Do not chain `.finally()`. Instead, use `async/await` with a `try/finally` block, or place your cleanup code at the end of the `.then()` block.
4. **Scratch / Temporary Files**: Do not leave temporary scripts or "scratch" files inside `/src` or the project root. Put them in the `/scratch` directory, which is safely excluded in `tsconfig.json`.
5. **Promise.all Validation**: Always ensure that all variables destructured from a `Promise.all` have a corresponding query. (e.g. Do not reference `catData` if the `categories` query is not in the array).
6. **Mandatory Pre-Flight Testing**: Before declaring any coding task "completed", you MUST run `npm run build` (or relevant compilation/type-checking commands) to ensure no TypeScript or build errors were introduced. Automatically identify and fix any resulting errors. Only inform the user the task is completed AFTER the build successfully passes.
<!-- END:supabase-ts-build-rules -->
