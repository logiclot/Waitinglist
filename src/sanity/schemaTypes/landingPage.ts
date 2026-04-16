import { defineField, defineType } from 'sanity'

export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing Page (A/B)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      description: 'Only used in the studio to identify this landing page.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description: 'The page will be served at /l/{slug}. Use this slug in Google Ads destination URLs.',
      options: { source: 'title', maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      description: 'Main headline shown in the hero (e.g., "Automate your daily grind.").',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Hero subheading',
      type: 'text',
      rows: 2,
      description: 'Supporting sentence shown below the headline.',
      validation: (Rule) => Rule.required().max(240),
    }),
    defineField({
      name: 'trustStats',
      title: 'Trust pills',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Short benefit pills shown under the subheading. Leave empty to use defaults.',
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: 'searchPlaceholder',
      title: 'Search bar placeholder',
      type: 'string',
      description: 'Placeholder text inside the hero search bar. Leave empty for default.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA button label',
      type: 'string',
      description: 'Label of the primary CTA button (defaults to "Browse Solutions").',
    }),
    defineField({
      name: 'worksWith',
      title: 'Works-with tools',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tool names shown in the "Works with" row. Leave empty for defaults.',
    }),
    defineField({
      name: 'metaTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Title tag for this landing page. Defaults to the headline.',
    }),
    defineField({
      name: 'metaDescription',
      title: 'SEO description',
      type: 'text',
      rows: 2,
      description: 'Meta description for this landing page.',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description: 'Turn on to add noindex (useful for paid-only landing pages).',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? `/l/${subtitle}` : 'No slug set',
      }
    },
  },
})
