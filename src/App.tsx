import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  ExternalLink,
  Filter,
  GraduationCap,
  HandCoins,
  Laptop,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sunrise,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import { createEmailAccount, sendPasswordReset, signInWithEmail, signInWithGoogle, signOutUser } from "./lib/auth";
import { auth, firebaseConfigured } from "./lib/firebase";
import {
  saveOpportunity,
  subscribeToOpportunities,
  subscribeToSavedOpportunities,
  unsaveOpportunity,
  type OpportunityRecord,
} from "./lib/opportunities";

type AuthMode = "signin" | "signup" | "reset" | null;

type Category =
  | "Scholarships"
  | "Internships"
  | "Hackathons"
  | "Grants"
  | "Competitions"
  | "Events";

type SortMode = "featured" | "closing" | "newest";
type PageMode = "discover" | "saved";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: Category;
  description: string;
  deadline: string;
  deadlineTime: number;
  value: string;
  location: string;
  format: "Online" | "On-site" | "Hybrid";
  addedDaysAgo: number;
  tags: string[];
  isSample?: boolean;
  sourceUrl?: string | null;
  applicationUrl?: string | null;
  eligibility?: string[];
  status?: "open" | "closed" | "unverified";
};

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Scholarships: GraduationCap,
  Internships: BriefcaseBusiness,
  Hackathons: Laptop,
  Grants: HandCoins,
  Competitions: Trophy,
  Events: CalendarDays,
};

const CATEGORY_TONES: Record<Category, string> = {
  Scholarships: "lilac",
  Internships: "mint",
  Hackathons: "blue",
  Grants: "peach",
  Competitions: "yellow",
  Events: "rose",
};

