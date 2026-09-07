from __future__ import annotations

import concurrent.futures
import os
import re

from appclient import client
from conftest import (
    ACADEMY_TEAM,
    APP_ROOT,
    ANNUAL_HOURS,
    APPLICATION_STATUSES,
    APPLICATION_SUBJECT_PREFIX,
    CALCULATOR_ROWS,
    COMPARE_LIMIT,
    CONVERSION_PERCENT,
    DEPLOYMENTS,
    DOCUMENT_COUNT,
    DOCUMENT_SLUGS,
    ENQUIRY_PREFIX,
    ENQUIRY_SUBJECT_PREFIX,
    FEATURED_STORY_SLUG,
    HYDROGEN_BAND,
    HYDROGEN_SLUGS,
    JOB_COUNT,
    JOB_LOCATION,
    JOB_SLUGS,
    JOB_TITLE,
    MODULE_ELECTRICAL_MW,
    MODULE_THERMAL_MW,
    OFFICE_CITIES,
    OUTPUT_KINDS,
    REQUEST_PREFIX,
    REQUEST_STATUSES,
    REQUEST_SUBJECT_PREFIX,
    RESERVED_DIRS,
    SAVED_SLUG_A,
    SAVED_SLUG_B,
    SAVED_SLUG_C,
    SEEDED_ENQUIRY2_REF,
    SEEDED_ENQUIRY_REF,
    SEEDED_PASSWORD,
    SEEDED_REQUEST2_REF,
    SEEDED_REQUEST_REF,
    SEEDED_SEARCH_NAME,
    SINGLE_MODULE_SLUG,
    SOLUTION_COUNT,
    SOLUTION_SLUGS,
    STORY_COUNT,
    STORY_PAGE_SIZE,
    STORY_SLUGS,
    TEAM_SLUGS,
    TEMPERATURE_BANDS,
    TONNES_PER_GWH,
    TOTAL_COUNT_HEADER,
    VISITOR2_EMAIL,
    VISITOR2_NAME,
    VISITOR_EMAIL,
    VISITOR_NAME,
    VISITOR_ROLE,
    anonymous_save,
    application_payload,
    enquiry_payload,
    poll_message,
    probe_email,
    probe_name,
    request_payload,
    search_payload,
    settle,
    signup,
)
from _shapes import items

ENQUIRY_RE = re.compile(r"^ENQ-[A-Z0-9]{8}$")
REQUEST_RE = re.compile(r"^IAR-[A-Z0-9]{8}$")


def _ok(response, what):
    assert response.status_code in (200, 201), (
        f"{what} returned {response.status_code}: {response.text[:400]}"
    )
    return response


def _refused(response, what):
    assert 400 <= response.status_code < 500, (
        f"{what} returned {response.status_code}, expected a client refusal: "
        f"{response.text[:400]}"
    )


def test_health_endpoint_answers_on_the_app_origin(anon_client):
    """The deployed app answers its readiness route on its own origin."""
    response = anon_client.get("/health")
    assert response.status_code == 200, (
        f"GET /health returned {response.status_code}: {response.text[:200]}"
    )


def test_seeded_password_signs_every_account_in(visitor_client, visitor2_client):
    """Both documented accounts sign in with the one seeded password."""
    for expected, caller in ((VISITOR_EMAIL, visitor_client),
                             (VISITOR2_EMAIL, visitor2_client)):
        body = _ok(caller.get("/accounts/me"), f"GET /accounts/me as {expected}").json()
        assert body.get("email") == expected, (
            f"the session for {expected} answered GET /accounts/me as "
            f"{body.get('email')!r}"
        )


def test_the_app_root_carries_its_contract_deliverables():
    """The credentials file lists each account as three plain lines, and both
    reserved directories exist and are empty."""
    readme = os.path.join(APP_ROOT, "USER_README.md")
    assert os.path.isfile(readme), f"the App Contract requires {readme}"
    text = open(readme, encoding="utf-8").read()
    lines = [ln.strip() for ln in text.splitlines()]
    for email in (VISITOR_EMAIL, VISITOR2_EMAIL):
        assert f"Email: {email}" in lines, (
            f"{readme} carries no plain line reading 'Email: {email}' outside a table"
        )
    assert f"Role: {VISITOR_ROLE}" in lines, (
        f"{readme} carries no plain line reading 'Role: {VISITOR_ROLE}'"
    )
    assert f"Password: {SEEDED_PASSWORD}" in lines, (
        f"{readme} carries no plain line reading 'Password: {SEEDED_PASSWORD}'"
    )
    for reserved in RESERVED_DIRS:
        path = os.path.join(APP_ROOT, reserved)
        assert os.path.isdir(path), f"the App Contract requires the directory {path}"
        assert os.listdir(path) == [], (
            f"{path} must exist empty; it holds {sorted(os.listdir(path))[:5]}"
        )


def test_seeded_accounts_carry_their_display_names(db):
    """Each seeded account is stored under the display name the brief pins."""
    first = db.account_by_email(VISITOR_EMAIL)
    second = db.account_by_email(VISITOR2_EMAIL)
    assert first is not None, f"no account row for {VISITOR_EMAIL}"
    assert second is not None, f"no account row for {VISITOR2_EMAIL}"
    assert str(first.get("display_name")) == VISITOR_NAME, (
        f"{VISITOR_EMAIL} stored display_name {first.get('display_name')!r}"
    )
    assert str(second.get("display_name")) == VISITOR2_NAME, (
        f"{VISITOR2_EMAIL} stored display_name {second.get('display_name')!r}"
    )


def test_signup_creates_a_visitor_and_returns_a_token(db):
    """Signup is open, mints an account row, and stores the password hashed."""
    email = probe_email()
    password = "probe-pw-1"
    token = signup(email, password)
    with client(token) as caller:
        body = _ok(caller.get("/accounts/me"), "GET /accounts/me as a new account").json()
    assert body.get("email") == email, (
        f"GET /accounts/me for a fresh signup returned {body.get('email')!r}"
    )
    row = db.account_by_email(email)
    assert row is not None, f"signup for {email} stored no account row"
    stored = str(row.get("password_hash", ""))
    assert stored, f"the account row for {email} stored an empty password_hash"
    assert stored != password, (
        f"the stored password_hash for {email} is the plaintext password that was sent"
    )


def test_password_is_never_returned_by_the_account_route(visitor_client):
    """No account response carries a password or a hash of one."""
    body = _ok(visitor_client.get("/accounts/me"), "GET /accounts/me").json()
    for banned in ("password", "password_hash"):
        assert banned not in body, (
            f"GET /accounts/me returned the field {banned!r}: {sorted(body)}"
        )


def test_account_email_cannot_be_taken_twice(db):
    """One email address holds at most one account."""
    email = probe_email()
    signup(email)
    with client() as caller:
        response = caller.post(
            "/auth/signup",
            json={"email": email, "password": "probe-pw-2", "display_name": "Probe Twice"},
        )
    _refused(response, f"a second POST /auth/signup for {email}")
    assert db.account_by_email(email) is not None, (
        f"the first account for {email} disappeared after the refused second signup"
    )


