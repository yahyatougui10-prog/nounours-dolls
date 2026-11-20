import React from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  RotateCcw,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { editorialEase } from '../../design-system/motion'
import { formatPrice, type Product } from '../../data/products'
import { prefersReducedMotion } from '../../lib/scroll'
import { Button } from '../ui/Button'
import {
  BUDGET_OPTIONS,
  COLOR_OPTIONS,
  STYLE_OPTIONS,
  budgetLabel,
  imageSource,
  inBudget,
  productColorFamilies,
  productStyles,
  type BudgetKey,
  type ColorFamily,
  type StyleKey,
} from '../discovery/signals'

export interface FriendFinderPageProps {
  products: Product[]
  onProductSelect: (product: Product) => void
  onExploreCollection: (category?: string, search?: string) => void
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void
}

type FriendType = 'teddy' | 'doll' | 'gift' | 'any'
type RecipientType = 'me' | 'gift'

interface Answers {
  friend?: FriendType
  style?: StyleKey
  budget?: BudgetKey
  recipient?: RecipientType
  color?: ColorFamily
}

const STEPS = [
  {
    key: 'friend',
    eyebrow: '01 · the little one',
    title: 'Who are we looking for?',
    description: 'Start with the kind of companion that feels right.',
  },
  {
    key: 'style',
    eyebrow: '02 · the personality',
    title: 'What is their style?',
    description: 'We read this from the words already in our collection.',
  },
  {
    key: 'budget',
    eyebrow: '03 · the budget',
    title: 'What feels comfortable?',
    description: 'A little guide, so every suggestion stays within reach.',
  },
  {
    key: 'recipient',
    eyebrow: '04 · the reason',
    title: 'Who is it for?',
    description: 'This only changes how we tell you about them, never the friend itself.',
  },
  {
    key: 'color',
    eyebrow: '05 · the colours',
    title: 'Which colours do you love?',
    description: 'We match against the real colour palette of each friend.',
  },
] as const

const answerKeys: Array<keyof Answers> = ['friend', 'style', 'budget', 'recipient', 'color']

const stepVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 38 : -38 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: editorialEase } },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -38 : 38,
    transition: { duration: 0.24, ease: editorialEase },
  }),
}

const isAnswered = (step: number, answers: Answers): boolean =>
  Boolean(answers[answerKeys[step]])

const scoreProduct = (product: Product, answers: Answers): number => {
  const constrained = Boolean(
    (answers.friend && answers.friend !== 'any') ||
      answers.style ||
      answers.budget ||
      answers.color,
  )
  if (!constrained) return 1

  let score = 0
  if (answers.friend && answers.friend !== 'any' && answers.friend === product.categoryKey) {
    score += 3
  }
  if (answers.style && productStyles(product).includes(answers.style)) score += 2
  if (answers.budget && inBudget(product, answers.budget)) score += 2
  if (answers.color && productColorFamilies(product).includes(answers.color)) score += 2
  return score
}

interface ChoiceCardProps {
  name: string
  value: string
  label: string
  hint: string
  checked: boolean
  onChange: () => void
  swatch?: string
  variant?: 'card' | 'swatch'
}

