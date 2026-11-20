import React from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Cake,
  Crown,
  Gift,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { SectionHeading } from '../../design-system/SectionHeading'
import {
  CATEGORY_OPTIONS,
  formatPrice,
  productMatchesCategory,
  type Product,
} from '../../data/products'
import { scrollToId } from '../../lib/scroll'
import { Button } from '../ui/Button'
import {
  BUDGET_OPTIONS,
  STYLE_OPTIONS,
  budgetLabel,
  imageSource,
  inBudget,
  productStyles,
  productText,
  type BudgetKey,
  type StyleKey,
} from '../discovery/signals'

export interface GiftStudioPageProps {
  products: Product[]
  onProductSelect: (product: Product) => void
  onExploreCollection: (category?: string, search?: string) => void
}

type OccasionKey = 'birthday' | 'celebration' | 'child' | 'collector'

interface GiftChoices {
  budget?: BudgetKey
  occasion?: OccasionKey
  category?: string
  style?: StyleKey
}

const OCCASIONS: Array<{ value: OccasionKey; label: string }> = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'celebration', label: 'Special occasion' },
  { value: 'child', label: 'For a little one' },
  { value: 'collector', label: 'For a collector' },
]

const occasionPatterns: Record<OccasionKey, RegExp> = {
  birthday: /birthday|gift|present|celebrat|box|most loved|party/i,
  celebration: /occasion|celebrat|keepsake|limited|signed|certificate|hand/i,
  child: /child|children|soft|cuddle|plush|hypoallergenic|everyday|mini|dreamer/i,
  collector: /collector|keepsake|limited|numbered|certificate|artist|heirloom|heritage|fine/i,
}

const scoreGift = (product: Product, choices: GiftChoices): number => {
  let score = 0
  if (choices.budget && inBudget(product, choices.budget)) score += 2
  if (choices.category && productMatchesCategory(product, choices.category)) score += 3
  if (choices.style && productStyles(product).includes(choices.style)) score += 2
  if (choices.occasion && occasionPatterns[choices.occasion].test(productText(product))) score += 2
  return score
}

interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={`rounded-full border px-4 py-2 text-xs font-medium transition-[background-color,border-color,box-shadow,color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-deep focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
      selected
        ? 'border-cyan bg-cyan-tint text-marron-deep shadow-glow'
        : 'border-marron/15 bg-cream text-muted hover:border-cyan/50 hover:text-marron'
    }`}
  >
    {label}
  </button>
)

interface ControlGroupProps {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}

const ControlGroup: React.FC<ControlGroupProps> = ({ label, icon, children }) => (
  <div>
    <div className="mb-3 flex items-center gap-2 text-cyan-deep">
      {icon}
      <h3 className="label-micro text-marron-soft">
        {label}
      </h3>
    </div>
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {children}
    </div>
  </div>
)

interface MiniMatchProps {
  product: Product
  index: number
  onProductSelect: (product: Product) => void
  onExploreCollection: (category?: string, search?: string) => void
}