def test_eight_solutions_are_seeded_with_their_pinned_slugs(db):
    """The eight industry solutions are stored under the slugs the brief pins."""
    stored = {str(row.get("slug")) for row in db.solutions()}
    assert stored == set(SOLUTION_SLUGS), (
        f"solutions stores slugs {sorted(stored)}, expected {sorted(SOLUTION_SLUGS)}"
    )
    assert db.count_solutions() == SOLUTION_COUNT, (
        f"solutions holds {db.count_solutions()} rows, expected {SOLUTION_COUNT}"
    )


def test_every_solution_carries_a_legal_enum_triple(db):
    """Every stored solution uses only the pinned output, band and deployment values."""
    for row in db.solutions():
        assert str(row.get("output_kind")) in OUTPUT_KINDS, (
            f"solution {row.get('slug')!r} has output_kind {row.get('output_kind')!r}"
        )
        assert str(row.get("temperature_band")) in TEMPERATURE_BANDS, (
            f"solution {row.get('slug')!r} has temperature_band "
            f"{row.get('temperature_band')!r}"
        )
        assert str(row.get("deployment")) in DEPLOYMENTS, (
            f"solution {row.get('slug')!r} has deployment {row.get('deployment')!r}"
        )


def test_seeded_solution_attributes_match_the_pinned_table(db):
    """The two solutions the filter example names carry the pinned attributes."""
    steel = db.solution_by_slug(SAVED_SLUG_A)
    mining = db.solution_by_slug(SINGLE_MODULE_SLUG)
    assert steel is not None, f"no solution row for {SAVED_SLUG_A}"
    assert mining is not None, f"no solution row for {SINGLE_MODULE_SLUG}"
    assert str(steel.get("output_kind")) == "hydrogen", (
        f"{SAVED_SLUG_A} stored output_kind {steel.get('output_kind')!r}"
    )
    assert str(mining.get("deployment")) == "single-module", (
        f"{SINGLE_MODULE_SLUG} stored deployment {mining.get('deployment')!r}"
    )


def test_solution_list_returns_every_solution_with_its_fields(anon_client):
    """The unfiltered list answers a stranger with all eight solutions and their fields."""
    response = _ok(anon_client.get("/solutions"), "GET /solutions")
    rows = items(response.json())
    assert len(rows) == SOLUTION_COUNT, (
        f"GET /solutions returned {len(rows)} rows, expected {SOLUTION_COUNT}"
    )
    for row in rows:
        for field in ("slug", "industry", "title", "summary", "output_kind",
                      "temperature_band", "deployment", "module_count"):
            assert field in row, (
                f"a GET /solutions row is missing {field!r}: {sorted(row)}"
            )


def test_solution_list_carries_the_match_count_header(anon_client):
    """The list route reports how many solutions matched, in the pinned header."""
    response = _ok(anon_client.get("/solutions"), "GET /solutions")
    assert TOTAL_COUNT_HEADER in response.headers, (
        f"GET /solutions carried no {TOTAL_COUNT_HEADER} header: "
        f"{sorted(response.headers)}"
    )
    assert int(response.headers[TOTAL_COUNT_HEADER]) == SOLUTION_COUNT, (
        f"GET /solutions reported {response.headers[TOTAL_COUNT_HEADER]} matches, "
        f"expected {SOLUTION_COUNT}"
    )


def test_two_filters_narrow_the_set_to_the_worked_pair(anon_client):
    """The pinned filter pair leaves exactly the two solutions the brief names."""
    response = _ok(
        anon_client.get("/solutions",
                        params={"output_kind": "hydrogen",
                                "temperature_band": HYDROGEN_BAND}),
        "GET /solutions filtered to hydrogen at the top band")
    rows = items(response.json())
    slugs = sorted(str(row.get("slug")) for row in rows)
    assert slugs == sorted(HYDROGEN_SLUGS), (
        f"the filtered list returned {slugs}, expected {sorted(HYDROGEN_SLUGS)}"
    )
    assert int(response.headers[TOTAL_COUNT_HEADER]) == len(HYDROGEN_SLUGS), (
        f"the filtered list reported {response.headers[TOTAL_COUNT_HEADER]} matches, "
        f"expected {len(HYDROGEN_SLUGS)}"
    )


def test_each_filter_narrows_the_set_left_by_the_last(anon_client, db):
    """Adding a filter can only shrink the result, and each result matches the store."""
    wide = items(_ok(anon_client.get("/solutions", params={"output_kind": "hydrogen"}),
                     "GET /solutions filtered by output").json())
    narrow = items(_ok(
        anon_client.get("/solutions", params={"output_kind": "hydrogen",
                                              "deployment": "multi-module"}),
        "GET /solutions filtered by output and deployment").json())
    assert len(narrow) <= len(wide), (
        f"adding a deployment filter widened the set from {len(wide)} to {len(narrow)}"
    )
    assert len(wide) == db.count_solutions(output_kind="hydrogen"), (
        f"the output filter returned {len(wide)} rows but the store holds "
        f"{db.count_solutions(output_kind='hydrogen')}"
    )


def test_filter_by_industry_reconciles_with_the_store(anon_client, db):
    """An industry filter returns exactly the rows the store holds for that industry."""
    industry = str(db.solution_by_slug(SAVED_SLUG_A).get("industry"))
    rows = items(_ok(anon_client.get("/solutions", params={"industry": industry}),
                     f"GET /solutions filtered to {industry}").json())
    assert len(rows) == db.count_solutions(industry=industry), (
        f"the {industry} filter returned {len(rows)} rows but the store holds "
        f"{db.count_solutions(industry=industry)}"
    )
    for row in rows:
        assert str(row.get("industry")) == industry, (
            f"the {industry} filter returned a row in industry {row.get('industry')!r}"
        )


def test_filter_by_deployment_reconciles_with_the_store(anon_client, db):
    """A deployment filter returns exactly the rows the store holds in that deployment."""
    for deployment in DEPLOYMENTS:
        rows = items(_ok(anon_client.get("/solutions",
                                         params={"deployment": deployment}),
                         f"GET /solutions filtered to {deployment}").json())
        assert len(rows) == db.count_solutions(deployment=deployment), (
            f"the {deployment} filter returned {len(rows)} rows but the store holds "
            f"{db.count_solutions(deployment=deployment)}"
        )


def test_plain_language_search_matches_stored_solutions(anon_client, db):
    """A plain-language query returns only solutions the store agrees match."""
    rows = items(_ok(anon_client.get("/solutions", params={"q": "hydrogen"}),
                     "GET /solutions searched for hydrogen").json())
    assert rows, "the plain-language search for hydrogen returned nothing"
    stored = {str(row.get("slug")) for row in db.solutions()}
    for row in rows:
        assert str(row.get("slug")) in stored, (
            f"the search returned slug {row.get('slug')!r}, which the store does not hold"
        )


