UPDATE GENERIC_STORAGE
SET DATA = jsonb_set(DATA, '{status}', '"IKKE_RELEVANT_FERDIG_DOKUMENTERT"', false ) WHERE TYPE = 'Krav' AND DATA ->> 'status' = 'IKKE_RELEVANT'