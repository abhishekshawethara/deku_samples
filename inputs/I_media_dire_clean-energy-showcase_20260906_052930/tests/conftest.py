from __future__ import annotations

import os
import time

import pytest
from appclient import client, login, seeded_password
from capabilities import Backend, Inbox, make_backend, make_inbox

SETTLE_SECONDS = 2.0


def settle(seconds: float = SETTLE_SECONDS) -> None:
    time.sleep(seconds)


VISITOR_EMAIL = "visitor@example.com"
VISITOR2_EMAIL = "visitor2@example.com"
SEEDED_PASSWORD = "deku-demo-pw-2026"
VISITOR_NAME = "Ada Moreau"
VISITOR2_NAME = "Ken Adeyemi"
VISITOR_ROLE = "visitor"

SOLUTION_SLUGS = (
    "oil-and-gas", "chemicals", "transport", "steel",
    "mining", "data-centres", "communities", "desalination",
)
OUTPUT_KINDS = ("heat", "heat-and-power", "hydrogen", "electricity")
TEMPERATURE_BANDS = ("up to 250 C", "250 to 550 C", "550 to 750 C")
DEPLOYMENTS = ("single-module", "multi-module")
ENQUIRY_TOPICS = ("Technology", "Solutions", "Investor relations", "Careers", "Suppliers")
ENQUIRY_STATUSES = ("received", "answered", "closed")
REQUEST_STATUSES = ("pending", "approved", "declined")
APPLICATION_STATUSES = ("received", "reviewing", "closed")

HYDROGEN_BAND = "550 to 750 C"
HYDROGEN_SLUGS = ("transport", "steel")
SINGLE_MODULE_SLUG = "mining"
SAVED_SLUG_A = "steel"
SAVED_SLUG_B = "data-centres"
SAVED_SLUG_C = "mining"

SEEDED_SEARCH_NAME = "Hydrogen sites"
SEEDED_ENQUIRY_REF = "ENQ-7K2M9QD4"
SEEDED_ENQUIRY2_REF = "ENQ-5R8X1CJ2"
SEEDED_REQUEST_REF = "IAR-4H7N2PQ8"
SEEDED_REQUEST2_REF = "IAR-9T3V6BLM"

ENQUIRY_PREFIX = "ENQ-"
REQUEST_PREFIX = "IAR-"
ENQUIRY_SUBJECT_PREFIX = "Enquiry received:"
REQUEST_SUBJECT_PREFIX = "Investor access requested:"
APPLICATION_SUBJECT_PREFIX = "Application received:"

DOCUMENT_SLUGS = ("investor-deck-2026", "technology-dossier", "licensing-roadmap")
JOB_SLUGS = ("reactor-systems-engineer", "licensing-lead", "operations-trainer")
JOB_TITLE = "Reactor Systems Engineer"
JOB_LOCATION = "Rotterdam"
ACADEMY_TEAM = "Operations Academy"
FEATURED_STORY_SLUG = "first-module-order"
STORY_SLUGS = (
    "first-module-order", "helium-loop-milestone", "steel-partnership",
    "licensing-step-cleared", "academy-first-cohort", "desalination-study",
    "helium-supply-signed",
)
TEAM_SLUGS = ("mira-halvorsen", "tobias-ruiz", "anneke-vos", "daniel-okoye")
OFFICE_CITIES = ("Rotterdam", "Chicago", "Tokyo")

STORY_PAGE_SIZE = 3
COMPARE_LIMIT = 4
SOLUTION_COUNT = 8
DOCUMENT_COUNT = 3
JOB_COUNT = 3
STORY_COUNT = 7
TABLE_COUNT = 13

MODULE_THERMAL_MW = 250
MODULE_ELECTRICAL_MW = 100
CONVERSION_PERCENT = 40
ANNUAL_HOURS = 8000
TONNES_PER_GWH = 450
CALCULATOR_ROWS = (
    (250, "thermal", 1, 2000, 900000),
    (251, "thermal", 2, 4000, 1800000),
    (100, "electrical", 1, 800, 360000),
    (260, "electrical", 3, 2400, 1080000),
)

TOTAL_COUNT_HEADER = "X-Total-Count"

APP_ROOT = "/app"
RESERVED_DIRS = (".browser_screenshots", ".downloads")


@pytest.fixture(scope="session")
def anon_client():
    with client() as c:
        yield c


@pytest.fixture(scope="session")
def visitor_token() -> str:
    return login(VISITOR_EMAIL, seeded_password("SEED_VISITOR_PASSWORD", SEEDED_PASSWORD))


@pytest.fixture(scope="session")
def visitor_client(visitor_token: str):
    with client(visitor_token) as c:
        yield c