def test_one_solution_answers_with_its_long_copy(anon_client):
    """Opening one solution adds the long copy the list does not carry."""
    body = _ok(anon_client.get(f"/solutions/{SAVED_SLUG_A}"),
               f"GET /solutions/{SAVED_SLUG_A}").json()
    assert body.get("slug") == SAVED_SLUG_A, (
        f"GET /solutions/{SAVED_SLUG_A} returned slug {body.get('slug')!r}"
    )
    assert str(body.get("detail", "")).strip(), (
        f"GET /solutions/{SAVED_SLUG_A} returned an empty detail field"
    )


def test_unknown_solution_slug_is_refused(anon_client):
    """A slug that never existed is refused rather than served."""
    response = anon_client.get("/solutions/no-such-industry")
    _refused(response, "GET /solutions for a slug that never existed")


def test_anonymous_save_returns_a_token_and_survives_signup(db):
    """A save made with no account is held against a token and claimed at signup."""
    response = _ok(anonymous_save(SAVED_SLUG_C), "POST /saves with no session")
    token = response.json().get("save_token")
    assert token, f"POST /saves with no session returned no save_token: {response.text[:200]}"
    email = probe_email()
    account_token = signup(email, save_token=token)
    with client(account_token) as caller:
        rows = items(_ok(caller.get("/saves"), "GET /saves after claiming").json())
    slugs = {str(row.get("slug")) for row in rows}
    assert SAVED_SLUG_C in slugs, (
        f"the claimed account holds {sorted(slugs)}, expected {SAVED_SLUG_C} among them"
    )
    account = db.account_by_email(email)
    assert db.count_saves(account_id=account.get("id")) == 1, (
        f"the claimed account holds {db.count_saves(account_id=account.get('id'))} "
        f"saved rows, expected 1"
    )


def test_claiming_a_save_token_empties_it(db):
    """Once claimed, the token holds nothing a later caller could read."""
    token = _ok(anonymous_save(SAVED_SLUG_B), "POST /saves with no session").json()["save_token"]
    signup(probe_email(), save_token=token)
    with client() as caller:
        rows = items(_ok(caller.get("/saves", params={"save_token": token}),
                         "GET /saves for a claimed token").json())
    assert rows == [], f"the claimed token still holds {len(rows)} saved rows"
    assert db.count_saves(save_token=token) == 0, (
        f"the store still holds {db.count_saves(save_token=token)} rows against the "
        f"claimed token"
    )


def test_saving_one_solution_twice_adds_no_second_row(db):
    """A repeat save leaves the stored state unchanged."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    with client(token) as caller:
        _ok(caller.post("/saves", json={"solution_slug": SAVED_SLUG_A}), "the first save")
        caller.post("/saves", json={"solution_slug": SAVED_SLUG_A})
        rows = items(_ok(caller.get("/saves"), "GET /saves after a repeat save").json())
    assert len(rows) == 1, f"a repeated save produced {len(rows)} rows in the list"
    assert db.count_saves(account_id=account.get("id"),
                          solution_id=db.solution_by_slug(SAVED_SLUG_A).get("id")) == 1, (
        "a repeated save produced a second row in the store"
    )


def test_concurrent_saves_of_one_solution_leave_one_row(db):
    """Two simultaneous saves of one solution leave exactly one stored row."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    solution = db.solution_by_slug(SAVED_SLUG_B)

    def attempt():
        with client(token) as caller:
            return caller.post("/saves", json={"solution_slug": SAVED_SLUG_B}).status_code

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        codes = [f.result() for f in [pool.submit(attempt), pool.submit(attempt)]]
    settle()
    stored = db.count_saves(account_id=account.get("id"), solution_id=solution.get("id"))
    assert stored == 1, (
        f"two simultaneous saves left {stored} rows, expected 1; the responses were {codes}"
    )


def test_a_save_is_removed_by_its_owner(db):
    """The owner removes a save and the row leaves the store."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    with client(token) as caller:
        created = _ok(caller.post("/saves", json={"solution_slug": SAVED_SLUG_C}),
                      "POST /saves").json()
        _ok(caller.delete(f"/saves/{created['id']}"), "DELETE /saves for an own row")
        rows = items(_ok(caller.get("/saves"), "GET /saves after removal").json())
    assert rows == [], f"the owner still holds {len(rows)} saved rows after removal"
    assert db.count_saves(account_id=account.get("id")) == 0, (
        "the removed save is still stored"
    )


def test_seeded_accounts_hold_their_pinned_saves(db):
    """Each seeded account holds exactly the saves the brief pins."""
    first = db.account_by_email(VISITOR_EMAIL)
    second = db.account_by_email(VISITOR2_EMAIL)
    first_ids = {row.get("solution_id") for row in db.saves_for(first.get("id"))}
    second_ids = {row.get("solution_id") for row in db.saves_for(second.get("id"))}
    expected_first = {db.solution_by_slug(SAVED_SLUG_A).get("id"),
                      db.solution_by_slug(SAVED_SLUG_B).get("id")}
    expected_second = {db.solution_by_slug(SAVED_SLUG_C).get("id")}
    assert first_ids == expected_first, (
        f"{VISITOR_EMAIL} holds {len(first_ids)} saves, expected the two pinned ones"
    )
    assert second_ids == expected_second, (
        f"{VISITOR2_EMAIL} holds {len(second_ids)} saves, expected the one pinned one"
    )


def test_comparison_returns_at_most_four_solutions(anon_client):
    """The comparison answers four slugs with four solutions."""
    rows = items(_ok(anon_client.get("/compare",
                                     params={"slugs": ",".join(SOLUTION_SLUGS[:COMPARE_LIMIT])}),
                     "GET /compare with four slugs").json())
    assert len(rows) == COMPARE_LIMIT, (
        f"GET /compare with four slugs returned {len(rows)} solutions"
    )


def test_a_fifth_comparison_slug_is_refused(anon_client):
    """A fifth slug is refused and the four-way comparison still answers."""
    response = anon_client.get(
        "/compare", params={"slugs": ",".join(SOLUTION_SLUGS[:COMPARE_LIMIT + 1])})
    _refused(response, "GET /compare with five slugs")
    rows = items(_ok(anon_client.get("/compare",
                                     params={"slugs": ",".join(SOLUTION_SLUGS[:COMPARE_LIMIT])}),
                     "GET /compare with four slugs after the refusal").json())
    assert len(rows) == COMPARE_LIMIT, (
        f"after the refusal GET /compare returned {len(rows)} solutions"
    )


def test_a_saved_search_is_stored_under_its_name(db):
    """A saved search is stored against its owner under the name given."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    name = probe_name("Probe Search")
    with client(token) as caller:
        body = _ok(caller.post("/searches", json=search_payload(name)),
                   "POST /searches").json()
        rows = items(_ok(caller.get("/searches"), "GET /searches").json())
    assert body.get("name") == name, f"POST /searches returned name {body.get('name')!r}"
    assert len(rows) == 1, f"the owner sees {len(rows)} saved searches, expected 1"
    assert db.count_searches(account_id=account.get("id")) == 1, (
        "the saved search was not stored against its owner"
    )