const ChoiceCard: React.FC<ChoiceCardProps> = ({
  name,
  value,
  label,
  hint,
  checked,
  onChange,
  swatch,
  variant = 'card',
}) => (
  <label className="group relative block cursor-pointer">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="peer sr-only"
    />
    <span
      className={`flex h-full border transition-[background-color,border-color,box-shadow] duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-deep peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ivory ${
        variant === 'swatch'
          ? 'w-full flex-col items-center gap-2 rounded-3xl border-marron/15 bg-cream px-3 py-4 text-center shadow-soft hover:border-cyan/50'
          : 'min-h-[104px] flex-col justify-between rounded-3xl border-marron/15 bg-cream p-4 shadow-soft hover:border-cyan/50'
      } ${checked ? 'border-cyan bg-cyan-tint shadow-glow' : 'hover:bg-white'}`}
    >
      {swatch && (
        <span
          className={`h-8 w-8 rounded-full ring-1 ring-marron/20 ${checked ? 'ring-2 ring-cyan' : ''}`}
          style={{ backgroundColor: swatch }}
          aria-hidden="true"
        />
      )}
      <span className="flex w-full items-start justify-between gap-2">
        <span className="text-sm font-semibold text-marron">{label}</span>
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
            checked ? 'border-cyan-deep bg-cyan text-marron-deep' : 'border-marron/25 text-transparent'
          }`}
          aria-hidden="true"
        >
          <Check className="h-3 w-3" />
        </span>
      </span>
      {variant !== 'swatch' && (
        <span className="mt-2 block text-xs leading-relaxed text-muted">{hint}</span>
      )}
    </span>
  </label>
)

interface MatchCardProps {
  product: Product
  index: number
  note: string
  onProductSelect: (product: Product) => void
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void
}

const MatchCard: React.FC<MatchCardProps> = ({
  product,
  index,
  note,
  onProductSelect,
  onAddToCart,
}) => (
  <motion.article
    initial={{ opacity: 0, y: 22 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.08, ease: editorialEase }}
    className="group flex h-full flex-col overflow-hidden rounded-4xl border border-marron/12 bg-cream shadow-soft transition-[border-color,box-shadow] hover:border-cyan/45 hover:shadow-lift"
  >
    <div className="frame-image relative aspect-[4/3] overflow-hidden">
      <img
        src={imageSource(product.image)}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute left-4 top-4">
        <Badge tone={index === 0 ? 'red' : 'cyan'}>{note}</Badge>
      </div>
    </div>

    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <span className="label-micro text-cyan-deep">
        {product.category}
      </span>
      <h3 className="mt-2 font-display text-2xl font-medium leading-tight text-marron">
        {product.name}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{product.description}</p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-marron/10 pt-4">
        <span className="font-display text-xl font-semibold tabular-nums text-marron">
          {formatPrice(product.price)}
        </span>
        {product.tag && <Badge tone="marron">{product.tag}</Badge>}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => onProductSelect(product)}>
          View friend
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          variant="accent"
          size="sm"
          onClick={() =>
            onAddToCart(
              product,
              product.sizes[0] ?? 'One size',
              product.colors[0] ?? '',
              1,
            )
          }
        >
          <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
          Add to bag
        </Button>
      </div>
    </div>
  </motion.article>
)

export const FriendFinderPage: React.FC<FriendFinderPageProps> = ({
  products,
  onProductSelect,
  onExploreCollection,
  onAddToCart,
}) => {
  const [step, setStep] = React.useState(0)
  const [direction, setDirection] = React.useState(1)
  const [answers, setAnswers] = React.useState<Answers>({})
  const [resultsVisible, setResultsVisible] = React.useState(false)
  const resultsRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!resultsVisible) return
    resultsRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [resultsVisible])

  const recommendations = React.useMemo(
    () =>
      products
        .map((product, index) => ({ product, index, score: scoreProduct(product, answers) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .slice(0, 3)
        .map((entry) => entry.product),
    [answers, products],
  )

  const handleAnswer = <K extends keyof Answers>(key: K, value: NonNullable<Answers[K]>) => {
    setAnswers((previous) => ({ ...previous, [key]: value }))
    setResultsVisible(false)
  }

  const handleNext = () => {
    if (step === STEPS.length - 1) {
      setResultsVisible(true)
      return
    }
    setDirection(1)
    setStep((current) => current + 1)
  }

  const handleBack = () => {
    if (step === 0) return
    setDirection(-1)
    setStep((current) => current - 1)
  }

  const handleRestart = () => {
    setDirection(-1)
    setStep(0)
    setAnswers({})
    setResultsVisible(false)
  }

  const handleBroaden = () => {
    setAnswers((previous) => ({
      ...previous,
      friend: undefined,
      style: undefined,
      budget: undefined,
      color: undefined,
    }))
    setResultsVisible(true)
  }

  const friendCategory =
    answers.friend && answers.friend !== 'any' ? answers.friend : undefined

  const resultsCopy =
    answers.recipient === 'gift'
      ? {
          eyebrow: 'Chosen with care',
          title: 'A little friend to give',
          note: 'A thoughtful match for someone special. Every detail below comes straight from our boutique.',
        }
      : {
          eyebrow: 'Picked for you',
          title: 'Your little friend awaits',
          note: 'A companion shaped by the things you told us about your little world.',
        }

  const activeStep = STEPS[step]

  return (
    <section className="relative overflow-hidden bg-paper-texture section-y">
      <div
        className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-cyan/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-red/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative page-container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-cyan-deep" aria-hidden="true" />
            <span className="label-micro text-marron-soft">
              The little friend finder
            </span>
            <span className="h-px w-10 bg-cyan-deep" aria-hidden="true" />
          </div>
          <h1 className="text-balance font-display text-[length:var(--type-section)] font-medium leading-[1.06] text-marron">
            Let's Find Your Little Friend!
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-[1.8] text-muted sm:text-lg">
            Five tiny questions, one very real little friend. We only ever recommend companions
            from our own collection.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          <div className="glass-panel overflow-hidden rounded-5xl p-5 sm:p-9">
            <div className="mb-8 flex items-center justify-between gap-4">
              <span className="label-micro text-cyan-deep">
                Step {step + 1}/{STEPS.length}
              </span>
              <div
                className="flex w-28 gap-1.5 sm:w-48"
                role="progressbar"
                aria-label="Friend finder progress"
                aria-valuemin={1}
                aria-valuemax={STEPS.length}
                aria-valuenow={step + 1}
              >
                {STEPS.map((item, index) => (
                  <span
                    key={item.key}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      index <= step ? 'bg-cyan-deep' : 'bg-marron/12'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={activeStep.key}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="min-h-[580px] sm:min-h-[380px] lg:min-h-[380px]"
              >
                <p className="label-micro text-cyan-deep">
                  {activeStep.eyebrow}
                </p>
                <h2 className="mt-4 font-display text-[length:var(--type-subhead)] font-medium leading-[1.12] text-marron">
                  {activeStep.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-[1.8] text-muted">
                  {activeStep.description}
                </p>

                {step === 0 && (
                  <div
                    role="radiogroup"
                    aria-label="Kind of little friend"
                    className="mt-8 grid gap-3 sm:grid-cols-2"
                  >
                    <ChoiceCard
                      name="friend-type"
                      value="teddy"
                      label="A teddy bear"
                      hint="Soft, cuddly and always close"
                      checked={answers.friend === 'teddy'}
                      onChange={() => handleAnswer('friend', 'teddy')}
                    />
                    <ChoiceCard
                      name="friend-type"
                      value="doll"
                      label="A beautiful doll"
                      hint="A little friend with her own style"
                      checked={answers.friend === 'doll'}
                      onChange={() => handleAnswer('friend', 'doll')}
                    />
                    <ChoiceCard
                      name="friend-type"
                      value="gift"
                      label="A little gift set"
                      hint="Two friends together in one box"
                      checked={answers.friend === 'gift'}
                      onChange={() => handleAnswer('friend', 'gift')}
                    />
                    <ChoiceCard
                      name="friend-type"
                      value="any"
                      label="Surprise me"
                      hint="Show me friends of every kind"
                      checked={answers.friend === 'any'}
                      onChange={() => handleAnswer('friend', 'any')}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div
                    role="radiogroup"
                    aria-label="Style preference"
                    className="mt-8 grid gap-3 sm:grid-cols-2"
                  >
                    {STYLE_OPTIONS.map((option) => (
                      <ChoiceCard
                        key={option.value}
                        name="friend-style"
                        value={option.value}
                        label={option.label}
                        hint={option.hint}
                        checked={answers.style === option.value}
                        onChange={() => handleAnswer('style', option.value)}
                      />
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div
                    role="radiogroup"
                    aria-label="Budget"
                    className="mt-8 grid gap-3 sm:grid-cols-3"
                  >
                    {BUDGET_OPTIONS.map((option) => (
                      <ChoiceCard
                        key={option.value}
                        name="friend-budget"
                        value={option.value}
                        label={budgetLabel(option.value)}
                        hint={option.hint}
                        checked={answers.budget === option.value}
                        onChange={() => handleAnswer('budget', option.value)}
                      />
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div
                    role="radiogroup"
                    aria-label="Who the friend is for"
                    className="mt-8 grid gap-3 sm:grid-cols-2"
                  >
                    <ChoiceCard
                      name="friend-recipient"
                      value="me"
                      label="For me"
                      hint="A companion for your own little world"
                      checked={answers.recipient === 'me'}
                      onChange={() => handleAnswer('recipient', 'me')}
                    />
                    <ChoiceCard
                      name="friend-recipient"
                      value="gift"
                      label="As a special gift"
                      hint="A thoughtful surprise for someone you love"
                      checked={answers.recipient === 'gift'}
                      onChange={() => handleAnswer('recipient', 'gift')}
                    />
                  </div>
                )}

                {step === 4 && (
                  <div
                    role="radiogroup"
                    aria-label="Favourite colour family"
                    className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5"
                  >
                    {COLOR_OPTIONS.map((option) => (
                      <ChoiceCard
                        key={option.value}
                        name="friend-color"
                        value={option.value}
                        label={option.label}
                        hint={option.hint}
                        swatch={option.swatch}
                        variant="swatch"
                        checked={answers.color === option.value}
                        onChange={() => handleAnswer('color', option.value)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-marron/10 pt-6">
              <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
              <Button
                variant={step === STEPS.length - 1 ? 'accent' : 'primary'}
                onClick={handleNext}
                disabled={!isAnswered(step, answers)}
              >
                {step === STEPS.length - 1 ? (
                  <>
                    Find my friend
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {resultsVisible && (
              <motion.section
                ref={resultsRef}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.45, ease: editorialEase }}
                className="mt-14"
                aria-live="polite"
              >
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="label-micro text-cyan-deep">
                      {resultsCopy.eyebrow}
                    </p>
                    <h2 className="mt-3 font-display text-[length:var(--type-subhead)] font-medium leading-[1.12] text-marron">
                      {resultsCopy.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-[1.8] text-muted">
                      {resultsCopy.note}
                    </p>
                  </div>
                  {recommendations.length > 0 && (
                    <Badge tone="marron">
                      {recommendations.length} little {recommendations.length === 1 ? 'match' : 'matches'}
                    </Badge>
                  )}
                </div>

                {recommendations.length === 0 ? (
                  <div className="rounded-5xl border border-marron/15 bg-cream px-6 py-14 text-center shadow-soft">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-tint text-cyan-deep">
                      <Sparkles className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 font-display text-2xl font-medium text-marron">
                      No little friend fits every wish just yet
                    </h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                      We would rather be honest than invent a friend. Loosen a few details and we
                      will look again at the companions we really have.
                    </p>
                    <div className="mt-7 flex flex-wrap justify-center gap-3">
                      <Button variant="primary" onClick={handleBroaden}>
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Broaden my search
                      </Button>
                      <Button variant="secondary" onClick={() => onExploreCollection()}>
                        Explore the collection
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`grid gap-5 ${
                      recommendations.length === 1
                        ? 'md:mx-auto md:max-w-sm md:grid-cols-1'
                        : recommendations.length === 2
                          ? 'md:grid-cols-2'
                          : 'md:grid-cols-3'
                    }`}
                  >
                    {recommendations.map((product, index) => (
                      <MatchCard
                        key={product.id}
                        product={product}
                        index={index}
                        note={index === 0 ? 'Lovely match' : 'Also loved'}
                        onProductSelect={onProductSelect}
                        onAddToCart={onAddToCart}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button variant="ghost" size="sm" onClick={handleRestart}>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Start again
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExploreCollection(friendCategory)}
                  >
                    Browse every little friend
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
