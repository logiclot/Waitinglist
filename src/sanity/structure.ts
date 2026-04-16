import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Landing Pages (A/B)')
        .schemaType('landingPage')
        .child(S.documentTypeList('landingPage').title('Landing Pages')),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'landingPage',
      ),
    ])