def test_resaving_a_search_name_replaces_its_filters(db):
    """The same name saved again updates the row rather than adding one."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    name = probe_name("Probe Repeat")
    with client(token) as caller:
        _ok(caller.post("/searches", json=search_payload(name, output_kind="hydrogen")),
            "the first POST /searches")
        _ok(caller.post("/searches", json=search_payload(name, output_kind="electricity")),
            "the second POST /searches under one name")
        rows = items(_ok(caller.get("/searches"), "GET /searches after the replacement").json())
    assert len(rows) == 1, f"one name produced {len(rows)} saved searches"
    assert db.count_searches(account_id=account.get("id"), name=name) == 1, (
        "one name produced a second stored search row"
    )
    assert str(rows[0].get("output_kind")) == "electricity", (
        f"the saved search kept output_kind {rows[0].get('output_kind')!r} after replacement"
    )


def test_a_saved_search_is_removed_by_its_owner(db):
    """The owner removes a saved search and the row leaves the store."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    with client(token) as caller:
        created = _ok(caller.post("/searches", json=search_payload(probe_name("Probe Drop"))),
                      "POST /searches").json()
        _ok(caller.delete(f"/searches/{created['id']}"), "DELETE /searches for an own row")
    assert db.count_searches(account_id=account.get("id")) == 0, (
        "the removed saved search is still stored"
    )


def test_the_seeded_saved_search_is_stored_for_its_owner(db):
    """The pinned saved search belongs to the first seeded account."""
    account = db.account_by_email(VISITOR_EMAIL)
    names = {str(row.get("name")) for row in db.searches_for(account.get("id"))}
    assert SEEDED_SEARCH_NAME in names, (
        f"{VISITOR_EMAIL} holds saved searches {sorted(names)}, expected "
        f"{SEEDED_SEARCH_NAME!r} among them"
    )


def test_an_enquiry_mints_a_reference_and_is_stored_received(db):
    """Sending an enquiry mints a reference in the pinned shape and stores it received."""
    email = probe_email()
    with client() as caller:
        body = _ok(caller.post("/enquiries", json=enquiry_payload(email)),
                   "POST /enquiries").json()
    reference = str(body.get("reference"))
    assert ENQUIRY_RE.match(reference), (
        f"POST /enquiries returned reference {reference!r}, expected {ENQUIRY_PREFIX} "
        f"plus eight uppercase letters or digits"
    )
    row = db.enquiry_by_reference(reference)
    assert row is not None, f"the enquiry {reference} was not stored"
    assert str(row.get("status")) == "received", (
        f"the new enquiry stored status {row.get('status')!r}, expected 'received'"
    )


def test_enquiry_references_are_unique_across_the_application(db):
    """Two enquiries never share a reference."""
    references = []
    for _ in range(2):
        with client() as caller:
            references.append(str(_ok(caller.post("/enquiries",
                                                  json=enquiry_payload(probe_email())),
                                      "POST /enquiries").json().get("reference")))
    assert references[0] != references[1], (
        f"two enquiries were both minted as {references[0]}"
    )
    for reference in references:
        assert db.count_enquiries(reference=reference) == 1, (
            f"the reference {reference} is stored on more than one enquiry"
        )


def test_an_enquiry_sent_signed_out_carries_no_account(db):
    """An enquiry sent with no session is stored without an owning account."""
    with client() as caller:
        reference = str(_ok(caller.post("/enquiries", json=enquiry_payload(probe_email())),
                            "POST /enquiries with no session").json().get("reference"))
    row = db.enquiry_by_reference(reference)
    assert row.get("account_id") in (None, "", 0), (
        f"an enquiry sent signed out stored account_id {row.get('account_id')!r}"
    )


def test_an_enquiry_stores_the_contact_fields_it_was_given(db):
    """Every contact field the form takes survives into the store."""
    email = probe_email()
    payload = enquiry_payload(email, topic="Technology", message="A distinctive question.")
    with client() as caller:
        reference = str(_ok(caller.post("/enquiries", json=payload),
                            "POST /enquiries").json().get("reference"))
    row = db.enquiry_by_reference(reference)
    assert str(row.get("email")) == email, f"the enquiry stored email {row.get('email')!r}"
    assert str(row.get("topic")) == "Technology", (
        f"the enquiry stored topic {row.get('topic')!r}"
    )
    assert str(row.get("message")) == payload["message"], (
        f"the enquiry stored message {row.get('message')!r}"
    )
    assert str(row.get("phone_country")) == payload["phone_country"], (
        f"the enquiry stored phone_country {row.get('phone_country')!r}"
    )


def test_an_enquiry_topic_outside_the_pinned_set_is_refused(db):
    """A topic the brief does not pin is refused and nothing is stored."""
    before = db.count_enquiries()
    with client() as caller:
        response = caller.post("/enquiries",
                               json=enquiry_payload(probe_email(), topic="Weather"))
    _refused(response, "POST /enquiries with a topic outside the pinned set")
    settle()
    assert db.count_enquiries() == before, (
        "a refused enquiry still added a row to the store"
    )


def test_the_owner_closes_their_own_enquiry(db):
    """An enquiry the caller owns moves to closed and the store agrees."""
    email = probe_email()
    token = signup(email)
    with client(token) as caller:
        created = _ok(caller.post("/enquiries", json=enquiry_payload(email)),
                      "POST /enquiries signed in").json()
        _ok(caller.post(f"/enquiries/{created['id']}/close"), "closing an own enquiry")
    row = db.enquiry_by_reference(str(created["reference"]))
    assert str(row.get("status")) == "closed", (
        f"the closed enquiry stored status {row.get('status')!r}"
    )


def test_closing_a_closed_enquiry_records_one_close(db):
    """A second close leaves one closed enquiry, never two rows."""
    email = probe_email()
    token = signup(email)
    with client(token) as caller:
        created = _ok(caller.post("/enquiries", json=enquiry_payload(email)),
                      "POST /enquiries signed in").json()
        _ok(caller.post(f"/enquiries/{created['id']}/close"), "the first close")
        caller.post(f"/enquiries/{created['id']}/close")
        rows = items(_ok(caller.get("/enquiries"), "GET /enquiries after two closes").json())
    assert len(rows) == 1, f"two closes left {len(rows)} enquiries on the account"
    assert str(rows[0].get("status")) == "closed", (
        f"the twice-closed enquiry reads {rows[0].get('status')!r}"
    )


def test_seeded_enquiries_are_stored_in_their_pinned_states(db):
    """The two seeded enquiries carry the references and statuses the brief pins."""
    first = db.enquiry_by_reference(SEEDED_ENQUIRY_REF)
    second = db.enquiry_by_reference(SEEDED_ENQUIRY2_REF)
    assert first is not None, f"no enquiry stored for {SEEDED_ENQUIRY_REF}"
    assert second is not None, f"no enquiry stored for {SEEDED_ENQUIRY2_REF}"
    assert str(first.get("status")) == "answered", (
        f"{SEEDED_ENQUIRY_REF} stored status {first.get('status')!r}, expected 'answered'"
    )
    assert str(second.get("status")) == "received", (
        f"{SEEDED_ENQUIRY2_REF} stored status {second.get('status')!r}, expected 'received'"
    )