// These are intentionally fictional examples for the UI prototype—not live opportunities.
const OPPORTUNITIES: Opportunity[] = [
  {
    id: "sample-1",
    title: "Bayanihan Future Scholarship",
    organization: "Alvora Sample Foundation",
    category: "Scholarships",
    description: "An illustrative scholarship listing for learners building their next chapter. Real listings will include verified eligibility, funding details, and an official application source.",
    deadline: "Nov 12, 2026",
    deadlineTime: new Date("2026-11-12T23:59:00+08:00").getTime(),
    value: "Up to ₱50,000",
    location: "Philippines",
    format: "Online",
    addedDaysAgo: 1,
    tags: ["Undergraduate", "Financial aid"],
  },
  {
    id: "sample-2",
    title: "Visayas Build Sprint",
    organization: "Alvora Demo Community",
    category: "Hackathons",
    description: "A sample team-based build event for people who want to prototype useful products, meet collaborators, and practice shipping ideas.",
    deadline: "Oct 28, 2026",
    deadlineTime: new Date("2026-10-28T23:59:00+08:00").getTime(),
    value: "₱100,000 prize pool",
    location: "Cebu City",
    format: "Hybrid",
    addedDaysAgo: 2,
    tags: ["Team event", "Open theme"],
  },
  {
    id: "sample-3",
    title: "Research Seeds Microgrant",
    organization: "Alvora Sample Research Network",
    category: "Grants",
    description: "A placeholder grant call for early-stage research ideas. A real listing will show funder requirements, allowed expenses, and application documents.",
    deadline: "Nov 5, 2026",
    deadlineTime: new Date("2026-11-05T23:59:00+08:00").getTime(),
    value: "Up to ₱75,000",
    location: "Philippines",
    format: "Online",
    addedDaysAgo: 4,
    tags: ["Research", "Early-stage"],
  },
  {
    id: "sample-4",
    title: "Early Career Experience Program",
    organization: "Alvora Demo Partners",
    category: "Internships",
    description: "A sample early-career placement to demonstrate how role details, work setup, eligibility, and application deadlines will appear.",
    deadline: "Dec 1, 2026",
    deadlineTime: new Date("2026-12-01T23:59:00+08:00").getTime(),
    value: "Paid placement",
    location: "Metro Manila",
    format: "Hybrid",
    addedDaysAgo: 5,
    tags: ["Entry level", "Mentorship"],
  },
  {
    id: "sample-5",
    title: "Open Innovation Challenge",
    organization: "Alvora Demo Challenge",
    category: "Competitions",
    description: "A demonstration challenge for problem-solvers with an idea to pitch. The full product will prioritize clear rules, judging criteria, and official sources.",
    deadline: "Oct 24, 2026",
    deadlineTime: new Date("2026-10-24T23:59:00+08:00").getTime(),
    value: "Awards + mentorship",
    location: "Philippines",
    format: "Online",
    addedDaysAgo: 3,
    tags: ["Open to all", "Pitching"],
  },
  {
    id: "sample-6",
    title: "Cebu Tech & Creators Week",
    organization: "Alvora Demo Events",
    category: "Events",
    description: "A sample community event for meeting builders, exploring new tools, and hearing from people working on technology and creative projects.",
    deadline: "Nov 18, 2026",
    deadlineTime: new Date("2026-11-18T23:59:00+08:00").getTime(),
    value: "Free registration",
    location: "Cebu City",
    format: "On-site",
    addedDaysAgo: 6,
    tags: ["Networking", "Community"],
  },
  {
    id: "sample-7",
    title: "Community Digital Skills Fellowship",
    organization: "Alvora Demo Partners",
    category: "Internships",
    description: "A placeholder fellowship focused on hands-on learning and community projects. Real programme pages will identify host organizations and requirements.",
    deadline: "Nov 8, 2026",
    deadlineTime: new Date("2026-11-08T23:59:00+08:00").getTime(),
    value: "Stipend available",
    location: "Davao City",
    format: "Hybrid",
    addedDaysAgo: 8,
    tags: ["Skills building", "Community"],
  },
  {
    id: "sample-8",
    title: "Student Research Poster Awards",
    organization: "Alvora Sample Research Network",
    category: "Competitions",
    description: "A fictional poster competition used to preview how research awards and submission requirements can be discovered in one catalogue.",
    deadline: "Nov 4, 2026",
    deadlineTime: new Date("2026-11-04T23:59:00+08:00").getTime(),
    value: "Awards + feedback",
    location: "Philippines",
    format: "Online",
    addedDaysAgo: 9,
    tags: ["Research", "Students"],
  },
];

const CATEGORIES: Category[] = [
  "Scholarships",
  "Internships",
  "Hackathons",
  "Grants",
  "Competitions",
  "Events",
];

function dateEpoch(value: unknown): number | null {
  if (!value) return null;
  if (value instanceof Date) {
    const epoch = value.getTime();
    return Number.isFinite(epoch) ? epoch : null;
  }
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const toDate = (value as { toDate?: () => Date }).toDate;
    if (typeof toDate === "function") {
      const epoch = toDate.call(value).getTime();
      return Number.isFinite(epoch) ? epoch : null;
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    const epoch = new Date(value).getTime();
    return Number.isFinite(epoch) ? epoch : null;
  }
  return null;
}

function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function fromFirestore(record: OpportunityRecord): Opportunity {
  const raw = record as OpportunityRecord & Record<string, unknown>;
  const dueAt = dateEpoch(raw.deadlineAt) ?? dateEpoch(raw.deadline);
  const dueLabel = dueAt
    ? new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(dueAt)
    : record.deadline || "Not specified";
  const createdAt = dateEpoch(raw.createdAt) ?? dateEpoch(record.verifiedAt);
  const validCategory = CATEGORIES.includes(record.category) ? record.category : "Events";
  const format = record.format === "On-site" || record.format === "Hybrid" ? record.format : "Online";

  return {
    id: record.id,
    title: record.title || "Untitled opportunity",
    organization: record.organization || "Organization not specified",
    category: validCategory,
    description: record.description || "No description has been provided yet.",
    deadline: dueLabel,
    deadlineTime: dueAt ?? Number.MAX_SAFE_INTEGER,
    value: record.value || "Not specified",
    location: record.location || "Philippines",
    format,
    addedDaysAgo: createdAt ? Math.max(0, Math.floor((Date.now() - createdAt) / 86_400_000)) : 0,
    tags: Array.isArray(record.tags) ? record.tags : [],
    isSample: false,
    sourceUrl: safeHttpUrl(record.sourceUrl),
    applicationUrl: safeHttpUrl(record.applicationUrl),
    eligibility: Array.isArray(record.eligibility) ? record.eligibility : [],
    status: record.status || "unverified",
  };
}

function authErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  if (code === "auth/email-already-in-use") return "An account with this email already exists. Sign in instead.";
  if (code === "auth/weak-password") return "Choose a stronger password with at least 6 characters.";
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") return "The email or password is incorrect.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait a little and try again.";
  if (code === "auth/unauthorized-domain") return "This website domain is not authorized in Firebase Authentication settings.";
  if (code === "auth/popup-blocked") return "Your browser blocked the Google sign-in window. Allow popups and try again.";
  if (code === "auth/popup-closed-by-user") return "Google sign-in was closed before completion.";
  if (error instanceof Error && error.message) return error.message;
  return "Authentication failed. Please try again.";
}

function OpportunityCard({
  item,
  isSaved,
  onSave,
  onOpen,
}: {
  item: Opportunity;
  isSaved: boolean;
  onSave: (id: string) => void;
  onOpen: (item: Opportunity) => void;
}) {
  const Icon = CATEGORY_ICONS[item.category];

  return (
    <article className="opportunity-card">
      <div className="card-topline">
        <div className={"opportunity-icon " + CATEGORY_TONES[item.category]}>
          <Icon size={21} strokeWidth={1.8} />
        </div>
        <span className="sample-tag">{item.isSample === false ? (item.status === "unverified" ? "Needs verification" : "Opportunity") : "Sample listing"}</span>
        <button
          type="button"
          className={"icon-button save-button" + (isSaved ? " is-saved" : "")}
          aria-label={isSaved ? "Remove from saved" : "Save opportunity"}
          title={isSaved ? "Remove from saved" : "Save opportunity"}
          onClick={() => onSave(item.id)}
        >
          {isSaved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
        </button>
      </div>

      <div className="card-copy">
        <p className="card-category">{item.category}</p>
        <h3>{item.title}</h3>
        <p className="organization">{item.organization}</p>
        <p className="card-description">{item.description}</p>
      </div>

      <div className="card-tags">
        {item.tags.map((tag) => (
          <span className="tiny-tag" key={tag}>{tag}</span>
        ))}
      </div>

      <div className="card-meta">
        <span><Clock3 size={14} /> Deadline {item.deadline}</span>
        <span><MapPin size={14} /> {item.location}</span>
      </div>

      <div className="card-footer">
        <div className="value-block">
          <span>Opportunity value</span>
          <strong>{item.value}</strong>
        </div>
        <button type="button" className="text-action" onClick={() => onOpen(item)}>
          View details <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [page, setPage] = useState<PageMode>("discover");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [remoteOpportunities, setRemoteOpportunities] = useState<Opportunity[] | null>(null);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState("");
  const catalogueRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!firebaseConfigured) return;
    try {
      return subscribeToOpportunities(
        (records) => {
          setRemoteOpportunities(records.filter((record) => record.status !== "closed").map(fromFirestore));
        },
        (error) => {
          console.error("Could not load Firestore opportunities:", error);
          setRemoteOpportunities(null);
          setToast("Could not load the Firestore catalogue. Showing sample listings instead.");
        },
      );
    } catch (error) {
      console.error("Could not subscribe to Firestore opportunities:", error);
      setRemoteOpportunities(null);
      setToast("Could not connect to Firestore. Showing sample listings instead.");
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedIds([]);
      return;
    }
    return subscribeToSavedOpportunities(
      user.uid,
      setSavedIds,
      (error) => {
        console.error("Could not sync saved opportunities:", error);
        setToast("Your saved items couldn't sync. Check that the Firestore security rules are published.");
      },
    );
  }, [user]);

  const usingSamples = !remoteOpportunities || remoteOpportunities.length === 0;
  const activeOpportunities = usingSamples ? OPPORTUNITIES : remoteOpportunities;

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let results = activeOpportunities.filter((item) => {
      const matchesPage = page !== "saved" || savedIds.includes(item.id);
      const matchesCategory = category === "All" || item.category === category;
      const haystack = [
        item.title,
        item.organization,
        item.category,
        item.description,
        item.location,
        item.value,
        ...item.tags,
      ].join(" ").toLowerCase();
      return matchesPage && matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    });

    if (sortMode === "closing") {
      results = [...results].sort((a, b) => a.deadlineTime - b.deadlineTime);
    } else if (sortMode === "newest") {
      results = [...results].sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
    }
    return results;
  }, [activeOpportunities, page, query, category, sortMode, savedIds]);

  const changePage = (nextPage: PageMode) => {
    setPage(nextPage);
    setMobileNavOpen(false);
    setCategory("All");
  };

  const toggleSave = async (id: string) => {
    if (!authReady) {
      setToast("Checking your account. Please try saving again in a moment.");
      return;
    }
    if (!user) {
      setAuthError("");
      setAuthMode("signin");
      setToast("Sign in to save opportunities across devices.");
      return;
    }

    const wasSaved = savedIds.includes(id);
    setSavedIds((current) => wasSaved
      ? current.filter((savedId) => savedId !== id)
      : [...current, id]);

    try {
      if (wasSaved) {
        await unsaveOpportunity(user.uid, id);
        setToast("Removed from your saved opportunities.");
      } else {
        await saveOpportunity(user.uid, id);
        setToast("Saved to your account.");
      }
    } catch (error) {
      console.error("Could not update a saved opportunity:", error);
      setSavedIds((current) => wasSaved
        ? Array.from(new Set([...current, id]))
        : current.filter((savedId) => savedId !== id));
      setToast("Could not sync your saved item. Check Firestore security rules and try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    setAuthError("");
    try {
      await signInWithGoogle();
      setAuthMode(null);
      setAuthPassword("");
      setToast("You're signed in to Alvora.");
    } catch (error) {
      setAuthError(authErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      if (authMode === "signup") {
        await createEmailAccount(authEmail.trim(), authPassword);
        setToast("Your Alvora account has been created.");
      } else if (authMode === "reset") {
        await sendPasswordReset(authEmail);
        setToast("If that email is registered, a password reset message will be sent.");
      } else {
        await signInWithEmail(authEmail.trim(), authPassword);
        setToast("You're signed in to Alvora.");
      }
      setAuthMode(null);
      setAuthPassword("");
    } catch (error) {
      setAuthError(authErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setToast("You've signed out.");
    } catch (error) {
      setToast(authErrorMessage(error));
    }
  };

  const openAuth = (mode: AuthMode) => {
    setAuthError("");
    setAuthMode(mode);
  };

  const browseAll = () => {
    changePage("discover");
    setQuery("");
    setCategory("All");
    window.requestAnimationFrame(() => catalogueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setSortMode("featured");
  };

  const pageTitle = page === "saved" ? "Your saved opportunities" : "Find your next opportunity";
  const pageSubtitle = page === "saved"
    ? "Keep the options you care about close at hand."
    : "A clearer place to discover what could come next.";

  return (
    <div className="app-shell">
      {mobileNavOpen && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setMobileNavOpen(false)} />}
      <aside className={"sidebar" + (mobileNavOpen ? " sidebar-open" : "")}>
        <div className="brand-area">
          <button type="button" className="brand" onClick={browseAll} aria-label="Alvora home">
            <span className="brand-mark"><Sunrise size={25} strokeWidth={1.9} /></span>
            <span className="brand-word">alvora<span>.</span><small>Discover what's possible</small></span>
          </button>
          <button type="button" className="mobile-close icon-button" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
            <X size={19} />
          </button>
        </div>

        <div className="nav-label">YOUR SPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <button type="button" className={"nav-item" + (page === "discover" ? " active" : "")} onClick={() => changePage("discover")}>
            <Compass size={19} /> <span>Discover</span><ChevronRight size={16} className="nav-chevron" />
          </button>
          <button type="button" className={"nav-item" + (page === "saved" ? " active" : "")} onClick={() => changePage("saved")}>
            <Bookmark size={19} /> <span>Saved opportunities</span>
            {savedIds.length > 0 && <span className="nav-count">{savedIds.length}</span>}
          </button>
        </nav>

        <div className="sidebar-divider" />
        <div className="nav-label">EXPLORE BY TYPE</div>
        <nav className="category-nav" aria-label="Opportunity categories">
          {CATEGORIES.map((item) => {
            const Icon = CATEGORY_ICONS[item];
            return (
              <button
                type="button"
                key={item}
                className={"category-nav-item" + (category === item && page === "discover" ? " selected" : "")}
                onClick={() => {
                  changePage("discover");
                  setCategory(item);
                  setMobileNavOpen(false);
                  window.requestAnimationFrame(() => catalogueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
                }}
              >
                <Icon size={17} /><span>{item}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-promo">
          <div className="promo-spark"><Sparkles size={18} /></div>
          <p className="promo-title">Your next chapter is out there.</p>
          <p className="promo-copy">Start exploring. The right opportunity can change your direction.</p>
          <button type="button" onClick={browseAll}>Explore listings <ArrowRight size={15} /></button>
        </div>
        <div className="sidebar-profile">
          <div className="avatar">{user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"}</div>
          <div className="profile-copy">
            <strong>{user?.displayName || (user ? "Alvora member" : "Guest explorer")}</strong>
            <span>{user?.email || "Sign in to sync saved items"}</span>
          </div>
          {user ? (
            <button type="button" className="profile-action" onClick={() => void handleSignOut()} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
          ) : (
            <button type="button" className="profile-action" onClick={() => openAuth("signin")} aria-label="Sign in" title="Sign in"><LogIn size={16} /></button>
          )}
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button type="button" className="icon-button menu-trigger" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
            <Menu size={21} />
          </button>
          <div className="breadcrumbs"><span>Alvora</span><ChevronRight size={14} /><strong>{page === "saved" ? "Saved" : "Discover"}</strong></div>
          <label className="top-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search opportunities, skills, or locations..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search opportunities"
            />
            <kbd>/</kbd>
          </label>
          <div className="top-actions">
            <button type="button" className="icon-button alert-button" aria-label="Show notification status" onClick={() => setToast("You're all caught up. Live deadline alerts will arrive in a later phase.")}>
              <span className="notification-dot" /><Sparkles size={19} />
            </button>
            <button type="button" className="top-avatar" aria-label={user ? "Signed-in account" : "Sign in to Alvora"} title={user?.email || "Sign in to Alvora"} onClick={() => user ? setToast("Signed in as " + (user.email || "Alvora member")) : openAuth("signin")}>
              {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"}
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="preview-notice">
            <span className="notice-icon"><Sparkles size={15} /></span>
            {usingSamples ? (
              <span><strong>Preview mode</strong> — these are sample listings, not verified live opportunities.</span>
            ) : (
              <span><strong>Firestore connected</strong> — showing published opportunities from your database. Verify each organizer before applying.</span>
            )}
            <button type="button" onClick={() => setToast(usingSamples ? "Demo cards are shown until published opportunity documents are available in Firestore." : "These records are loaded from Firestore. Confirm each source and deadline before relying on a listing.")}>What does this mean? <ChevronRight size={14} /></button>
          </div>

          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> OPPORTUNITY, AT YOUR PACE</div>
              <h1>{page === "saved" ? <>Keep the good ones<br /><span>within reach.</span></> : <>Your next big thing<br /><span>starts somewhere.</span></>}</h1>
              <p className="welcome-description">{pageSubtitle}</p>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />
              <div className="art-sun"><Sunrise size={59} strokeWidth={1.25} /></div>
              <div className="art-star star-one">✳</div>
              <div className="art-star star-two">✦</div>
              <div className="art-spark spark-one" />
              <div className="art-spark spark-two" />
              <div className="art-caption">A world of possibilities</div>
            </div>
          </section>

          <section className="hero-search-card" aria-label="Search and explore">
            <div className="hero-search-copy">
              <div className="hero-search-icon"><Search size={19} /></div>
              <div><strong>What are you looking for?</strong><span>Start with a goal, a category, or a place.</span></div>
            </div>
            <div className="hero-search-control">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “research”, “Cebu”, or “scholarship”"
                aria-label="Search by keyword, category, or location"
              />
              {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={17} /></button>}
            </div>
            <button type="button" className="hero-search-button" onClick={() => { changePage("discover"); window.requestAnimationFrame(() => catalogueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); }}>
              Search <ArrowRight size={17} />
            </button>
          </section>

          <section className="category-section">
            <div className="section-heading compact-heading">
              <div><h2>Explore by category</h2><p>Whatever your next step looks like.</p></div>
              <button type="button" className="subtle-link" onClick={() => { setCategory("All"); changePage("discover"); }}>View all <ArrowRight size={15} /></button>
            </div>
            <div className="category-grid">
              {CATEGORIES.map((item) => {
                const Icon = CATEGORY_ICONS[item];
                const itemCount = activeOpportunities.filter((opportunity) => opportunity.category === item).length;
                return (
                  <button
                    key={item}
                    type="button"
                    className={"category-card" + (category === item && page === "discover" ? " category-card-active" : "")}
                    onClick={() => {
                      changePage("discover");
                      setCategory(item);
                      window.requestAnimationFrame(() => catalogueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
                    }}
                  >
                    <span className={"category-icon " + CATEGORY_TONES[item]}><Icon size={20} strokeWidth={1.8} /></span>
                    <span className="category-card-text"><strong>{item}</strong><small>{itemCount} {usingSamples ? "sample " : ""}{itemCount === 1 ? "listing" : "listings"}</small></span>
                    <ArrowUpRight size={16} className="category-arrow" />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="catalogue-section" ref={catalogueRef}>
            <div className="section-heading catalogue-heading">
              <div>
                <div className="section-kicker"><span className="kicker-dot" /> THE OPPORTUNITY BOARD</div>
                <h2>{pageTitle}</h2>
                <p>{page === "saved" ? "Your shortlist, all in one place." : "Explore possibilities worth your time."}</p>
              </div>
              <div className="catalogue-heading-actions">
                <span className="result-count">{filteredOpportunities.length} <span>{filteredOpportunities.length === 1 ? "result" : "results"}</span></span>
                <button type="button" className="filter-button" onClick={() => { setCategory("All"); setSortMode("featured"); setToast("Category and sort filters have been reset."); }}>
                  <SlidersHorizontal size={16} /> Reset filters
                </button>
              </div>
            </div>

            <div className="catalogue-toolbar">
              <div className="category-pills" aria-label="Filter by category">
                <button type="button" className={"category-pill" + (category === "All" ? " active" : "")} onClick={() => setCategory("All")}>All opportunities</button>
                {CATEGORIES.map((item) => (
                  <button type="button" key={item} className={"category-pill" + (category === item ? " active" : "")} onClick={() => setCategory(item)}>{item}</button>
                ))}
              </div>
              <div className="sort-control">
                <ArrowDownWideNarrow size={16} />
                <label htmlFor="sort-opportunities">Sort</label>
                <select id="sort-opportunities" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                  <option value="featured">Featured</option>
                  <option value="closing">Closing soon</option>
                  <option value="newest">Recently added</option>
                </select>
              </div>
            </div>

            {filteredOpportunities.length > 0 ? (
              <div className="opportunity-grid">
                {filteredOpportunities.map((item) => (
                  <OpportunityCard
                    key={item.id}
                    item={item}
                    isSaved={savedIds.includes(item.id)}
                    onSave={toggleSave}
                    onOpen={setSelected}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">{page === "saved" ? <Bookmark size={26} /> : <Filter size={26} />}</div>
                <h3>{page === "saved" && savedIds.length === 0 ? "Your shortlist starts here" : "No matching opportunities"}</h3>
                <p>{page === "saved" && savedIds.length === 0 ? "Save listings you like and they’ll appear here for easy access." : "Try a different keyword or clear your filters to see more."}</p>
                <button type="button" className="primary-button" onClick={() => { if (page === "saved" && savedIds.length === 0) changePage("discover"); else resetFilters(); }}>
                  {page === "saved" && savedIds.length === 0 ? "Explore opportunities" : "Clear filters"} <ArrowRight size={16} />
                </button>
              </div>
            )}

            <div className="data-note">
              <span className="data-note-icon"><Check size={15} /></span>
              <p><strong>Built for discovery, designed for trust.</strong> {usingSamples ? "These sample cards are illustrative only. Add published records to Firestore when their source and deadline have been checked." : "Listings come from Firestore. Check organizer sources, deadlines, and eligibility details before applying."}</p>
            </div>
          </section>

          <footer className="page-footer">
            <span>© 2026 Alvora</span>
            <span className="footer-message"><span className="footer-star">✦</span> Discover what's possible.</span>
            <button type="button" onClick={() => setToast("Alvora is in its early prototype phase. Feedback tools are planned for the pilot.")}>About this preview <ArrowUpRight size={14} /></button>
          </footer>
        </div>
      </main>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <div className="modal-topline">
              <span className="modal-sample-label"><span /> {selected.isSample === false ? "DATABASE LISTING" : "SAMPLE LISTING"}</span>
              <button type="button" className="icon-button" aria-label="Close details" onClick={() => setSelected(null)}><X size={19} /></button>
            </div>
            <div className={"modal-category-icon " + CATEGORY_TONES[selected.category]}>
              {(() => { const Icon = CATEGORY_ICONS[selected.category]; return <Icon size={26} />; })()}
            </div>
            <p className="modal-category-name">{selected.category}</p>
            <h2 id="detail-title">{selected.title}</h2>
            <p className="modal-organization">{selected.organization}</p>
            <p className="modal-description">{selected.description}</p>
            <div className="detail-facts">
              <div><Clock3 size={17} /><span><small>Deadline</small><strong>{selected.deadline}</strong></span></div>
              <div><MapPin size={17} /><span><small>Location</small><strong>{selected.location}</strong></span></div>
              <div><Laptop size={17} /><span><small>Format</small><strong>{selected.format}</strong></span></div>
              <div><HandCoins size={17} /><span><small>Opportunity value</small><strong>{selected.value}</strong></span></div>
            </div>
            <div className="modal-source-notice">
              <ExternalLink size={18} />
              <div>
                <strong>{selected.isSample === false ? "Opportunity source" : "Demonstration listing"}</strong>
                <p>{selected.isSample === false ? "Review the organizer's official information and confirm current eligibility and deadlines before applying." : "This is fictional demonstration content, not an active opportunity."}</p>
                {selected.isSample === false && selected.sourceUrl && (
                  <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="source-link">Open official source <ArrowUpRight size={14} /></a>
                )}
                {selected.isSample === false && selected.eligibility && selected.eligibility.length > 0 && (
                  <p><strong>Eligibility:</strong> {selected.eligibility.join(", ")}</p>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className={"secondary-button" + (savedIds.includes(selected.id) ? " saved" : "")} onClick={() => toggleSave(selected.id)}>
                {savedIds.includes(selected.id) ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                {savedIds.includes(selected.id) ? "Saved" : "Save opportunity"}
              </button>
              {selected.isSample === false && selected.applicationUrl ? (
                <a className="primary-button application-link" href={selected.applicationUrl} target="_blank" rel="noreferrer">
                  Apply at official site <ArrowUpRight size={16} />
                </a>
              ) : (
                <button type="button" className="primary-button" onClick={() => { setSelected(null); setToast("No application link is available for this listing yet."); }}>
                  Application link unavailable <ArrowUpRight size={16} />
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {authMode && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !authBusy) setAuthMode(null); }}>
          <section className="detail-modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <div className="modal-topline">
              <span className="modal-sample-label"><span /> ALVORA ACCOUNT</span>
              <button type="button" className="icon-button" aria-label="Close account dialog" onClick={() => openAuth(null)} disabled={authBusy}><X size={19} /></button>
            </div>
            <div className="auth-mark"><Sunrise size={25} /></div>
            <h2 id="auth-title">{authMode === "signup" ? "Create your account" : authMode === "reset" ? "Reset your password" : "Welcome back"}</h2>
            <p className="auth-intro">{authMode === "signup" ? "Create an account to keep your saved opportunities across devices." : authMode === "reset" ? "Enter your email and we'll send a password reset link if an account exists." : "Sign in to save opportunities and keep your shortlist in sync."}</p>
            {authError && <div className="auth-error" role="alert">{authError}</div>}
            {authMode !== "reset" && (
              <button type="button" className="google-auth-button" onClick={() => void handleGoogleSignIn()} disabled={authBusy}>
                <span className="google-letter">G</span>{authBusy ? "Please wait..." : "Continue with Google"}
              </button>
            )}
            {authMode !== "reset" && <div className="auth-divider"><span>or continue with email</span></div>}
            <form className="auth-form" onSubmit={(event) => void handleAuthSubmit(event)}>
              <label htmlFor="auth-email">Email address</label>
              <div className="auth-input-wrap"><Mail size={17} /><input id="auth-email" type="email" autoComplete="email" placeholder="you@example.com" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} required disabled={authBusy} /></div>
              {authMode !== "reset" && (
                <>
                  <label htmlFor="auth-password">Password</label>
                  <div className="auth-input-wrap"><LockKeyhole size={17} /><input id="auth-password" type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} placeholder={authMode === "signup" ? "At least 6 characters" : "Your password"} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} minLength={6} required disabled={authBusy} /></div>
                </>
              )}
              <button type="submit" className="primary-button auth-submit" disabled={authBusy}>
                {authBusy ? "Please wait..." : authMode === "signup" ? "Create account" : authMode === "reset" ? "Send reset link" : "Sign in"} <ArrowRight size={16} />
              </button>
            </form>
            <div className="auth-switch">
              {authMode === "signin" && <><button type="button" onClick={() => openAuth("reset")} disabled={authBusy}>Forgot password?</button><span>New to Alvora?</span><button type="button" onClick={() => openAuth("signup")} disabled={authBusy}>Create account</button></>}
              {authMode === "signup" && <><span>Already have an account?</span><button type="button" onClick={() => openAuth("signin")} disabled={authBusy}>Sign in</button></>}
              {authMode === "reset" && <button type="button" onClick={() => openAuth("signin")} disabled={authBusy}>Back to sign in</button>}
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast-message" role="status"><span><Check size={16} /></span>{toast}<button type="button" aria-label="Dismiss message" onClick={() => setToast("")}><X size={15} /></button></div>}
    </div>
  );
}
