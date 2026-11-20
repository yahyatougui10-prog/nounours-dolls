/**
 * First-run seed for the JSON store.
 *
 * Products are generated from data/toy-database/toys_images.db by
 * scripts/import-toy-database.mjs. The optional editorial fields
 * (personality, shortStory, favoriteThings, collection, featured, stock) are
 * deliberately absent: they must only be filled in by a real administrator.
 */
import { toyProducts } from './toy-products.mjs'

export const seed = {
  products: toyProducts,
  collections: [
    {
      id: 'collection-teddy',
      title: 'Teddy Bears',
      slug: 'teddy',
      cover: '/products/toys/nounours/nounours_001.png',
      order: 1,
      featured: true,
      description: 'Soft, timeless companions for every cuddle.',
    },
    {
      id: 'collection-doll',
      title: 'Beautiful Dolls',
      slug: 'doll',
      cover: '/products/toys/dolls/doll_001.png',
      order: 2,
      featured: true,
      description: 'Charming friends with a story of their own.',
    },
    {
      id: 'collection-gift',
      title: 'Special Gifts',
      slug: 'gift',
      cover: '/products/toys/nounours/nounours_013.png',
      order: 3,
      featured: false,
      description: 'Little wonders made for giving.',
    },
  ],
  content: {
    heroEyebrow: 'NOOSH & FRIENDS — A Little World of Happiness',
    heroHeadline: 'A Little World of Love, Made for You.',
    heroSubtitle:
      'Meet your new favorite companions. Discover adorable teddy bears and beautiful dolls that turn little moments into precious memories.',
    primaryCta: 'Explore the collection',
    secondaryCta: 'Meet the friends',
    storyHeadline: 'Some friends are meant to be found.',
    storyBody:
      'Not just toys — little companions with a softness you can feel and a character you remember. Every piece in our boutique is chosen by hand, for the moments it will quietly become part of.',
    contactEmail: 'hello@nooshandfriends.com',
    contactPhone: '',
    address: 'Paris, France',
  },
  settings: {
    brandName: 'NOOSH & FRIENDS',
    worldName: 'A Little World of Happiness',
    tagline: 'Where Every Friend Has a Story',
    currency: 'USD',
    locale: 'en-US',
    social: {
      instagram: 'https://www.instagram.com',
      facebook: 'https://www.facebook.com',
      pinterest: 'https://www.pinterest.com',
    },
    storeEmail: 'hello@nooshandfriends.com',
  },
  messages: [],
  activity: [],
}

export default seed