def test_an_access_request_starts_pending_with_a_reference(db):
    """A new request is stored pending under a reference in the pinned shape."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    with client(token) as caller:
        body = _ok(caller.post("/access-request", json=request_payload()),
                   "POST /access-request").json()
    assert REQUEST_RE.match(str(body.get("reference"))), (
        f"POST /access-request returned reference {body.get('reference')!r}, expected "
        f"{REQUEST_PREFIX} plus eight uppercase letters or digits"
    )
    row = db.request_for(account.get("id"))
    assert row is not None, "the new access request was not stored"
    assert str(row.get("status")) == "pending", (
        f"the new access request stored status {row.get('status')!r}"
    )


def test_a_second_access_request_updates_the_first(db):
    """Requesting again updates the one row rather than adding a second."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    with client(token) as caller:
        _ok(caller.post("/access-request", json=request_payload("Probe One", "Partner")),
            "the first POST /access-request")
        _ok(caller.post("/access-request", json=request_payload("Probe Two", "Director")),
            "the second POST /access-request")
    assert db.count_requests(account_id=account.get("id")) == 1, (
        f"one account holds {db.count_requests(account_id=account.get('id'))} access "
        f"requests, expected 1"
    )
    row = db.request_for(account.get("id"))
    assert str(row.get("organisation")) == "Probe Two", (
        f"the updated request kept organisation {row.get('organisation')!r}"
    )
    assert str(row.get("role_title")) == "Director", (
        f"the updated request kept role_title {row.get('role_title')!r}"
    )


