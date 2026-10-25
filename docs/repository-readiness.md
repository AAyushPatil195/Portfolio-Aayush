# Project source links and cleanup notes

Reviewed public project READMEs on 25 October 2026. Existing project actions retain their real repositories; none has been silently replaced or redirected.

| Project | Current repository | Concrete follow-up |
| --- | --- | --- |
| QuickShow | [BookShow](https://github.com/AAyushPatil195/BookShow) | README's top Live Demo badge targets the backend API; its frontend entry is still a placeholder. Fix that distinction and align the architecture narrative with the documented benchmarking branch. The portfolio does not publish the API as a frontend demo. |
| Telecom Support Assistant | [Telecom_Assistant](https://github.com/AAyushPatil195/Telecom_Assistant) | README explains the three collections and merged retriever. Keep the portfolio's scripted sample passages separate from real retrieved output. No replacement is justified by this documentation review. |
| Time Capsule API | [Time-Capsule-API](https://github.com/AAyushPatil195/Time-Capsule-API) | README describes encrypted capsules; the previously inspected controller stores the message directly. Resolve that discrepancy before making an encryption claim. The portfolio makes no encryption-at-rest claim. |
| File Manager | [G-drive-](https://github.com/AAyushPatil195/G-drive-) | Improve the repository name/description and format the compressed project-tree documentation. The current link remains valid and the portfolio correctly describes EJS rather than React. |

These are documentation/readiness findings, not a full security or code-quality audit. Prefer focused cleanup in the existing repositories. If a clean replacement becomes necessary later, create and verify the real repository, carry over the relevant history/documentation, and update `src/lib/projects.ts` only after the new destination exists. No hypothetical replacement URLs are published.

The portfolio itself lives in [Portfolio-Aayush](https://github.com/AAyushPatil195/Portfolio-Aayush), independently of those project repositories.
