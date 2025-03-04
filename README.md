# Test thing (name WIP)

This is a full-stack Next.js app that allows users to create, edit, view, and take tests.

## TODO

- [ ] Split test creation process in multiple phases
  - When the user clicks 'Create Test' create empty test and redirect the user to the test's edit page
  - After user modifies the test's field save changes using debounced function
  - When the user clicks 'Add Question' create new empty question
  - When question is edited save changes using debounced function
  - Image uploads should be a separate endpoint that will upload image for existing test/question and return a url
  - By default every test is a draft
  - Validate test and questions separately when the test is a draft
  - When the test is a draft show a warning and a 'Publish Test' button
  - After the user clicks 'Publish Test' validate both test and questions (including vaidations that depend on both) and set `isDraft` to `false`

## Roadmap

- [ ] Auth
  - [ ] Teacher sign up
  - [ ] Student sign up
  - [ ] Sign in
- [ ] Teacher
  - [ ] [Onboarding](https://github.com/enszrlu/NextStep)
  - [ ] Home page (latest results, most recent tests, something else)
  - [ ] Tests page
  - [ ] Test page (basically results)
  - [ ] Groups page
  - [ ] Group page
  - [ ] Student page
  - [ ] Create group
  - [ ] Create and edit tests
  - [ ] Manage groups
  - [ ] Manage students & their results
  - [ ] Share test link
  - [ ] Share group link
  - [ ] Manually create student profile and send invite
  - [ ] Assing tests to students
- [ ] Student
  - [ ] Home page (assigned tests and latest results)
  - [ ] Take tests
  - [ ] Results page
  - [ ] Profile page

## Tech

- [Next.js](https://nextjs.org)
- [tRPC](https://trpc.io)
- [better-auth](https://www.better-auth.com/)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [SQLite](https://www.sqlite.org/)
- [ShadcnUI](https://ui.shadcn.com/)