def test_concurrent_access_requests_leave_one_row(db):
    """Two simultaneous requests from one account leave exactly one stored row."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)

    def attempt():
        with client(token) as caller:
            return caller.post("/access-request", json=request_payload()).status_code

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        codes = [f.result() for f in [pool.submit(attempt), pool.submit(attempt)]]
    settle()
    stored = db.count_requests(account_id=account.get("id"))
    assert stored == 1, (
        f"two simultaneous access requests left {stored} rows, expected 1; the "
        f"responses were {codes}"
    )


def test_access_request_references_are_unique(db):
    """Two accounts never share an access request reference."""
    references = []
    for _ in range(2):
        token = signup(probe_email())
        with client(token) as caller:
            references.append(str(_ok(caller.post("/access-request", json=request_payload()),
                                      "POST /access-request").json().get("reference")))
    assert references[0] != references[1], (
        f"two access requests were both minted as {references[0]}"
    )
    for reference in references:
        assert db.count_requests(reference=reference) == 1, (
            f"the reference {reference} is stored on more than one access request"
        )


def test_seeded_access_requests_hold_their_pinned_states(db):
    """One seeded account is approved and the other is pending."""
    first = db.request_for(db.account_by_email(VISITOR_EMAIL).get("id"))
    second = db.request_for(db.account_by_email(VISITOR2_EMAIL).get("id"))
    assert str(first.get("reference")) == SEEDED_REQUEST_REF, (
        f"{VISITOR_EMAIL} holds reference {first.get('reference')!r}"
    )
    assert str(first.get("status")) == "approved", (
        f"{VISITOR_EMAIL} holds an access request in {first.get('status')!r}"
    )
    assert str(second.get("reference")) == SEEDED_REQUEST2_REF, (
        f"{VISITOR2_EMAIL} holds reference {second.get('reference')!r}"
    )
    assert str(second.get("status")) == "pending", (
        f"{VISITOR2_EMAIL} holds an access request in {second.get('status')!r}"
    )
    for row in (first, second):
        assert str(row.get("status")) in REQUEST_STATUSES, (
            f"a seeded access request stored status {row.get('status')!r}"
        )


def test_the_document_room_answers_the_approved_account(visitor_client, db):
    """The approved account reads every seeded document."""
    rows = items(_ok(visitor_client.get("/documents"),
                     "GET /documents as the approved account").json())
    slugs = sorted(str(row.get("slug")) for row in rows)
    assert slugs == sorted(DOCUMENT_SLUGS), (
        f"the approved account reads documents {slugs}, expected {sorted(DOCUMENT_SLUGS)}"
    )
    assert len(db.documents()) == DOCUMENT_COUNT, (
        f"the store holds {len(db.documents())} documents, expected {DOCUMENT_COUNT}"
    )


def test_the_document_room_is_denied_to_a_pending_account(visitor2_client):
    """A pending account is refused the room and reads no document."""
    response = visitor2_client.get("/documents")
    _refused(response, "GET /documents as the pending account")
    for slug in DOCUMENT_SLUGS:
        assert slug not in response.text, (
            f"the refused document-room response carried the slug {slug!r}"
        )


def test_the_document_room_is_denied_with_no_session(anon_client):
    """A caller with no session is refused the room."""
    _refused(anon_client.get("/documents"), "GET /documents with no session")


def test_one_account_never_reads_another_saved_list(visitor_client, visitor2_client):
    """Each account reads only its own saves, and the two lists differ."""
    first = items(_ok(visitor_client.get("/saves"), "GET /saves as the first account").json())
    second = items(_ok(visitor2_client.get("/saves"),
                       "GET /saves as the second account").json())
    first_slugs = {str(row.get("slug")) for row in first}
    second_slugs = {str(row.get("slug")) for row in second}
    assert SAVED_SLUG_A in first_slugs, (
        f"the first account reads {sorted(first_slugs)}, expected {SAVED_SLUG_A} in it"
    )
    assert SAVED_SLUG_A not in second_slugs, (
        f"the second account reads the first account save {SAVED_SLUG_A}"
    )
    assert SAVED_SLUG_C not in first_slugs, (
        f"the first account reads the second account save {SAVED_SLUG_C}"
    )


def test_one_account_never_reads_another_enquiry_list(visitor_client, visitor2_client):
    """Each account reads only its own enquiries."""
    first = items(_ok(visitor_client.get("/enquiries"),
                      "GET /enquiries as the first account").json())
    second = items(_ok(visitor2_client.get("/enquiries"),
                       "GET /enquiries as the second account").json())
    first_refs = {str(row.get("reference")) for row in first}
    second_refs = {str(row.get("reference")) for row in second}
    assert SEEDED_ENQUIRY_REF in first_refs, (
        f"the first account reads {sorted(first_refs)}, expected {SEEDED_ENQUIRY_REF}"
    )
    assert SEEDED_ENQUIRY_REF not in second_refs, (
        f"the second account reads the first account enquiry {SEEDED_ENQUIRY_REF}"
    )
    assert SEEDED_ENQUIRY2_REF not in first_refs, (
        f"the first account reads the second account enquiry {SEEDED_ENQUIRY2_REF}"
    )


def test_one_account_never_reads_another_access_request(visitor_client, visitor2_client):
    """Each account reads only its own access request."""
    first = _ok(visitor_client.get("/access-request"),
                "GET /access-request as the first account").json()
    second = _ok(visitor2_client.get("/access-request"),
                 "GET /access-request as the second account").json()
    assert str(first.get("reference")) == SEEDED_REQUEST_REF, (
        f"the first account reads reference {first.get('reference')!r}"
    )
    assert str(second.get("reference")) == SEEDED_REQUEST2_REF, (
        f"the second account reads reference {second.get('reference')!r}"
    )


def test_a_save_belonging_to_another_account_cannot_be_deleted(visitor_client,
                                                               visitor2_client, db):
    """A delete naming another account save row is denied and the row survives."""
    first = items(_ok(visitor_client.get("/saves"), "GET /saves as the owner").json())
    target = first[0]
    before = db.count_saves(account_id=db.account_by_email(VISITOR_EMAIL).get("id"))
    response = visitor2_client.delete(f"/saves/{target['id']}")
    _refused(response, "DELETE /saves naming another account row")
    settle()
    after = db.count_saves(account_id=db.account_by_email(VISITOR_EMAIL).get("id"))
    assert after == before, (
        f"the owner held {before} saves before the refused delete and {after} after"
    )


def test_an_enquiry_belonging_to_another_account_cannot_be_closed(visitor_client,
                                                                  visitor2_client, db):
    """A close naming another account enquiry is denied and the row is unchanged."""
    rows = items(_ok(visitor_client.get("/enquiries"), "GET /enquiries as the owner").json())
    target = next(row for row in rows if str(row.get("reference")) == SEEDED_ENQUIRY_REF)
    before = str(db.enquiry_by_reference(SEEDED_ENQUIRY_REF).get("status"))
    response = visitor2_client.post(f"/enquiries/{target['id']}/close")
    _refused(response, "closing another account enquiry")
    settle()
    after = str(db.enquiry_by_reference(SEEDED_ENQUIRY_REF).get("status"))
    assert after == before, (
        f"the refused close moved the enquiry from {before!r} to {after!r}"
    )


def test_a_save_row_that_never_existed_is_refused(visitor_client):
    """An identifier that never existed meets a refusal, like a foreign one."""
    _refused(visitor_client.delete("/saves/99999999"),
             "DELETE /saves for an identifier that never existed")


def test_private_lists_ignore_an_account_identifier_in_the_query(visitor2_client):
    """Naming another account in the query changes nothing about what is returned."""
    plain = items(_ok(visitor2_client.get("/saves"), "GET /saves").json())
    steered = items(_ok(visitor2_client.get("/saves", params={"account_id": 1, "email": VISITOR_EMAIL}),
                        "GET /saves with another account named").json())
    assert {str(r.get("slug")) for r in plain} == {str(r.get("slug")) for r in steered}, (
        "naming another account in the query changed the private list"
    )


def test_every_private_list_is_denied_with_no_session(anon_client):
    """Each private list refuses a caller with no bearer token."""
    for route in ("/saves", "/searches", "/enquiries", "/access-request", "/applications"):
        _refused(anon_client.get(route), f"GET {route} with no session")


def test_an_expired_token_is_refused(db):
    """A token that is not a real session is refused rather than served."""
    with client("not-a-real-token") as caller:
        _refused(caller.get("/accounts/me"), "GET /accounts/me with a made-up token")


def test_the_calculator_returns_the_worked_rows(anon_client):
    """Every worked row in the brief is reproduced exactly."""
    for need, kind, modules, energy, tonnes in CALCULATOR_ROWS:
        body = _ok(anon_client.post("/calculator", json={"need_mw": need, "kind": kind}),
                   f"POST /calculator for {need} MW {kind}").json()
        assert body.get("modules_required") == modules, (
            f"{need} MW {kind} returned modules_required "
            f"{body.get('modules_required')!r}, expected {modules}"
        )
        assert body.get("annual_clean_energy_gwh") == energy, (
            f"{need} MW {kind} returned annual_clean_energy_gwh "
            f"{body.get('annual_clean_energy_gwh')!r}, expected {energy}"
        )
        assert body.get("annual_co2_avoided_tonnes") == tonnes, (
            f"{need} MW {kind} returned annual_co2_avoided_tonnes "
            f"{body.get('annual_co2_avoided_tonnes')!r}, expected {tonnes}"
        )


def test_the_module_count_rounds_up(anon_client):
    """One megawatt over a whole module buys another whole module."""
    exact = _ok(anon_client.post("/calculator",
                                 json={"need_mw": MODULE_THERMAL_MW, "kind": "thermal"}),
                "POST /calculator at exactly one module").json()
    over = _ok(anon_client.post("/calculator",
                                json={"need_mw": MODULE_THERMAL_MW + 1, "kind": "thermal"}),
               "POST /calculator one megawatt over one module").json()
    assert exact.get("modules_required") == 1, (
        f"a need of exactly one module returned {exact.get('modules_required')!r}"
    )
    assert over.get("modules_required") == 2, (
        f"a need one megawatt over one module returned {over.get('modules_required')!r}"
    )


def test_the_energy_figure_follows_the_modules_built(anon_client):
    """The energy figure is the modules built times the module output, not the need."""
    body = _ok(anon_client.post("/calculator",
                                json={"need_mw": MODULE_THERMAL_MW + 1, "kind": "thermal"}),
               "POST /calculator one megawatt over one module").json()
    expected = 2 * MODULE_THERMAL_MW * ANNUAL_HOURS // 1000
    assert body.get("annual_clean_energy_gwh") == expected, (
        f"the energy figure was {body.get('annual_clean_energy_gwh')!r}, expected "
        f"{expected} from the two modules built"
    )
    assert body.get("annual_co2_avoided_tonnes") == expected * TONNES_PER_GWH, (
        f"the carbon figure was {body.get('annual_co2_avoided_tonnes')!r}, expected "
        f"{expected * TONNES_PER_GWH}"
    )


def test_the_electrical_kind_uses_the_converted_module_output(anon_client):
    """The electrical kind sizes against the converted module output."""
    body = _ok(anon_client.post("/calculator",
                                json={"need_mw": MODULE_ELECTRICAL_MW, "kind": "electrical"}),
               "POST /calculator at exactly one electrical module").json()
    assert body.get("modules_required") == 1, (
        f"a need of one electrical module returned {body.get('modules_required')!r}"
    )
    assert MODULE_ELECTRICAL_MW * 100 == MODULE_THERMAL_MW * CONVERSION_PERCENT, (
        "the pinned electrical output does not follow the pinned conversion"
    )


def test_a_need_of_zero_or_less_is_refused(anon_client):
    """A need of zero, and a negative need, are refused as invalid."""
    for need in (0, -1):
        _refused(anon_client.post("/calculator", json={"need_mw": need, "kind": "thermal"}),
                 f"POST /calculator for a need of {need}")


def test_a_calculator_kind_outside_the_pinned_pair_is_refused(anon_client):
    """A kind the brief does not pin is refused."""
    _refused(anon_client.post("/calculator", json={"need_mw": 250, "kind": "steam"}),
             "POST /calculator with a kind outside the pinned pair")


def test_seven_stories_are_seeded_with_one_featured(db):
    """The story wall is seeded with seven rows and exactly one featured."""
    stored = {str(row.get("slug")) for row in db.stories()}
    assert stored == set(STORY_SLUGS), (
        f"stories holds {sorted(stored)}, expected {sorted(STORY_SLUGS)}"
    )
    featured = [row for row in db.stories() if row.get("featured")]
    assert len(featured) == 1, f"{len(featured)} stories are featured, expected exactly 1"
    assert str(featured[0].get("slug")) == FEATURED_STORY_SLUG, (
        f"the featured story is {featured[0].get('slug')!r}, expected {FEATURED_STORY_SLUG!r}"
    )


def test_the_story_list_pages_three_at_a_time(anon_client):
    """The wall answers one page of three and reports the whole count."""
    response = _ok(anon_client.get("/stories", params={"limit": STORY_PAGE_SIZE, "offset": 0}),
                   "GET /stories for the first page")
    rows = items(response.json())
    assert len(rows) == STORY_PAGE_SIZE, (
        f"the first page returned {len(rows)} stories, expected {STORY_PAGE_SIZE}"
    )
    assert int(response.headers[TOTAL_COUNT_HEADER]) == STORY_COUNT, (
        f"the story list reported {response.headers[TOTAL_COUNT_HEADER]} rows, "
        f"expected {STORY_COUNT}"
    )


def test_the_second_story_page_carries_different_stories(anon_client):
    """Asking for the next page brings stories the first page did not carry."""
    first = items(_ok(anon_client.get("/stories",
                                      params={"limit": STORY_PAGE_SIZE, "offset": 0}),
                      "GET /stories page one").json())
    second = items(_ok(anon_client.get("/stories",
                                       params={"limit": STORY_PAGE_SIZE,
                                               "offset": STORY_PAGE_SIZE}),
                       "GET /stories page two").json())
    first_slugs = {str(row.get("slug")) for row in first}
    second_slugs = {str(row.get("slug")) for row in second}
    assert not (first_slugs & second_slugs), (
        f"the two story pages share {sorted(first_slugs & second_slugs)}"
    )


def test_one_story_answers_with_its_body(anon_client):
    """Opening one story adds the long copy the wall does not carry."""
    body = _ok(anon_client.get(f"/stories/{FEATURED_STORY_SLUG}"),
               f"GET /stories/{FEATURED_STORY_SLUG}").json()
    assert str(body.get("outlet", "")).strip(), (
        "the story response carried no outlet"
    )
    assert str(body.get("body", "")).strip(), (
        "the story response carried an empty body"
    )


def test_three_jobs_are_seeded_with_the_academy_named(anon_client, db):
    """The three seeded jobs answer a stranger, one of them on the academy team."""
    rows = items(_ok(anon_client.get("/jobs"), "GET /jobs").json())
    slugs = sorted(str(row.get("slug")) for row in rows)
    assert slugs == sorted(JOB_SLUGS), (
        f"GET /jobs returned {slugs}, expected {sorted(JOB_SLUGS)}"
    )
    assert len(db.jobs()) == JOB_COUNT, (
        f"the store holds {len(db.jobs())} jobs, expected {JOB_COUNT}"
    )
    teams = {str(row.get("team")) for row in rows}
    assert ACADEMY_TEAM in teams, (
        f"no seeded job names the {ACADEMY_TEAM!r} team: {sorted(teams)}"
    )


def test_the_team_and_offices_answer_a_stranger(anon_client, db):
    """The leaders and the offices are readable with no account."""
    team = items(_ok(anon_client.get("/team"), "GET /team").json())
    offices = items(_ok(anon_client.get("/offices"), "GET /offices").json())
    assert sorted(str(row.get("slug")) for row in team) == sorted(TEAM_SLUGS), (
        f"GET /team returned {sorted(str(r.get('slug')) for r in team)}"
    )
    assert sorted(str(row.get("city")) for row in offices) == sorted(OFFICE_CITIES), (
        f"GET /offices returned {sorted(str(r.get('city')) for r in offices)}"
    )
    assert len(db.team()) == len(TEAM_SLUGS), (
        f"the store holds {len(db.team())} team rows, expected {len(TEAM_SLUGS)}"
    )
    assert len(db.offices()) == len(OFFICE_CITIES), (
        f"the store holds {len(db.offices())} office rows, expected {len(OFFICE_CITIES)}"
    )


def test_the_questions_answer_a_stranger_and_filter(anon_client, db):
    """The common questions are readable with no account and narrow on a query."""
    everything = items(_ok(anon_client.get("/faqs"), "GET /faqs").json())
    assert everything, "GET /faqs returned nothing"
    assert len(everything) == len(db.faqs()), (
        f"GET /faqs returned {len(everything)} rows but the store holds {len(db.faqs())}"
    )
    for row in everything:
        for field in ("question", "answer", "category"):
            assert field in row, f"a GET /faqs row is missing {field!r}: {sorted(row)}"
    category = str(everything[0].get("category"))
    narrowed = items(_ok(anon_client.get("/faqs", params={"category": category}),
                         f"GET /faqs filtered to {category}").json())
    assert narrowed, f"the category filter {category!r} returned nothing"
    assert len(narrowed) <= len(everything), (
        f"the category filter widened the set from {len(everything)} to {len(narrowed)}"
    )
    for row in narrowed:
        assert str(row.get("category")) == category, (
            f"the {category!r} filter returned a row in category {row.get('category')!r}"
        )
    searched = items(_ok(anon_client.get("/faqs", params={"q": "reactor"}),
                         "GET /faqs searched for reactor").json())
    assert len(searched) <= len(everything), (
        f"the plain-language query widened the set from {len(everything)} to {len(searched)}"
    )


def test_content_is_served_from_the_store_not_the_build(anon_client, db):
    """Every content route reconciles row for row with the datastore."""
    stories = items(_ok(anon_client.get("/stories", params={"limit": STORY_COUNT}),
                        "GET /stories").json())
    assert len(stories) == len(db.stories()), (
        f"GET /stories returned {len(stories)} rows but the store holds {len(db.stories())}"
    )
    solutions = items(_ok(anon_client.get("/solutions"), "GET /solutions").json())
    assert len(solutions) == len(db.solutions()), (
        f"GET /solutions returned {len(solutions)} rows but the store holds "
        f"{len(db.solutions())}"
    )


def test_an_application_is_stored_against_its_job(db):
    """Applying stores one row against the caller and the job."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    with client(token) as caller:
        body = _ok(caller.post("/applications", json=application_payload(email)),
                   "POST /applications").json()
    assert str(body.get("status")) in APPLICATION_STATUSES, (
        f"POST /applications returned status {body.get('status')!r}"
    )
    rows = db.applications_for(account.get("id"))
    assert len(rows) == 1, f"applying stored {len(rows)} rows, expected 1"
    assert str(rows[0].get("note", "")).strip(), (
        "the stored application carried an empty note"
    )