const MiniMatch: React.FC<MiniMatchProps> = ({
  product,
  index,
  onProductSelect,
  onExploreCollection,
}) => (
  <Reveal delay={Math.min(index * 0.06, 0.24)} className="h-full">
    <article className="group flex h-full gap-4 rounded-4xl border border-marron/12 bg-cream p-4 shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-cyan/45 hover:shadow-lift">
      <div className="frame-image h-28 w-24 shrink-0 overflow-hidden rounded-3xl sm:h-32 sm:w-28">
        <img
          src={imageSource(product.image)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="label-micro text-cyan-deep">
          {product.category}
        </span>
        <h3 className="mt-1 font-display text-lg font-medium leading-tight text-marron">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="font-display text-base font-semibold tabular-nums text-marron">
            {formatPrice(product.price)}
          </span>
          {product.tag && <Badge tone="marron">{product.tag}</Badge>}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-marron/10 pt-3">
          <button
            type="button"
            onClick={() => onProductSelect(product)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-marron transition-colors hover:text-cyan-deep"
          >
            View friend
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onExploreCollection(undefined, product.name)}
            className="text-[11px] font-semibold text-muted transition-colors hover:text-marron"
          >
            Find in collection
          </button>
        </div>
      </div>
    </article>
  </Reveal>
)

export const GiftStudioPage: React.FC<GiftStudioPageProps> = ({
  products,
  onProductSelect,
  onExploreCollection,
}) => {
  const [budget, setBudget] = React.useState<BudgetKey | undefined>()
  const [occasion, setOccasion] = React.useState<OccasionKey | undefined>()
  const [category, setCategory] = React.useState<string | undefined>()
  const [style, setStyle] = React.useState<StyleKey | undefined>()

  const hasChoices = Boolean(budget || occasion || category || style)

  const shortlist = React.useMemo(() => {
    const scored = products.map((product, index) => ({
      product,
      index,
      score: scoreGift(product, { budget, occasion, category, style }),
    }))
    if (!hasChoices) {
      return scored.slice(0, 4).map((entry) => entry.product)
    }
    return scored
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, 4)
      .map((entry) => entry.product)
  }, [budget, category, hasChoices, occasion, products, style])

  const giftProduct = products.find((product) => product.categoryKey === 'gift') ?? products[0]
  const childProduct = products.find((product) => product.categoryKey === 'teddy') ?? products[0]
  const collectorProduct =
    products.find((product) => productStyles(product).includes('collector')) ?? products[0]
  const dollProduct = products.find((product) => product.categoryKey === 'doll') ?? products[0]
  const heroSecondary =
    products.find((product) => product.id !== giftProduct?.id && product.categoryKey === 'doll') ??
    products.find((product) => product.id !== giftProduct?.id)

  const toggle = <T extends string>(
    setter: React.Dispatch<React.SetStateAction<T | undefined>>,
    value: T,
  ) => {
    setter((current) => (current === value ? undefined : value))
  }

  const scrollToAssistant = () => {
    scrollToId('gift-assistant')
  }

  const applyOccasion = (value: OccasionKey) => {
    setOccasion(value)
    scrollToAssistant()
  }

  const resetChoices = () => {
    setBudget(undefined)
    setOccasion(undefined)
    setCategory(undefined)
    setStyle(undefined)
  }

  const selectedLabels = [
    budget ? budgetLabel(budget) : null,
    occasion ? OCCASIONS.find((option) => option.value === occasion)?.label : null,
    category ? CATEGORY_OPTIONS.find((option) => option.value === category)?.label : null,
    style ? STYLE_OPTIONS.find((option) => option.value === style)?.label : null,
  ].filter((label): label is string => Boolean(label))

  return (
    <section className="bg-ivory">
      {/* Editorial hero */}
      <div className="relative overflow-hidden bg-marron-deep pb-16 pt-20 text-cream sm:pb-20 sm:pt-28">
        <div
          className="pointer-events-none absolute -right-24 -top-28 h-[26rem] w-[26rem] rounded-full bg-cyan/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-red/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative page-container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div>
            <Badge tone="cyan" className="bg-cyan/15 text-cyan ring-cyan/40">
              The gift studio
            </Badge>
            <h1 className="mt-6 text-balance font-display text-[length:var(--type-hero)] font-medium leading-[1.04] text-cream">
              The gift of a little friend.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-[1.8] text-cream/75 sm:text-lg">
              A thoughtful little companion has a way of saying what words cannot. Tell us a few
              things about your gift and we will shape a shortlist from the friends in our
              boutique.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button variant="accent" size="lg" onClick={scrollToAssistant}>
                Find a gift
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-cream hover:text-cyan"
                onClick={() => onExploreCollection('gift')}
              >
                Browse all gifts
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="relative mx-auto h-[26rem] w-full max-w-lg sm:h-[30rem]">
            {giftProduct && (
              <div className="arch-image absolute left-2 top-0 h-[82%] w-[72%] overflow-hidden bg-sand shadow-lift">
                <img
                  src={imageSource(giftProduct.image)}
                  alt={giftProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {heroSecondary && (
              <div className="animate-float-soft absolute bottom-4 right-0 w-[48%] overflow-hidden rounded-4xl border-[6px] border-cream bg-sand shadow-lift">
                <img
                  src={imageSource(heroSecondary.image)}
                  alt={heroSecondary.name}
                  className="aspect-square w-full object-cover"
                />
              </div>
            )}
            <div className="label-micro absolute bottom-5 left-0 rounded-full bg-marron-deep/70 px-5 py-2.5 text-cyan-tint backdrop-blur-sm sm:bottom-6">
              Made for little moments
            </div>
          </div>
        </div>
      </div>

      {/* Five different ways to give */}
      <div className="section-y">
        <div className="page-container">
          <SectionHeading
            eyebrow="A LITTLE REASON FOR EVERY OCCASION"
            title={
              <>
                Little reasons to <em className="not-italic text-cyan">give</em>
              </>
            }
            description="Each idea below begins with real friends from our collection. Pick a thread and we will follow it together."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-12">
            {/* Birthday — full-bleed image card */}
            <Reveal className="lg:col-span-7">
              <article className="group relative flex min-h-[420px] h-full flex-col justify-end overflow-hidden rounded-5xl bg-marron p-7 shadow-soft sm:p-9">
                {giftProduct && (
                  <img
                    src={imageSource(giftProduct.image)}
                    alt={giftProduct.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-marron/95 via-marron/45 to-transparent" aria-hidden="true" />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full bg-red/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                    <Cake className="h-3.5 w-3.5" aria-hidden="true" />
                    Birthday gifts
                  </span>
                  <h3 className="mt-5 font-display text-4xl font-medium leading-tight text-cream sm:text-5xl">
                    A little wish, wrapped up.
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/80">
                    Birthdays call for something to unwrap and keep close. Start with our most
                    loved little pair, or tell the assistant it is a birthday.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button variant="accent" size="sm" onClick={() => applyOccasion('birthday')}>
                      Find a birthday friend
                    </Button>
                    {giftProduct && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cream/85! hover:text-cyan-tint!"
                        onClick={() => onProductSelect(giftProduct)}
                      >
                        See this friend
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cream/80! hover:text-cyan-tint!"
                      onClick={() => onExploreCollection('gift')}
                    >
                      All gifts
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Special occasions — typographic card with a hairline motif */}
            <Reveal delay={0.08} className="lg:col-span-5">
              <article className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-5xl border border-marron/10 bg-cream p-7 shadow-soft sm:p-9">
                <span className="pointer-events-none absolute right-2 top-5 font-display text-[8rem] leading-none text-outline" aria-hidden="true">
                  02
                </span>
                <span className="inline-flex w-fit items-center gap-2 text-cyan-deep">
                  <Gift className="h-4 w-4" aria-hidden="true" />
                  <span className="label-micro">
                    Special occasions
                  </span>
                </span>
                <h3 className="relative mt-auto font-display text-3xl font-medium leading-tight text-marron sm:text-4xl">
                  For the days worth remembering.
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                  Thank you, congratulations, thinking of you — a keepsake can hold a little more
                  than a card.
                </p>
                <div className="mt-6 space-y-2.5 border-l-2 border-cyan/50 pl-4 text-xs font-medium uppercase tracking-[0.14em] text-marron/70">
                  <p>Thank you</p>
                  <p>Congratulations</p>
                  <p>Just because</p>
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm" onClick={() => applyOccasion('celebration')}>
                    Use this idea
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExploreCollection('gift', 'keepsake')}
                  >
                    Explore keepsakes
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </article>
            </Reveal>

            {/* Gifts for children — horizontal band with a framed image */}
            <Reveal className="lg:col-span-7">
              <article className="grid h-full gap-6 overflow-hidden rounded-5xl border border-cyan/35 bg-cyan/8 p-4 shadow-soft sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:p-5">
                {childProduct && (
                  <div className="frame-image relative aspect-[4/3] overflow-hidden rounded-4xl sm:aspect-auto sm:min-h-[260px]">
                    <img
                      src={imageSource(childProduct.image)}
                      alt={childProduct.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center px-2 pb-3 sm:px-4 sm:pb-0">
                  <span className="inline-flex w-fit items-center gap-2 text-cyan-deep">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    <span className="label-micro">
                      Gifts for children
                    </span>
                  </span>
                  <h3 className="mt-4 font-display text-3xl font-medium leading-tight text-marron">
                    Soft friends for small hands.
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Think gentle textures, familiar shapes and a companion for everyday adventures.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button variant="primary" size="sm" onClick={() => applyOccasion('child')}>
                      Find a little-one gift
                    </Button>
                    {childProduct && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onProductSelect(childProduct)}
                      >
                        View friend
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Collectible gifts — dark, compact and layered */}
            <Reveal delay={0.08} className="lg:col-span-5">
              <article className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-5xl bg-marron p-7 text-cream shadow-lift sm:p-9">
                {collectorProduct && (
                  <div className="absolute -right-10 -top-10 h-56 w-56 overflow-hidden rounded-full opacity-25">
                    <img
                      src={imageSource(collectorProduct.image)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <span className="relative inline-flex w-fit items-center gap-2 text-cyan-tint">
                  <Crown className="h-4 w-4" aria-hidden="true" />
                  <span className="label-micro">
                    Collectible gifts
                  </span>
                </span>
                <h3 className="relative mt-auto font-display text-3xl font-medium leading-tight text-cream sm:text-4xl">
                  Keepsakes for the long haul.
                </h3>
                <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-cream/75">
                  Limited pieces, heirloom finishes and friends meant to stay on the shelf for
                  years to come.
                </p>
                <div className="relative mt-6 flex flex-wrap gap-3">
                  <Button variant="accent" size="sm" onClick={() => applyOccasion('collector')}>
                    Find a keepsake
                  </Button>
                  {collectorProduct && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cream/85 hover:text-cyan"
                      onClick={() => onProductSelect(collectorProduct)}
                    >
                      View friend
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </article>
            </Reveal>

            {/* Personalized suggestions — assistance, never invented product data */}
            <Reveal className="lg:col-span-12">
              <article className="relative overflow-hidden rounded-5xl border border-red/20 bg-paper-texture p-7 shadow-soft sm:p-10">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
                  <div>
                    <span className="inline-flex items-center gap-2 text-red">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      <span className="label-micro">
                        Personalized gift suggestions
                      </span>
                    </span>
                    <h3 className="mt-4 font-display text-3xl font-medium leading-tight text-marron sm:text-4xl">
                      Guided by what you tell us.
                    </h3>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
                      &quot;Personalized&quot; here means a shortlist shaped around your own choices
                      below. We do not add engraving, monograms or custom details that are not part
                      of a product — every price, image and description you see is exactly as it is
                      in our collection.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <Button variant="primary" size="sm" onClick={scrollToAssistant}>
                        Shape my suggestions
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExploreCollection()}
                      >
                        See the whole collection
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-4xl border border-marron/10 bg-cream/85 p-6 shadow-soft">
                    <p className="label-micro text-cyan-deep">
                      Your choices so far
                    </p>
                    {selectedLabels.length === 0 ? (
                      <p className="mt-4 text-sm leading-relaxed text-muted">
                        Nothing selected yet. Choose a budget, occasion, category or style in the
                        assistant and your guide will appear here.
                      </p>
                    ) : (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedLabels.map((label) => (
                          <Badge key={label} tone="marron">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {shortlist[0] && (
                      <div className="mt-6 flex items-center gap-4 border-t border-marron/10 pt-5">
                        <div className="frame-image h-16 w-14 shrink-0 overflow-hidden rounded-2xl">
                          <img
                            src={imageSource(shortlist[0].image)}
                            alt={shortlist[0].name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="label-micro text-cyan-deep">
                            Current first match
                          </p>
                          <p className="line-clamp-2 font-display text-lg font-medium leading-tight text-marron">
                            {shortlist[0].name}
                          </p>
                          <p className="text-xs text-muted">{formatPrice(shortlist[0].price)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Gift discovery assistant */}
      <div id="gift-assistant" className="bg-paper-texture section-y">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start">
            <div className="glass-panel rounded-5xl p-6 sm:p-8 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overscroll-contain">
              <Badge tone="cyan">
                <SlidersHorizontal className="mr-1.5 h-3 w-3" aria-hidden="true" />
                Gift discovery assistant
              </Badge>
              <h2 className="mt-5 font-display text-[length:var(--type-subhead)] font-medium leading-[1.12] text-marron">
                Tell us a little about your gift.
              </h2>
              <p className="mt-3 text-sm leading-[1.8] text-muted">
                Every choice narrows the shortlist beside you. Leave anything blank if you would
                rather keep an open mind.
              </p>

              <div className="mt-8 space-y-7">
                <ControlGroup
                  label="Budget"
                  icon={<Wallet className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  {BUDGET_OPTIONS.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      selected={budget === option.value}
                      onClick={() => toggle(setBudget, option.value)}
                    />
                  ))}
                </ControlGroup>

                <ControlGroup
                  label="Occasion"
                  icon={<Gift className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  {OCCASIONS.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      selected={occasion === option.value}
                      onClick={() => toggle(setOccasion, option.value)}
                    />
                  ))}
                </ControlGroup>

                <ControlGroup
                  label="Category"
                  icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      selected={category === option.value}
                      onClick={() => toggle(setCategory, option.value)}
                    />
                  ))}
                </ControlGroup>

                <ControlGroup
                  label="Style preference"
                  icon={<Palette className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  {STYLE_OPTIONS.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      selected={style === option.value}
                      onClick={() => toggle(setStyle, option.value)}
                    />
                  ))}
                </ControlGroup>
              </div>

              <Button variant="ghost" size="sm" className="mt-8" onClick={resetChoices}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset choices
              </Button>
            </div>

            <div>
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="label-micro text-cyan-deep">
                    {hasChoices ? 'Your little shortlist' : 'A few favourites to begin'}
                  </p>
                  <h2 className="mt-3 font-display text-[length:var(--type-subhead)] font-medium leading-[1.12] text-marron">
                    {hasChoices ? 'Chosen from our collection' : 'Start with the friends we love'}
                  </h2>
                </div>
                <Badge tone="marron">
                  {shortlist.length} little {shortlist.length === 1 ? 'friend' : 'friends'}
                </Badge>
              </div>

              {shortlist.length === 0 ? (
                <div className="rounded-5xl border border-marron/15 bg-cream px-6 py-14 text-center shadow-soft">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-tint text-cyan-deep">
                    <Sparkles className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-medium text-marron">
                    No friend fits every choice just yet
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                    We only suggest friends we actually have. Try removing one of your choices, or
                    browse the whole collection.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Button variant="primary" onClick={resetChoices}>
                      Clear my choices
                    </Button>
                    <Button variant="secondary" onClick={() => onExploreCollection()}>
                      Explore the collection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {shortlist.map((product, index) => (
                    <MiniMatch
                      key={product.id}
                      product={product}
                      index={index}
                      onProductSelect={onProductSelect}
                      onExploreCollection={onExploreCollection}
                    />
                  ))}
                </div>
              )}

              {dollProduct && (
                <Reveal className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-4xl border border-marron/10 bg-cream/70 px-6 py-5">
                    <p className="max-w-xl text-xs leading-relaxed text-muted">
                      Still deciding? This little idea came from the collection itself — nothing
                      here is a made-up product or a personalisation claim.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onProductSelect(dollProduct)}
                    >
                      Meet {dollProduct.name}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