@pytest.fixture(scope="session")
def visitor2_token() -> str:
    return login(VISITOR2_EMAIL, seeded_password("SEED_VISITOR2_PASSWORD", SEEDED_PASSWORD))


@pytest.fixture(scope="session")
def visitor2_client(visitor2_token: str):
    with client(visitor2_token) as c:
        yield c


class ShowcaseStore:
    def __init__(self, backend: Backend) -> None:
        self._b = backend

    def account_by_email(self, email: str) -> dict | None:
        return self._b.one("accounts", email=email)

    def solution_by_slug(self, slug: str) -> dict | None:
        return self._b.one("solutions", slug=slug)

    def solutions(self) -> list[dict]:
        return self._b.rows("solutions")

    def count_solutions(self, **where) -> int:
        return self._b.count("solutions", **where)

    def saves_for(self, account_id) -> list[dict]:
        return self._b.rows("saved_solutions", account_id=account_id)

    def count_saves(self, **where) -> int:
        return self._b.count("saved_solutions", **where)

    def searches_for(self, account_id) -> list[dict]:
        return self._b.rows("saved_searches", account_id=account_id)

    def count_searches(self, **where) -> int:
        return self._b.count("saved_searches", **where)

    def enquiry_by_reference(self, reference: str) -> dict | None:
        return self._b.one("enquiries", reference=reference)

    def enquiries_for(self, account_id) -> list[dict]:
        return self._b.rows("enquiries", account_id=account_id)

    def count_enquiries(self, **where) -> int:
        return self._b.count("enquiries", **where)

    def request_for(self, account_id) -> dict | None:
        return self._b.one("access_requests", account_id=account_id)

    def count_requests(self, **where) -> int:
        return self._b.count("access_requests", **where)

    def documents(self) -> list[dict]:
        return self._b.rows("documents")

    def jobs(self) -> list[dict]:
        return self._b.rows("jobs")

    def job_by_slug(self, slug: str) -> dict | None:
        return self._b.one("jobs", slug=slug)

    def applications_for(self, account_id) -> list[dict]:
        return self._b.rows("applications", account_id=account_id)

    def count_applications(self, **where) -> int:
        return self._b.count("applications", **where)

    def stories(self) -> list[dict]:
        return self._b.rows("stories")

    def count_stories(self, **where) -> int:
        return self._b.count("stories", **where)

    def team(self) -> list[dict]:
        return self._b.rows("team_members")

    def offices(self) -> list[dict]:
        return self._b.rows("offices")

    def faqs(self) -> list[dict]:
        return self._b.rows("faqs")


@pytest.fixture(scope="session")
def db() -> ShowcaseStore:
    return ShowcaseStore(make_backend())


@pytest.fixture(scope="session")
def inbox() -> Inbox:
    return make_inbox()


def probe_email() -> str:
    return f"probe-{os.urandom(6).hex()}@example.com"


def probe_name(stem: str) -> str:
    return f"{stem}-{os.urandom(4).hex()}"


def signup(email: str, password: str = "probe-pw-1", display_name: str = "Probe Visitor",
           save_token: str | None = None) -> str:
    payload = {"email": email, "password": password, "display_name": display_name}
    if save_token is not None:
        payload["save_token"] = save_token
    with client() as c:
        response = c.post("/auth/signup", json=payload)
        assert response.status_code in (200, 201), (
            f"POST /api/auth/signup for {email} returned {response.status_code}: "
            f"{response.text[:400]}"
        )
    return login(email, password)


def anonymous_save(solution_slug: str, save_token: str | None = None):
    payload = {"solution_slug": solution_slug}
    if save_token is not None:
        payload["save_token"] = save_token
    with client() as c:
        return c.post("/saves", json=payload)


def enquiry_payload(email: str, topic: str = "Solutions",
                    message: str = "One question about a site.") -> dict:
    return {
        "name": "Probe Enquirer",
        "email": email,
        "phone_country": "+31",
        "phone": "612345678",
        "topic": topic,
        "message": message,
    }


def request_payload(organisation: str = "Probe Capital",
                    role_title: str = "Analyst") -> dict:
    return {"organisation": organisation, "role_title": role_title}


def application_payload(email: str, job_slug: str = "reactor-systems-engineer",
                        note: str = "One paragraph about the work.") -> dict:
    return {"job_slug": job_slug, "name": "Probe Applicant", "email": email, "note": note}


def search_payload(name: str, output_kind: str = "hydrogen",
                   query: str = "hydrogen") -> dict:
    return {
        "name": name,
        "query": query,
        "industry": None,
        "output_kind": output_kind,
        "temperature_band": None,
        "deployment": None,
    }


def poll_message(inbox: Inbox, to: str, subject_contains: str, tries: int = 10):
    for _ in range(tries):
        found = inbox.find(to, subject_contains)
        if found is not None:
            return found
        settle(1.0)
    return None