def test_applying_twice_to_one_job_updates_the_row(db):
    """A second application to one job updates the row rather than adding one."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    with client(token) as caller:
        _ok(caller.post("/applications",
                        json=application_payload(email, note="The first note.")),
            "the first POST /applications")
        _ok(caller.post("/applications",
                        json=application_payload(email, note="The second note.")),
            "the second POST /applications")
    rows = db.applications_for(account.get("id"))
    assert len(rows) == 1, f"applying twice to one job stored {len(rows)} rows"
    assert str(rows[0].get("note")) == "The second note.", (
        f"the updated application kept the note {rows[0].get('note')!r}"
    )


def test_an_application_to_an_unknown_job_is_refused(db):
    """A job slug that never existed is refused and stores nothing."""
    email = probe_email()
    token = signup(email)
    account = db.account_by_email(email)
    with client(token) as caller:
        response = caller.post("/applications",
                               json=application_payload(email, job_slug="no-such-job"))
    _refused(response, "POST /applications for a job that never existed")
    settle()
    assert db.count_applications(account_id=account.get("id")) == 0, (
        "a refused application still stored a row"
    )


def test_the_caller_reads_only_their_own_applications(db):
    """The application list carries the caller rows and no other account rows."""
    email = probe_email()
    token = signup(email)
    with client(token) as caller:
        _ok(caller.post("/applications", json=application_payload(email)),
            "POST /applications")
        rows = items(_ok(caller.get("/applications"), "GET /applications").json())
    assert len(rows) == 1, f"the caller reads {len(rows)} applications, expected 1"
    assert str(rows[0].get("job_slug")) == JOB_SLUGS[0], (
        f"the caller reads an application for {rows[0].get('job_slug')!r}"
    )


def test_an_enquiry_reaches_the_enquirer_with_its_reference(inbox):
    """The enquiry acknowledgement carries the pinned subject prefix and the reference."""
    email = probe_email()
    with client() as caller:
        reference = str(_ok(caller.post("/enquiries", json=enquiry_payload(email)),
                            "POST /enquiries").json().get("reference"))
    message = poll_message(inbox, email, ENQUIRY_SUBJECT_PREFIX)
    assert message is not None, (
        f"no message reached {email} with a subject beginning {ENQUIRY_SUBJECT_PREFIX!r}"
    )
    assert message.subject.startswith(f"{ENQUIRY_SUBJECT_PREFIX} {reference}"), (
        f"the enquiry message subject was {message.subject!r}, expected "
        f"{ENQUIRY_SUBJECT_PREFIX!r} then a space then {reference}"
    )


def test_the_enquiry_message_reaches_that_address_alone(inbox):
    """The acknowledgement is addressed to the enquirer and nobody else."""
    email = probe_email()
    with client() as caller:
        _ok(caller.post("/enquiries", json=enquiry_payload(email)), "POST /enquiries")
    message = poll_message(inbox, email, ENQUIRY_SUBJECT_PREFIX)
    assert message is not None, f"no enquiry message reached {email}"
    assert len(message.to) == 1, (
        f"the enquiry message was addressed to {message.to}, expected one recipient"
    )
    assert email.lower() in message.to[0].lower(), (
        f"the enquiry message was addressed to {message.to[0]!r}, expected {email}"
    )


def test_the_enquiry_body_carries_the_topic_and_the_reference(inbox):
    """The acknowledgement body names the topic and repeats the reference."""
    email = probe_email()
    with client() as caller:
        reference = str(_ok(caller.post("/enquiries",
                                        json=enquiry_payload(email, topic="Suppliers")),
                            "POST /enquiries").json().get("reference"))
    message = poll_message(inbox, email, ENQUIRY_SUBJECT_PREFIX)
    assert message is not None, f"no enquiry message reached {email}"
    combined = f"{message.subject}\n{message.body}"
    assert reference in combined, (
        f"the enquiry message never repeats the reference {reference}: {combined[:300]!r}"
    )
    assert "Suppliers" in combined, (
        f"the enquiry message never names the topic: {combined[:300]!r}"
    )


def test_an_access_request_reaches_the_requester(inbox):
    """The access request notice carries the pinned subject prefix and the reference."""
    email = probe_email()
    token = signup(email)
    with client(token) as caller:
        reference = str(_ok(caller.post("/access-request",
                                        json=request_payload("Probe Mail Capital")),
                            "POST /access-request").json().get("reference"))
    message = poll_message(inbox, email, REQUEST_SUBJECT_PREFIX)
    assert message is not None, (
        f"no message reached {email} with a subject beginning {REQUEST_SUBJECT_PREFIX!r}"
    )
    assert message.subject.startswith(f"{REQUEST_SUBJECT_PREFIX} {reference}"), (
        f"the access request subject was {message.subject!r}, expected "
        f"{REQUEST_SUBJECT_PREFIX!r} then a space then {reference}"
    )
    assert "Probe Mail Capital" in f"{message.subject}\n{message.body}", (
        "the access request message never names the organisation"
    )


def test_an_application_reaches_the_applicant_with_the_job_title(inbox):
    """The application acknowledgement names the job in its subject and its body."""
    email = probe_email()
    token = signup(email)
    with client(token) as caller:
        _ok(caller.post("/applications", json=application_payload(email)),
            "POST /applications")
    message = poll_message(inbox, email, APPLICATION_SUBJECT_PREFIX)
    assert message is not None, (
        f"no message reached {email} with a subject beginning "
        f"{APPLICATION_SUBJECT_PREFIX!r}"
    )
    assert message.subject.startswith(f"{APPLICATION_SUBJECT_PREFIX} {JOB_TITLE}"), (
        f"the application subject was {message.subject!r}, expected "
        f"{APPLICATION_SUBJECT_PREFIX!r} then a space then {JOB_TITLE!r}"
    )
    assert JOB_LOCATION in f"{message.subject}\n{message.body}", (
        f"the application message never names the location {JOB_LOCATION!r}"
    )


def test_saving_and_calculating_send_no_mail(inbox):
    """Saving a solution, saving a search and calculating leave the inbox untouched."""
    email = probe_email()
    token = signup(email)
    before = inbox.count(email)
    with client(token) as caller:
        _ok(caller.post("/saves", json={"solution_slug": SAVED_SLUG_A}), "POST /saves")
        _ok(caller.post("/searches", json=search_payload(probe_name("Probe Quiet"))),
            "POST /searches")
        _ok(caller.post("/calculator", json={"need_mw": 250, "kind": "thermal"}),
            "POST /calculator")
    settle()
    assert inbox.count(email) == before, (
        f"{email} received {inbox.count(email) - before} messages from actions that "
        f"send none"
    )


def test_closing_an_enquiry_sends_no_mail(inbox):
    """Closing an enquiry sends nothing beyond the acknowledgement already sent."""
    email = probe_email()
    token = signup(email)
    with client(token) as caller:
        created = _ok(caller.post("/enquiries", json=enquiry_payload(email)),
                      "POST /enquiries").json()
        settle()
        before = inbox.count(email)
        _ok(caller.post(f"/enquiries/{created['id']}/close"), "closing an own enquiry")
    settle()
    assert inbox.count(email) == before, (
        f"closing an enquiry sent {inbox.count(email) - before} extra messages"
    )
